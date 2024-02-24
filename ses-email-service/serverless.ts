import type { AWS } from "@serverless/typescript";
import createContact from "@functions/create-contact";

const serverlessConfiguration: AWS = {
  service: "ses-email-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-s3-sync"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "ses:*",
            Resource: "*",
          },
        ],
      },
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000"
    }
  },
  functions: { createContact },
  package: { individually: true },
  custom: {
    bucketName: 'ses-email-service-bucket',
    s3Sync: [{
      bucketName: "${self:custom.bucketName}",
      localDir: "frontend/dist",
      deleteRemoved: true
    }],
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ReactAppBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:custom.bucketName}",
          // AccessControl: "PublicRead",
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
          },
          OwnershipControls: {
            Rules: [{
              ObjectOwnership: "ObjectWriter" 
            }]
          },
          WebsiteConfiguration: {
            IndexDocument: "index.html",
            ErrorDocument: "index.html",
          }
        }
      },
      S3AccessPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: {
            Ref: "ReactAppBucket",
          },
          PolicyDocument: {
            Statement: [
              {
                Sid: "PublicReadGetObject",
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: "arn:aws:s3:::${self:custom.bucketName}/*",
              },
            ],
          },
        },
      },
      CloudFrontDistribution: {
        Type: "AWS::CloudFront::Distribution",
        Properties: {
          DistributionConfig: {
            Origins: [
              {
                DomainName: "${self:custom.bucketName}.s3.amazonaws.com",
                Id: "ReactApp",
                CustomOriginConfig: {
                  HTTPPort: 80,
                  HTTPSPort: 443,
                  OriginProtocolPolicy: "http-only",
                },
              },
            ],
            Enabled: true,
            DefaultRootObject: "index.html",
            CustomErrorResponses: [
              {
                ErrorCode: 404,
                ResponseCode: 200,
                ResponsePagePath: "/index.html",
              },
            ],
            DefaultCacheBehavior: {
              TargetOriginId: "ReactApp",
              ViewerProtocolPolicy: "redirect-to-https",
              AllowedMethods: ["GET", "HEAD", "OPTIONS"],
              CachedMethods: ["GET", "HEAD", "OPTIONS"],
              Compress: true,
              ForwardedValues: {
                QueryString: false,
                Cookies: {
                  Forward: "none",
                },
              },
              MinTTL: 0,
              DefaultTTL: 86400,
              MaxTTL: 31536000,
            },
            ViewerCertificate: {
              CloudFrontDefaultCertificate: true,
            }
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
