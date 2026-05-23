import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class SendNotificationInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  type: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  referenceId?: string;
}
