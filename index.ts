import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import express from 'express'
import cors from "cors"
import { buildSchema } from 'type-graphql';
import * as dotenv from "dotenv";

import { UserResolver } from "./src/resolvers/user"
import { RecipeResolver } from "./src/resolvers/recipe";
import { CategoryResolver } from "./src/resolvers/category";
import { verifyUser } from './src/helper/context/index';


const startServer = async () => {
  dotenv.config({ path: "../.env" });
  await createConnection();
  const schema = await buildSchema({
    resolvers: [UserResolver, RecipeResolver, CategoryResolver]
  });

  const app = express();
  app.use(cors())
  app.use(express.json());

  const server = new ApolloServer({
    schema,
    context: async ({ req }: any) => {
      await verifyUser(req)
      return {
        email: req.email
      }
    },
    playground: true
  });

  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;

  app.get('/', function (_req, res) {
    res.send('My Project');
  });

  app.listen(PORT, () => {
    console.log(`server listening on PORT: ${PORT}`)
    console.log(`Graphql Endpoint: ${server.graphqlPath}`)
  });
};

startServer();
