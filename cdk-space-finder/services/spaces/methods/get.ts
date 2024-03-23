import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function get(event: APIGatewayProxyEvent, dynamoDocumentClient: DynamoDBDocumentClient): Promise<APIGatewayProxyResult> {
  let command: ScanCommandInput; 
  const { id } = event.queryStringParameters || {};

  if(id) {
    console.log('[INFO:::GET] ID:', id);
    command = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: { ':id':  id }
    }
  } else {
    console.log('[INFO:::GET] LIST');
    command = {
      TableName: process.env.TABLE_NAME
    }
  }

  const result = await dynamoDocumentClient.send(new ScanCommand(command));

  console.log('[INFO:::GET] Result:', result);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(result.Items),
  }
}