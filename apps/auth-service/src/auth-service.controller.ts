import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthServiceService } from './auth-service.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AuthServiceController {
  constructor(private readonly auth: AuthServiceService) { }

  @Get('users')
  getUsers(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.auth.getUsers();
  }

  @Patch('users/:id/toggle')
  toggleUser(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.auth.toggleUserStatus(id);
  }
}
