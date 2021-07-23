import * as aws from 'aws-sdk';

const lambda = new aws.Lambda();

const INVOKE_LAMBDA_ARN = process.env.INVOKE_LAMBDA_ARN || "arn:aws:lambda:us-east-1:594518549660:function:target";

const handler  = async () => {
  const params = {
    FunctionName: INVOKE_LAMBDA_ARN,
  };
  const res = await lambda.invoke(params).promise();

  console.log(res);

  return 'ok - source lambda';
}

exports.handler = handler;
handler();
