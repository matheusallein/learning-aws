import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isAdmin } from "../../utils";

export async function update(event: APIGatewayProxyEvent, dynamoDocumentClient: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
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

  const { id, location } = JSON.parse(event.body);

  if(!id || !location) {
    console.log('[ERROR:::PUT]:', 'Invalid input');

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

  const command: UpdateCommandInput = {
    TableName: process.env.TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #locat = :location, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#locat': 'location',
    },
    ExpressionAttributeValues: {
      ':location': location,
      ':updatedAt': new Date().toISOString(),
    },
  }

  const result = await dynamoDocumentClient.send(new UpdateCommand(command));

  console.log('[INFO:::PUT] Result:', result);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Space updated successfully',
    }),
  }
}