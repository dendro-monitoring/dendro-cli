import fs = require('fs');

import path = require('path');
import AWS = require('aws-sdk');
import { AWSError } from 'aws-sdk';
import AdmZip = require('adm-zip');

import store from '../../store';

interface LambdaData {
  lambdaFile: string,
  Role: string,
  DATABASE_NAME: string,
  DATABASE_TABLE: string,
  Runtime: string,
  region: string,
  Description: string
}

export default function createLambda({
  lambdaFile,
  Role = store.AWS.IAM.Arn!,
  DATABASE_NAME,
  DATABASE_TABLE,
  Runtime = 'nodejs12.x',
  Description = '',
}: LambdaData ): Promise<any> {
  return new Promise(resolve => {
    AWS.config.update({ region: store.AWS.region });

    const lambdaName = lambdaFile.replace(/\.js/, '');

    if (!fs.existsSync(lambdaFile)) {
      throw new Error("Can't find lambda file");
    }

    const zip = new AdmZip();

    zip.addLocalFile(lambdaFile);

    const lambda = new AWS.Lambda();

    const params = {
      Code: { /* required */
        ZipFile: zip.toBuffer(),
      },
      FunctionName: path.basename(lambdaName), /* required */
      Handler: `${lambdaName}.handler`, /* required */
      Role, /* required */
      Runtime, /* required */
      Description,
      Environment: {
        Variables: {
          DATABASE_NAME,
          DATABASE_TABLE,
        },
      },
    };
    // console.log('====================================');
    // console.log(params.FunctionName);
    // console.log('====================================');
    // resolve();

    lambda.createFunction(params, (err: AWSError, data) => {
      if (err && err.code !== 'ResourceConflictException') throw new Error(String(err));
      else resolve(data);
    });
  });
}

