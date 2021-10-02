import { middyfy } from '@libs/lambda';
import { S3Handler } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import csv from 'csv-parser';
import 'source-map-support/register';

const BUCKET = 'node-shop-uploaded';

const importFileParser: S3Handler = async (event) => {
  console.log(event);

  const { Records } = event;
  const s3 = new S3({ region: 'eu-west-1' });
  const sqs = new SQS({ region: 'eu-west-1' });
  for (const record of Records) {
    const s3Object = s3
      .getObject({
        Bucket: BUCKET,
        Key: `${record.s3.object.key}`,
      })
      .createReadStream();
    s3Object
      .pipe(csv())
      .on('data', async (data) => {
        console.log(data);
        await sqs
          .sendMessage({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(data),
          })
          .promise();
      })
      .on('end', async () => {
        await s3
          .copyObject({
            Bucket: BUCKET,
            CopySource: BUCKET + '/' + record.s3.object.key,
            Key: record.s3.object.key.replace('uploaded', 'parsed'),
          })
          .promise();
        await s3
          .deleteObject({
            Bucket: BUCKET,
            Key: record.s3.object.key,
          })
          .promise();
      });
  }
};

export const main = middyfy(importFileParser);
