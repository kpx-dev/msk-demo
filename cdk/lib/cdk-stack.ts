import * as cdk from '@aws-cdk/core';
import * as msk from '@aws-cdk/aws-msk';
import * as ec2 from "@aws-cdk/aws-ec2"
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpc', {
      cidr: "172.30.0.0/16"
    });

    const mskCluster = new msk.Cluster(this, 'msk', {
      clusterName: 'msk-demo',
      kafkaVersion: msk.KafkaVersion.V2_8_0,
      vpc
    });

    // const targetLambda = new lambda.Function(this, 'target-lambda', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   handler: 'app.handler',
    //   timeout: cdk.Duration.seconds(10),
    //   code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'dist', 'target-invoke-lambda')),
    // });

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
