import { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { updateTodo } from "./utils";

export const handler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
) => {
  console.log("[INFO] Event: ", event);

  const { id } = event.pathParameters;
  const { checked } = JSON.parse(event.body);

  if (typeof id !== "string" || typeof checked !== "boolean") {
    console.error("[ERROR] Validation Failed: ", { id, checked });
    return;
  }

  const response = await updateTodo(id, checked);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
