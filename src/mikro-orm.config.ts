import { Options } from "@mikro-orm/core";
import { Post } from "./entity/Post";
import path from "path";
import { User } from "./entity/User";

const config: Options = {
  migrations: {
    path: path.join(__dirname,"./migrations"), // path to the folder with migrations
    glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
  },
  entities: [Post, User],
  dbName: "personalblog",
  user: "postgres",
  password: "postgres",
  debug: process.env.NODE_ENV !== "production",
  type: "postgresql",
};

export default config;
