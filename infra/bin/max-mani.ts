#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SiteStack } from "../lib/site-stack";
import { localConfig } from "../config.local";

const app = new cdk.App();

new SiteStack(app, "MaxManiSite", {
  env: {
    account: localConfig.account,
    region: "us-east-1",
  },
  domainName: "maxmanicure.com",
  hostedZoneId: localConfig.hostedZoneId,
  siteDistPath: "../dist",
  sendingDomain: localConfig.sendingDomain,
  fromEmail: localConfig.fromEmail,
  toEmail: localConfig.toEmail,
});
