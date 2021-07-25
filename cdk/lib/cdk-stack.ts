import * as cdk from '@aws-cdk/core';
import * as msk from '@aws-cdk/aws-msk';
import * as ec2 from "@aws-cdk/aws-ec2"
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as secrets from "@aws-cdk/aws-secretsmanager";
import * as rds from "@aws-cdk/aws-rds";
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpc', {
      cidr: "172.30.0.0/16"
    });

    let lambdaSG = new ec2.SecurityGroup(this, 'lambda-sg', {
      vpc
    });
    let dbSG = new ec2.SecurityGroup(this, 'Proxy to DB Connection', {
      vpc
    });
    dbSG.addIngressRule(dbSG, ec2.Port.tcp(3306), 'allow db connection');
    dbSG.addIngressRule(lambdaSG, ec2.Port.tcp(3306), 'allow lambda connection');

    const mskCluster = new msk.Cluster(this, 'msk', {
      clusterName: 'msk-demo',
      kafkaVersion: msk.KafkaVersion.V2_8_0,
      vpc
    });

    const dbSecret = new secrets.Secret(this, 'rds-proxy-secret', {
      secretName: `${id}-rds-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'admin',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });

    const auroraCluster = new rds.DatabaseCluster(this, 'aurora-mysql-db', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_09_2 }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      instanceProps: {
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE,
        },
        vpc,
        securityGroups: [dbSG]
      },
    });

    const rdsProxy = auroraCluster.addProxy('rds-proxy', {
      secrets: [dbSecret],
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      securityGroups: [dbSG]
    });

    const dbProxyLambda = new lambda.Function(this, 'db-proxy-lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'app.handler',
      timeout: cdk.Duration.seconds(30),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'dist', 'db-proxy-lambda')),
      securityGroups: [lambdaSG],
      vpc: vpc,
      environment: {
        PROXY_ENDPOINT: rdsProxy.endpoint,
        RDS_SECRET_NAME: `${id}-rds-credentials`
      },
    });
    rdsProxy.grantConnect(dbProxyLambda);
    dbSecret.grantRead(dbProxyLambda);

    // const sourceLambda = new lambda.Function(this, 'source-lambda', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   handler: 'source-invoke-lambda/app.handler',
    //   environment: {
    //     INVOKE_LAMBDA_ARN: targetLambda.functionArn
    //   },
    //   code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'src')),
    //   deadLetterQueue: new sqs.Queue(this, 'dlq', {
    //     queueName: 'lambda-dlq',
    //   })
    // });


  }
}
