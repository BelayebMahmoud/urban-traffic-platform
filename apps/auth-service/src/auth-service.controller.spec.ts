import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';

const authServiceMock = {
  getUsers: jest.fn(),
  toggleUserStatus: jest.fn(),
};

const adminReq = { user: { id: 'admin-1', role: 'ADMIN' } };
const operatorReq = { user: { id: 'op-1', role: 'OPERATOR' } };

describe('AuthServiceController', () => {
  let controller: AuthServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthServiceController],
      providers: [{ provide: AuthServiceService, useValue: authServiceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthServiceController>(AuthServiceController);
    jest.clearAllMocks();
  });

  describe('getUsers()', () => {
    it('returns users list when requester is ADMIN', () => {
      authServiceMock.getUsers.mockReturnValue([]);
      controller.getUsers(adminReq);
      expect(authServiceMock.getUsers).toHaveBeenCalled();
    });

    it('throws ForbiddenException when requester is not ADMIN', () => {
      expect(() => controller.getUsers(operatorReq)).toThrow(
        ForbiddenException,
      );
      expect(authServiceMock.getUsers).not.toHaveBeenCalled();
    });
  });

  describe('toggleUser()', () => {
    it('toggles user status when requester is ADMIN', () => {
      authServiceMock.toggleUserStatus.mockReturnValue({
        id: 'u1',
        isActive: false,
      });
      controller.toggleUser('u1', adminReq);
      expect(authServiceMock.toggleUserStatus).toHaveBeenCalledWith('u1');
    });

    it('throws ForbiddenException when requester is not ADMIN', () => {
      expect(() => controller.toggleUser('u1', operatorReq)).toThrow(
        ForbiddenException,
      );
      expect(authServiceMock.toggleUserStatus).not.toHaveBeenCalled();
    });
  });
});
