import 'source-map-support/register';

import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { addProduct } from '../../services/productService';
import { AddProductDto } from 'src/types';

const createProduct: Handler<
  Omit<APIGatewayProxyEvent, 'body'> & { body: AddProductDto },
  APIGatewayProxyResult
> = async (event) => {
  console.log(event);
  try {
    const product = await addProduct(event.body);
    return formatJSONResponse(product);
  } catch (e) {
    console.log('Error while creating product', e);

    if (e.isInvalidUserInput) {
      return formatJSONResponse({ message: e.message }, 400);
    }
    return formatJSONResponse({ message: 'Error while creating product' }, 500);
  }
};

export const main = middyfy(createProduct);
