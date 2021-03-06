import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { Language } from './entities/Language';
import { Word } from './entities/Word';
import { Translation } from './entities/Translation';
import { PORT, DATABASE_URL } from './constants';
import { WordResolver } from './resolvers/word';

async function main() {
  await createConnection({
    type: 'postgres',
    url: DATABASE_URL,
    logging: true,
    synchronize: false,
    entities: [Language, Word, Translation],
  });
  const app = express();
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [WordResolver],
    }),
  });

  server.applyMiddleware({ app });
  app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

if (module === require.main) {
  try {
    main();
  } catch (error) {
    console.error('Uncaught error: ', error);
  }
}
