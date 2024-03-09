import { App } from "aws-cdk-lib";
import { DataStack } from './stacks/data';
import { LambdaStack } from "./stacks/lambda";
import { APIStack } from "./stacks/api";

const app = new App();
const dataStack = new DataStack(app, 'DataStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack', { spacesTable: dataStack.spacesTable });
new APIStack(app, 'APIStack', { spacesLambdaIntegration: lambdaStack.spacesLambdaIntegration });