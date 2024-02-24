import { DynamoDBStreamHandler } from "aws-lambda";
import { listTodo } from "./utils";

export const handler: DynamoDBStreamHandler = async () => {
  const response = await listTodo();

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
