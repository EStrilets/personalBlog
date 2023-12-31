import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { RequiredEntityData } from "@mikro-orm/core";
import argon2 from 'argon2'


@InputType()
class UsernamePasswordInput { 
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError { 
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse { 
    @Field(() => [FieldError], {nullable: true} )
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}


@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(@Ctx() { em }: MyContext): Promise<User[]> {
    const contextEm = em.fork();
    const users = await contextEm.find(User, {});
    return users;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater 4",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const contextEm = em.fork();
    const user = contextEm.create(User, {
      username: options.username,
      password: hashedPassword,
    } as RequiredEntityData<User>);
    try {
        await contextEm.persistAndFlush(user);
    } catch(err) { 
        if(err.code==="23505" || err.detail.includes("already exists")) { 
          return { 
            errors: [
              { 
                field: "username",
                message: "username already taken",
              }
            ]
          }
        }
        console.log("message", err.message)
    }
    return {
      user,
    };
  }
  
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const contextEm = em.fork();
    const user = await contextEm.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.id = user._id;

    return {
      user,
    };
  }
}


//   @Mutation(() => UserResponse)
//   async login(
//     @Arg("options") options: UsernamePasswordInput,
//     @Ctx() { em, req }: MyContext
//   ): Promise<UserResponse> {
//     const contextEm = em.fork();
//     const user = await contextEm.findOne(User, { username: options.username });
//     if (!user) {
//       return {
//         errors: [
//           {
//             field: "username",
//             message: "username doesn't exist",
//           },
//         ],
//       };
//     }
//     const valid = await argon2.verify(user.password, options.password);
//     if (!valid) {
//       return {
//         errors: [
//           {
//             field: "password",
//             message: "invalid login",
//           },
//         ],
//       };
//     }


//     // req.session.id = user._id

//     return {
//       user,
//     };
//   }
// }