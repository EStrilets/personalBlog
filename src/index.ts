import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mircOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// import RedisStore from "connect-redis";
import session from "express-session";
import { createClient } from "redis";

const main = async () => {
  const orm = await MikroORM.init(mircOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  let redisClient = createClient();
  redisClient.connect().catch(console.error);

  // let redisStore = new RedisStore({
  //   client: redisClient,
  //   prefix: "myapp:",
  //   disableTouch: true,
  // });

  app.use(
    session({
      name: 'qid',
      // store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      // TODO
      cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', //TODO
        secure: process.env.NODE_ENV === "production",
      },
      secret: "qwerty", 
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on localhost4000");
  });
};

main();
