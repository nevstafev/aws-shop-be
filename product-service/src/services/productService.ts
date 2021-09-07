import { Product } from 'src/types';
import productsJson from './productList.json';

const productsToId: { [key in string]: Product } = productsJson.reduce(
  (acc, next: Product) => {
    acc[next.id] = next;
    return acc;
  },
  {}
);

export const getAll = (): Promise<Product[]> => {
  return Promise.resolve(Object.values(productsToId));
};

export const getById = (id: string): Promise<Product | null> => {
  return Promise.resolve(productsToId[id] || null);
};
