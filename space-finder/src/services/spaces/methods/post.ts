import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";


export async function post(event: APIGatewayProxyEvent, dynamoDocumentClient: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
  const uuid = randomUUID();

  const { location } = JSON.parse(event.body);

  const command: PutCommandInput = {
    TableName: process.env.TABLE_NAME,
    Item: {
      id: uuid,
      location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  const result = await dynamoDocumentClient.send(new PutCommand(command));

  console.log('[INFO:::POST] Result:', result);

  return {
    statusCode: 201,
    body: JSON.stringify({
      id: uuid,
    }),
  }
}