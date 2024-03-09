import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { AttributeType, Table as DynamoDBTable, ITable as IDynamoDBTable } from 'aws-cdk-lib/aws-dynamodb';
import { getSuffixFromStack } from '../utils';

export class DataStack extends Stack {
  public readonly spacesTable: IDynamoDBTable;
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    this.spacesTable = new DynamoDBTable(this, 'SpacesTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: `SpacesTable-${suffix}`
    });
  }
}