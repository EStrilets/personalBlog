
import { RequiredEntityData } from "@mikro-orm/core";
import { Post } from "../entity/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    const contextEm = em.fork();
    const posts = await contextEm.find(Post, {});
    return posts;
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg("id", () => String) _id: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const contextEm = em.fork();
    const post = await contextEm.findOne(Post, { _id });
    return post;
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const contextEm = em.fork();
    const post = contextEm.create(Post, { title } as RequiredEntityData<Post>);
    await contextEm.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => String) _id: string,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const contextEm = em.fork();
    const post = await contextEm.findOne(Post, {
      _id,
    } as RequiredEntityData<Post>);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await contextEm.persistAndFlush(post);
    }
    await contextEm.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => String) _id: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      const contextEm = em.fork();
      await contextEm.nativeDelete(Post, { _id });
    } catch {
      return false;
    }
    return true;
  }
}