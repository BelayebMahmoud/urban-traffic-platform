import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthServiceService } from './auth-service.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthResponse } from './models/auth-response.model';
import { UserModel } from './models/user.model';

@Resolver()
export class AuthServiceResolver {
  constructor(private readonly auth: AuthServiceService) {}

  @Mutation(() => AuthResponse)
  register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return this.auth.register(input);
  }

  @Mutation(() => AuthResponse)
  login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.auth.login(input);
  }

  @Query(() => UserModel)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { id: string }): Promise<any> {
    return this.auth.findById(user.id);
  }
}
