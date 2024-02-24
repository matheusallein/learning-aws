import { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { getTodo } from "./utils";

export const handler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
) => {
  console.log("[INFO] Event: ", event);

  const { id } = event.pathParameters;

  if (typeof id !== "string") {
    console.error("[ERROR] Validation Failed: ", { id });
    return;
  }

  const response = await getTodo(id);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
