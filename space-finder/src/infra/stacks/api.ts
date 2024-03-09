import { Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

interface APIStackProps extends StackProps {
  spacesLambdaIntegration: LambdaIntegration
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'SpacesApi')
    const spacesResource = api.root.addResource('spaces');
    [ 'GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
      spacesResource.addMethod(method, props.spacesLambdaIntegration);
    });
  }
}