import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from "@aws-sdk/client-ses";

const sesClient = new SESClient();

const createContact: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  console.log("[INFO] Event: ", event);
  const { to, from, subject, message } = event.body;

  if (!to || !from || !message) {
    console.log("[ERROR] Bad request", event.body);
    return formatJSONResponse(400, { message: "Bad request" });
  }

  const params: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Data: message,
        },
      },
      Subject: {
        Data: subject || "[Default Subject] New contact from your website!",
      },
    },
    Source: from,
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    return formatJSONResponse(200, { message: "Contact created" });
  } catch (error) {
    console.log("[ERROR] Failed to send email", error);
    return formatJSONResponse(500, { message: "Failed to send email" });
  }
};

export const main = middyfy(createContact);
