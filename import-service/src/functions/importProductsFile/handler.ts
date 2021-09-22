import 'source-map-support/register';

import { formatResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';

import { getSignedUrl } from '../../services/importService';

const importProductsFile: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> =
  async (event) => {
    console.log(event);

    const { name } = event.queryStringParameters;

    try {
      const url = await getSignedUrl(name);
      return formatResponse(url, false);
    } catch (e) {
      console.log('Error while creating product', e);

      if (e.isInvalidUserInput) {
        return formatResponse({ message: e.message }, true, 400);
      }
      return formatResponse(
        { message: 'Error while creating product' },
        true,
        500
      );
    }
  };

export const main = middyfy(importProductsFile);
