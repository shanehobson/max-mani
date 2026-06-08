import {
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ses from "aws-cdk-lib/aws-ses";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";

export interface SiteStackProps extends StackProps {
  domainName: string;
  hostedZoneId: string;
  siteDistPath: string;
  sendingDomain: string;
  fromEmail: string;
  toEmail: string;
}

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const {
      domainName,
      hostedZoneId,
      siteDistPath,
      sendingDomain,
      fromEmail,
      toEmail,
    } = props;
    const wwwDomain = `www.${domainName}`;
    const apexUrl = `https://${domainName}`;
    const wwwUrl = `https://${wwwDomain}`;

    const hostedZone = route53.PublicHostedZone.fromPublicHostedZoneAttributes(
      this,
      "HostedZone",
      { hostedZoneId, zoneName: domainName },
    );

    const bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const certificate = new acm.Certificate(this, "SiteCertificate", {
      domainName,
      subjectAlternativeNames: [wwwDomain],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const emailIdentity = new ses.EmailIdentity(this, "SiteEmailIdentity", {
      identity: ses.Identity.publicHostedZone(hostedZone),
      mailFromDomain: `mail.${sendingDomain}`,
    });

    new route53.TxtRecord(this, "DmarcRecord", {
      zone: hostedZone,
      recordName: `_dmarc.${sendingDomain}`,
      values: [
        "v=DMARC1; p=quarantine; rua=mailto:hobsonwebsolutions@gmail.com; adkim=s; aspf=s; pct=100",
      ],
    });

    const prettyUrlFunction = new cloudfront.Function(this, "PrettyUrlFunction", {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var req = event.request;
  var uri = req.uri;
  if (uri.endsWith('/')) {
    req.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    req.uri = uri + '/index.html';
  }
  return req;
}
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultRootObject: "index.html",
      domainNames: [domainName, wwwDomain],
      certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        functionAssociations: [
          {
            function: prettyUrlFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
      ],
    });

    const zaeraStripPrefix = new cloudfront.Function(this, "ZaeraStripPrefix", {
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var req = event.request;
  req.uri = req.uri.replace(/^\\/api\\/zaera/, '');
  return req;
}
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    distribution.addBehavior(
      "/api/zaera/*",
      new origins.HttpOrigin("api.zaera.io", {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }),
      {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy:
          cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        compress: true,
        functionAssociations: [
          {
            function: zaeraStripPrefix,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
    );

    new route53.ARecord(this, "AliasApex", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
    });
    new route53.AaaaRecord(this, "AliasApexAaaa", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
    });
    new route53.ARecord(this, "AliasWww", {
      zone: hostedZone,
      recordName: wwwDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
    });
    new route53.AaaaRecord(this, "AliasWwwAaaa", {
      zone: hostedZone,
      recordName: wwwDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
    });

    new s3deploy.BucketDeployment(this, "DeploySite", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "..", siteDistPath))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
      prune: true,
    });

    const rateLimitTable = new dynamodb.Table(this, "ContactRateLimitTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const contactFn = new NodejsFunction(this, "ContactFunction", {
      entry: path.join(__dirname, "..", "lambda", "contact", "handler.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        TO_EMAIL: toEmail,
        FROM_EMAIL: fromEmail,
        RATE_LIMIT_TABLE: rateLimitTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: false,
        target: "node20",
        externalModules: [
          "@aws-sdk/client-sesv2",
          "@aws-sdk/client-dynamodb",
        ],
      },
    });

    rateLimitTable.grantReadWriteData(contactFn);

    contactFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [
          emailIdentity.emailIdentityArn,
          `arn:aws:ses:${this.region}:${this.account}:identity/${toEmail}`,
        ],
      }),
    );

    const fnUrl = contactFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: [apexUrl, wwwUrl, "http://localhost:4321"],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ["content-type"],
        maxAge: Duration.hours(1),
      },
    });

    new CfnOutput(this, "ContactFunctionUrl", {
      value: fnUrl.url,
      description:
        "Paste into LAMBDA_SUBMIT_URL in src/lib/config.ts, then rebuild and redeploy.",
    });
    new CfnOutput(this, "DistributionId", { value: distribution.distributionId });
    new CfnOutput(this, "SiteBucketName", { value: bucket.bucketName });
  }
}
