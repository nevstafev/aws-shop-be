import 'source-map-support/register';

import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { getAll } from '../../services/productService';

const getProductsList: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> =
  async (event) => {
    console.log(event);
    try {
      const products = await getAll();
      return formatJSONResponse(products);
    } catch (e) {
      return formatJSONResponse(
        {
          message: 'Error while getting products',
        },
        500
      );
    }
  };

export const main = middyfy(getProductsList);
