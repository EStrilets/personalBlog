import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 as uuidv4 } from "uuid";

// corresponds to db table
@ObjectType()
@Entity()
export class User {

    constructor() { 
        this._id = uuidv4();
    }

  @Field(() => String)
  @PrimaryKey()
  _id!: string;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // property - database call
  @Field()
  @Property({ type: 'text', unique: true })
  username!: string;

  @Property({ type: 'text' })
  password!: string;

}