import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { get, post, update, remove } from "./methods";

const dynamoClient = new DynamoDBClient({});
const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoClient);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  console.log('[INFO:::HANDLER] Event:', JSON.stringify(event, null, 2))

  try {
    switch (event.httpMethod) {
      case 'GET':
        return get(event, dynamoDocumentClient);
      case 'POST':
        return post(event, dynamoDocumentClient);
      case 'PUT':
        return update(event, dynamoDocumentClient);
      case 'DELETE':
        return remove(event, dynamoDocumentClient);
      default:
        console.log('[ERROR:::HANDLER]:', 'Method Not Allowed');
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.log('[ERROR:::HANDLER]:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}