import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { AttributeType, Table as DynamoDBTable, ITable as IDynamoDBTable } from 'aws-cdk-lib/aws-dynamodb';
import { getSuffixFromStack } from '../utils';
import { Bucket, BucketAccessControl, HttpMethods, IBucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3';

export class DataStack extends Stack {
  public readonly spacesTable: IDynamoDBTable;
  public readonly photosBucket: IBucket;
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    this.spacesTable = new DynamoDBTable(this, 'SpacesTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: `SpacesTable-${suffix}`
    });

    this.photosBucket = new Bucket(this, 'PhotosBucket', {
      bucketName: `spaces-photos-bucket-${suffix}`,
      cors: [{
        allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.HEAD],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      
    });

    new CfnOutput(this, 'SpacePhotosBucketName', {
      value: this.photosBucket.bucketName,
    });
  }
}