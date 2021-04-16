import { AWSError } from 'aws-sdk';
import AWS = require('aws-sdk');

const iam = new AWS.IAM();

export default function listRoles(): Promise<any> {
  return new Promise(resolve => {
    iam.listRoles({}, (err: AWSError, data) => {
      if (err) resolve(err);
      else resolve(data);
    });
  });
}
