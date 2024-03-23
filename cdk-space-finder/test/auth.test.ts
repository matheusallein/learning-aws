import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { AuthService } from './auth.service';

async function testAuthServiceLogin() {
  const authService = new AuthService();
  const login = await authService.login(process.env.username, process.env.password);
  console.log('JWT', await login.getSignInUserSession().getIdToken().getJwtToken());
  const credentials = await authService.generateTemporaryCredentials(login);
  console.log('credentials', credentials)
  const buckets = await listBuckets(credentials);
  console.log('buckets', buckets);
  return login.getSignInUserSession().getAccessToken().getJwtToken();
}

async function listBuckets(credentials: any) {
  const client = new S3Client({ credentials });
  const command = new ListBucketsCommand({});
  const result = await client.send(command);
  return result;
}

testAuthServiceLogin();