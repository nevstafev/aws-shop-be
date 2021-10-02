import { middyfy } from '@libs/lambda';
import type { SQSHandler } from 'aws-lambda';
import 'source-map-support/register';
import { addProduct } from '../../services/productService';
import { SNS } from 'aws-sdk';

const catalogBatchProcess: SQSHandler = async (event) => {
  console.log(event);
  event.Records.map(async (record) => {
    const product = JSON.parse(record.body);
    await addProduct({
      count: parseInt(product.count),
      description: product.description,
      price: parseInt(product.price),
      title: product.title,
    });
  });
  const sns = new SNS({ region: 'eu-west-1' });
  await sns
    .publish({
      Subject: 'Product service notification',
      Message: 'Products imported',
      TopicArn: process.env.SNS_ARN,
    })
    .promise();
};

export const main = middyfy(catalogBatchProcess);
