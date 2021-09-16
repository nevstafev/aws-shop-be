export type Product = {
  id: string;
  title: string;
  description: string;
  count: number;
  price: number;
};

export type AddProductDto = {
  title?: string;
  description?: string;
  count?: number;
  price?: number;
};

export type UserInputError = Error & { isInvalidUserInput?: boolean };
