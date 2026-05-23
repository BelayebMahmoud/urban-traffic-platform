import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationGql {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field()
  type: string;

  @Field(() => String, { nullable: true })
  referenceId?: string | null;

  @Field()
  createdAt: Date;
}
