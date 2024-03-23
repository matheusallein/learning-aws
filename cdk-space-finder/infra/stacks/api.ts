import { Stack, StackProps } from 'aws-cdk-lib'
import { AuthorizationType, CognitoUserPoolsAuthorizer, LambdaIntegration, MethodOptions, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface APIStackProps extends StackProps {
  spacesLambdaIntegration: LambdaIntegration,
  userPool: IUserPool
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'SpacesApi')

    const authorizer = new CognitoUserPoolsAuthorizer(this, 'SpacesAuthorizer', {
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization'
    });

    authorizer._attachToApi(api);
    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: { authorizerId: authorizer.authorizerId }
    }

    const optionsWithCORS: ResourceOptions = {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    }

    const spacesResource = api.root.addResource('spaces', optionsWithCORS);
    ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
      spacesResource.addMethod(method, props.spacesLambdaIntegration, optionsWithAuthorizer);
    });
  }
}