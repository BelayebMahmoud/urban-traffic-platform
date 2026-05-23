import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, { name: 'Role', description: 'User role' });

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => Role)
  role: Role;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
