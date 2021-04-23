import { AWSError } from 'aws-sdk';
import { cloudwatch } from '../singletons';

import store from '../../store';

export default function getLogEvents(logGroupName: string, logStreamName: string, startFromHead = true): Promise<any> {
  return new Promise(resolve => {
    const params = {
      logGroupName,
      logStreamName,
      nextToken: store.AWS.Cloudwatch.NextToken,
      startFromHead,
      // endTime: 'NUMBER_VALUE',
      // startTime: 'NUMBER_VALUE'
    };
    cloudwatch.getLogEvents(params as unknown as any, function(err: AWSError, data: any) {
      if (err) {
        console.log(err, err.stack);
      } else {
        if (data.events.length === 0) {
          store.AWS.Cloudwatch.NextToken = null;

        } else {
          store.AWS.Cloudwatch.NextToken = data.nextForwardToken;
        }

        resolve(data);
      }
    });
  });
}
