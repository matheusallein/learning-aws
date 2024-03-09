import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function update(event: APIGatewayProxyEvent, dynamoDocumentClient: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
  const { id, location } = JSON.parse(event.body);

  if(!id || !location) {
    console.log('[ERROR:::PUT]:', 'Invalid input');

    return {
      statusCode: 400,
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
    body: JSON.stringify({
      message: 'Space updated successfully',
    }),
  }
}