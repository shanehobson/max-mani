import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import {
  DynamoDBClient,
  UpdateItemCommand,
  ConditionalCheckFailedException,
} from "@aws-sdk/client-dynamodb";
import { z } from "zod";

const ses = new SESv2Client({});
const ddb = new DynamoDBClient({});

const TO_EMAIL = process.env.TO_EMAIL!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE!;

const IP_WINDOW_SECONDS = 10 * 60;
const IP_MAX_PER_WINDOW = 5;

const baseSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
  website: z.string().optional(),
});

const contactSchema = baseSchema.extend({
  kind: z.literal("contact"),
  phone: z.string().min(7).max(40),
});

const testimonialSchema = baseSchema.extend({
  kind: z.literal("testimonial"),
});

const payloadSchema = z.discriminatedUnion("kind", [
  contactSchema,
  testimonialSchema,
]);

interface FunctionUrlEvent {
  requestContext?: {
    http?: { method?: string; sourceIp?: string };
  };
  headers?: Record<string, string | undefined>;
  body?: string | null;
  isBase64Encoded?: boolean;
}

interface FunctionUrlResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function json(
  statusCode: number,
  body: Record<string, unknown>,
): FunctionUrlResponse {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function checkRateLimit(sourceIp: string): Promise<boolean> {
  const nowSec = Math.floor(Date.now() / 1000);
  const window = Math.floor(nowSec / IP_WINDOW_SECONDS);
  const pk = `ip#${sourceIp}#${window}`;
  const ttl = (window + 1) * IP_WINDOW_SECONDS + 60;

  try {
    await ddb.send(
      new UpdateItemCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: { pk: { S: pk } },
        UpdateExpression:
          "SET #ttl = if_not_exists(#ttl, :ttl) ADD #c :one",
        ConditionExpression: "attribute_not_exists(#c) OR #c < :max",
        ExpressionAttributeNames: { "#c": "count", "#ttl": "ttl" },
        ExpressionAttributeValues: {
          ":one": { N: "1" },
          ":max": { N: String(IP_MAX_PER_WINDOW) },
          ":ttl": { N: String(ttl) },
        },
      }),
    );
    return true;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return false;
    console.error("rate_limit_check_failed", err);
    return true;
  }
}

export async function handler(event: FunctionUrlEvent): Promise<FunctionUrlResponse> {
  const method = event.requestContext?.http?.method ?? "POST";

  if (method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const sourceIp = event.requestContext?.http?.sourceIp;
  if (sourceIp) {
    const allowed = await checkRateLimit(sourceIp);
    if (!allowed) {
      return json(429, { error: "rate_limited" });
    }
  }

  let parsedBody: unknown;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body ?? "", "base64").toString("utf8")
      : event.body ?? "";
    parsedBody = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const result = payloadSchema.safeParse(parsedBody);
  if (!result.success) {
    return json(400, { error: "invalid_payload" });
  }

  const payload = result.data;

  if (payload.website && payload.website.trim().length > 0) {
    return json(200, { ok: true });
  }

  const subject =
    payload.kind === "contact"
      ? `Max Mani — new contact from ${payload.name}`
      : `Max Mani — new testimonial from ${payload.name}`;

  const lines: string[] = [
    `Type: ${payload.kind}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
  ];
  if (payload.kind === "contact") lines.push(`Phone: ${payload.phone}`);
  lines.push("", payload.message);
  const text = lines.join("\n");

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: FROM_EMAIL,
        Destination: { ToAddresses: [TO_EMAIL] },
        ReplyToAddresses: [payload.email],
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: { Text: { Data: text, Charset: "UTF-8" } },
          },
        },
      }),
    );
  } catch (err) {
    console.error("ses_send_failed", err);
    return json(502, { error: "send_failed" });
  }

  return json(200, { ok: true });
}
