import S3 from 'aws-sdk/clients/s3';
import { UserInputError } from '../types';

const S3_PARAMS = { region: 'eu-west-1' };
const Bucket = 'node-shop-uploaded';
const SIGNED_URL_PARAMS = {
  Bucket,
  Expires: 60,
  ContentType: 'text/csv',
};

export const getSignedUrl = async (name: string): Promise<string> => {
  if (!name || name.length === 0) {
    const error: UserInputError = new Error('Invalid name for file');
    error.isInvalidUserInput = true;
    throw error;
  }
  const s3 = new S3(S3_PARAMS);
  const url = await s3.getSignedUrlPromise('putObject', {
    ...SIGNED_URL_PARAMS,
    Key: `uploaded/${name}`,
  });
  console.log('url', url);

  return url;
};
