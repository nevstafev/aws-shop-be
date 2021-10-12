import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    region: 'eu-west-1',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: '${env:PG_HOST}',
      PG_DATABASE: '${env:PG_DATABASE}',
      PG_PORT: '${env:PG_PORT}',
      PG_USER: '${env:PG_USER}',
      PG_PASSWORD: '${env:PG_PASSWORD}',
      SQS_ARN: {
        'Fn::GetAtt': ['SQSQueue', 'Arn'],
      },
      SNS_ARN: {
        Ref: 'SNSTopic',
      },
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: [
          {
            'Fn::GetAtt': ['SQSQueue', 'Arn'],
          },
        ],
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: [
          {
            Ref: 'SNSTopic',
          },
        ],
      },
    ],
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
        },
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '${env:EMAIL}',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
        },
      },
    },
    Outputs: {
      sqsUrl: {
        Value: {
          Ref: 'SQSQueue',
        },
        Export: { Name: 'sqsUrl' },
      },
      sqsArn: {
        Value: '${self:provider.environment.SQS_ARN}',
        Export: { Name: 'sqsArn' },
      },
    },
  },
  functions: {
    getProductsList,
    getProductById,
    createProduct,
    catalogBatchProcess,
  },
  useDotenv: true,
};

module.exports = serverlessConfiguration;
