import 'source-map-support/register';

import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { getById } from '../../services/productService';

const getProductById: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> =
  async (event) => {
    console.log(event);
    const productId = event.pathParameters.id;
    try {
      const product = await getById(productId);
      if (product) {
        return formatJSONResponse(product);
      } else {
        return formatJSONResponse(
          {
            message: 'Product not found',
          },
          400
        );
      }
    } catch (e) {
      return formatJSONResponse(
        { message: 'Error while getting product' },
        500
      );
    }
  };

export const main = middyfy(getProductById);
