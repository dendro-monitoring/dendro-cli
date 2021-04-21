import * as path from 'path';
import AWSWrapper from '..';
import store from '../../store';
import { AWS_TIMESTREAM_DATABASE_NAME, AWS_S3_BUCKET_NAME } from '../../constants';

const PATH_TO_LAMBDA_FUNCTION = path.resolve(`${__dirname}/../lambda/_deployableLambdaFunction.js`);

export default function setupLambda(): Promise<void> {
  return new Promise( resolve => {
    AWSWrapper.createLambda({
      lambdaFile: PATH_TO_LAMBDA_FUNCTION,
      Role: store.AWS.IAM.Arn,
      DATABASE_NAME: AWS_TIMESTREAM_DATABASE_NAME,
    } as any).then( async (lambdaData) => {

      if (!lambdaData) {
        const funcs = await AWSWrapper.listFunctions();
        store.AWS.Lambda.FunctionArn = funcs.Functions.find( (func: { FunctionName: string}) => path.basename(PATH_TO_LAMBDA_FUNCTION) === `${func.FunctionName}.js`).FunctionArn;
        return resolve();
      }
      AWSWrapper.setLambdaInvokePolicy(lambdaData.FunctionArn).then( async () => {
        store.AWS.Lambda.FunctionArn = lambdaData.FunctionArn;
        await AWSWrapper.createS3LambdaTrigger(AWS_S3_BUCKET_NAME, store.AWS.Lambda.FunctionArn!);
        resolve();
      });
    });
  });
}

