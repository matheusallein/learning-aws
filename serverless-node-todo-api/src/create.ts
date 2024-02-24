import { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { addTodo } from "./utils";

export const handler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
) => {
  console.log("[INFO] Event: ", event);

  const { todo } = JSON.parse(event.body);

  if (typeof todo !== "string") {
    console.error("[ERROR] Validation Failed: ", { todo });
    return;
  }

  const response = await addTodo(todo);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
