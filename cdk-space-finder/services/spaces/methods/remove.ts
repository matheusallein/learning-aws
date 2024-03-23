import { DynamoDBDocumentClient, DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isAdmin } from "../../utils";

export async function remove(event: APIGatewayProxyEvent, dynamoDocumentClient: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
  const isAuthorized = isAdmin(event);
  if(!isAuthorized) {
    console.log('[ERROR:::DELETE]:', 'Unauthorized');

    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Unauthorized',
      }),
    }
  }

  const { id } = event.queryStringParameters || {};

  if(!id) {
    console.log('[ERROR:::DELETE]:', 'Invalid input');

    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Space removed successfully',
    }),
  }
}