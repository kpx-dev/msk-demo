import * as aws from 'aws-sdk';
import { Knex } from 'knex';

const db = new Knex.Client({
  client: "pg",
  connection: {
    connectionString: process.env.DB_CONN,
  },
});
db.acquireConnection()

const handler  = async () => {
  // db.query

  db.raw("create table users()")
  return 'ok - db proxy lambda';
}

exports.handler = handler;
handler();
