import { App } from "aws-cdk-lib";
import {
  DataStack,
  LambdaStack,
  APIStack,
  AuthStack,
  FrontendStack,
} from './stacks';

const app = new App();
const dataStack = new DataStack(app, 'DataStack');
const authStack = new AuthStack(app, 'AuthStack', { photosBucket: dataStack.photosBucket });
const lambdaStack = new LambdaStack(app, 'LambdaStack', { spacesTable: dataStack.spacesTable });
new APIStack(app, 'APIStack', {
  spacesLambdaIntegration: lambdaStack.spacesLambdaIntegration,
  userPool: authStack.userPool
});
new FrontendStack(app, 'FrontendStack');