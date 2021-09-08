import { AddProductDto, Product, UserInputError } from 'src/types';
import { createClient } from './createClient';

const QUERY_ALL_PRODUCTS =
  'select p.id, title, description, count, price from products p join stocks on p.id=product_id';
const QUERY_PRODUCT =
  'select p.id, title, description, count, price from products p join stocks on p.id=product_id where p.id::text = $1';
const QUERY_CREATE_PRODUCT =
  'insert into products (title, description, price) values ($1, $2, $3) returning id';
const QUERY_CREATE_STOCK =
  'insert into stocks (product_id, count) values ($1, $2)';

export const getAll = async (): Promise<Product[]> => {
  const client = createClient();
  try {
    await client.connect();
    const queryResult = await client.query(QUERY_ALL_PRODUCTS);
    return queryResult.rows as Product[];
  } catch (e) {
    console.log('Error while requesting products', e);
    throw new Error(e);
  } finally {
    client.end();
  }
};

export const getById = async (id: string): Promise<Product | null> => {
  const client = createClient();
  try {
    await client.connect();

    const queryResult = await client.query(QUERY_PRODUCT, [id]);
    if (queryResult.rows.length === 0) {
      return null;
    }
    return queryResult.rows[0] as Product;
  } catch (e) {
    console.log(`Error while requesting product with id ${id}`, e);
    throw new Error(e);
  } finally {
    client.end();
  }
};

export const addProduct = async (
  productDto: AddProductDto
): Promise<Product> => {
  const validationResult = validateProductDto(productDto);

  if (validationResult.length > 0) {
    const error: UserInputError = new Error(validationResult.join('\n'));
    error.isInvalidUserInput = true;
    throw error;
  }
  const client = createClient();

  try {
    await client.connect();
    await client.query('begin');

    const newProductQueryResult = await client.query(QUERY_CREATE_PRODUCT, [
      productDto.title,
      productDto.description,
      productDto.price,
    ]);

    const { id } = newProductQueryResult.rows[0];

    await client.query(QUERY_CREATE_STOCK, [id, productDto.count]);

    await client.query('commit');

    return {
      id,
      title: productDto.title,
      description: productDto.description,
      price: productDto.price,
      count: productDto.count,
    };
  } catch (e) {
    console.log('Error while creating product', e);
    await client.query('rollback');
    throw new Error('Product creation error');
  } finally {
    client.end();
  }
};

const validateProductDto = (product: AddProductDto): string[] => {
  const errors = [];
  if (!product) {
    errors.push('Product not specified');
    return errors;
  }
  const { title, price, count } = product;
  if (!title || String(title).length === 0) {
    errors.push('Title can not be empty');
  }
  if (!Number.isInteger(count) || Number(count) < 0) {
    errors.push('Count should be integer or zero');
  }

  if (!Number.isInteger(price) || Number(price) <= 0) {
    errors.push('Price should be integer and more than zero');
  }
  return errors;
};
