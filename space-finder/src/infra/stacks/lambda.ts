import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { ITable as IDynamoDBTable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';


interface LambdaStackProps extends StackProps {
  spacesTable: IDynamoDBTable;
}

export class LambdaStack extends Stack {

  public readonly spacesLambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
      entry: join(__dirname, '..','..', 'services', 'spaces', 'handler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: props.spacesTable.tableName
      }
    });

    spacesLambda.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:PutItem', 'dynamodb:Scan', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
      resources: [props.spacesTable.tableArn],
    }))
    this.spacesLambdaIntegration = new LambdaIntegration(spacesLambda);
  }
}