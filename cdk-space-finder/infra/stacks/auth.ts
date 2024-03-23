import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { Effect, FederatedPrincipal, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface AuthStackProps extends StackProps {
  photosBucket: IBucket;
}

export class AuthStack extends Stack {
  public userPool: UserPool;
  private userPoolClient: UserPoolClient;
  private identityPool: CfnIdentityPool;
  private authenticatedRole: Role;
  private unauthenticatedRole: Role;
  private adminRole: Role;
  
  private createUserPool() {
    this.userPool = new UserPool(this, "SpaceUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    });

    new CfnOutput(this, "SpaceUserPoolId", {
      value: this.userPool.userPoolId,
    });
  }
  private createUserPoolClient() {
    this.userPoolClient = this.userPool.addClient("SpaceUserPoolClient", {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });
    new CfnOutput(this, "SpaceUserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }

  private createAdminGroup() {
    new CfnUserPoolGroup(this, "SpaceAdmin", {
      userPoolId: this.userPool.userPoolId,
      groupName: "admins",
      roleArn: this.adminRole.roleArn,
    });
  }

  private createIdentityPool() {
    this.identityPool = new CfnIdentityPool(this, "SpaceIdentityPool", {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });
    new CfnOutput(this, "SpaceIdentityPoolId", {
      value: this.identityPool.ref,
    });
  }

  private createRole(roleId: string, authenticatedMethodReference: string): Role {
    return new Role(this, roleId, {
      assumedBy: new FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": authenticatedMethodReference,
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    })
  }

  private createRoles(photosBucket: IBucket) {
    this.authenticatedRole = this.createRole("CognitoDefaultAuthenticatedRole", "authenticated");
    this.unauthenticatedRole = this.createRole("CognitoDefaultUnauthenticatedRole", "unauthenticated");
    this.adminRole = this.createRole("CognitoDefaultAdminRole", "authenticated");
    this.adminRole.grant(this.authenticatedRole, "sts:AssumeRole");
    this.adminRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:PutObjectAcl',
        's3:GetObjectAcl',
      ],
      resources: [`${photosBucket.bucketArn}/*`],
    }));
  }

  private attachRoles() {
    new CfnIdentityPoolRoleAttachment(this, 'SpaceIdentityPoolRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.unauthenticatedRole.roleArn,
      },
      roleMappings: {
        adminsMapping: {
          type: 'Token',
          ambiguousRoleResolution: 'AuthenticatedRole',
          identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`,
        },
      }
    });
  }

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.createUserPool();
    this.createUserPoolClient();
    this.createIdentityPool();
    this.createRoles(props.photosBucket);
    this.attachRoles();
    this.createAdminGroup();
  }
}
