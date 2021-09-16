import { Client, ClientConfig } from 'pg';

const { PG_HOST, PG_DATABASE, PG_PORT, PG_USER, PG_PASSWORD } = process.env;
const config: ClientConfig = {
  host: PG_HOST,
  database: PG_DATABASE,
  port: Number(PG_PORT),
  user: PG_USER,
  password: PG_PASSWORD,
  connectionTimeoutMillis: 5000,
};

export const createClient = (): Client => {
  return new Client(config);
};
