import { APIGatewayProxyEvent } from 'aws-lambda';

export function isAdmin(event: APIGatewayProxyEvent) {
  const groups = event.requestContext.authorizer?.claims['cognito:groups'];
  if (!groups) return false;
  return groups.includes('admins');
}