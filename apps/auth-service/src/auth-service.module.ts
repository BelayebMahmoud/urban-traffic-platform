import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaClientModule } from '@app/prisma-client';
import { JwtStrategy } from '@app/common/strategies/jwt.strategy';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceResolver } from './auth-service.resolver';
import { AuthServiceService } from './auth-service.service';

@Module({
  imports: [
    PrismaClientModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') as any },
      }),
    }),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, AuthServiceResolver, JwtStrategy],
  exports: [AuthServiceService, JwtModule, PassportModule],
})
export class AuthServiceModule {}
