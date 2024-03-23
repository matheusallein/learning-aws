import { type CognitoUser } from '@aws-amplify/auth'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { Amplify, Auth } from 'aws-amplify';

const AWS_REGION = 'us-east-1';

const AMPLIFY_AUTH = {
  region: AWS_REGION,
  userPoolId: 'us-east-1_282RC0lkz',
  userPoolWebClientId: 'e8qe8ose4u23t75ms8r07lnnb',
  authenticationFlowType: 'USER_PASSWORD_AUTH',
  identityPoolId: 'us-east-1:7dd79660-310e-445d-803c-3e7995685d71'
}

Amplify.configure({ Auth: AMPLIFY_AUTH });

export class AuthService {
  public async login(username: string, password: string): Promise<CognitoUser> {
    const result = await Auth.signIn(username, password) as CognitoUser;
    return result;
  }

  public async generateTemporaryCredentials(user: CognitoUser) {
    const token = await user.getSignInUserSession().getIdToken().getJwtToken();
    const cognitoIdentityPool = `cognito-idp.${AWS_REGION}.amazonaws.com/${AMPLIFY_AUTH.userPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({ 
      credentials: fromCognitoIdentityPool({
        identityPoolId: AMPLIFY_AUTH.identityPoolId,
        logins: {
          [cognitoIdentityPool]: token
        }
      })
     });

    return await cognitoIdentity.config.credentials();
  }
}