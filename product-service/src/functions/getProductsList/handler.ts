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
  async () => {
    const products = await getAll();
    return formatJSONResponse(products);
  };

export const main = middyfy(getProductsList);
