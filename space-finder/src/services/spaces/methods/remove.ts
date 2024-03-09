import { DynamoDBDocumentClient, DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function remove(event: APIGatewayProxyEvent, dynamoDocumentClient: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
  const { id } = event.queryStringParameters || {};

  if(!id) {
    console.log('[ERROR:::DELETE]:', 'Invalid input');

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid input',
      }),
    }
  }

  const command: DeleteCommandInput = {
    TableName: process.env.TABLE_NAME,
    Key: { id },
  }

  const result = await dynamoDocumentClient.send(new DeleteCommand(command));
  console.log('[INFO:::DELETE] Result:', result);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Space removed successfully',
    }),
  }
}