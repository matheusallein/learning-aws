import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { existsSync } from "fs";
import { join } from "path";
import { getSuffixFromStack } from "../utils";


export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    const destinationBucket = new Bucket(this, "SpacesFrontendBucket", {
      bucketName: `spaces-frontend-${suffix}`,
    });

    const frontendBuildDir = join(__dirname, "..", "..", "frontend", "dist");
    if (!existsSync(frontendBuildDir)) {
      console.warn("[WARNING] FRONTENDSTACK:::MISSING_DIR:", frontendBuildDir);
      return;
    }

    new BucketDeployment(this, "SpacesFrontendBucketDeployment", {
      destinationBucket,
      sources: [Source.asset(frontendBuildDir)],
    });

    const originIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    
    destinationBucket.grantRead(originIdentity);

    const distribution = new Distribution(this, "SpacesFrontendDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(destinationBucket, {
          originAccessIdentity: originIdentity,
        }),
      },
    });

    new CfnOutput(this, "SpacesFrontendS3Url", {
      value: distribution.distributionDomainName,
    });
  }
}
