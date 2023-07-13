import { Migration } from '@mikro-orm/migrations';

export class Migration20230208070408 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("_id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null, constraint "post_pkey" primary key ("_id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;');
  }

}
