/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
/**
 * Unit tests for AuthServiceService
 * Coverage target: >80%
 * Mock strategy: PrismaClientService injected via useValue
 * External mocks: bcryptjs (jest.mock), JwtService (useValue)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceService } from './auth-service.service';
import { PrismaClientService } from '@app/prisma-client';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const jwtServiceMock = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthServiceService', () => {
  let service: AuthServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceService,
        { provide: PrismaClientService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthServiceService>(AuthServiceService);
    jest.clearAllMocks();
  });

  describe('register()', () => {
    const registerInput = {
      email: 'alice@example.com',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Smith',
    };

    it('creates user and returns accessToken + user when email is new', async () => {
      // ARRANGE
      const fakeUser = {
        id: 'uuid-1',
        ...registerInput,
        password: 'hashed',
        role: 'OPERATOR',
      };
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue(fakeUser);

      // ACT
      const result = await service.register(registerInput as any);

      // ASSERT
      expect(result).toMatchObject({
        accessToken: 'mock.jwt.token',
        user: fakeUser,
      });
    });

    it('hashes the password before saving', async () => {
      // ARRANGE
      const fakeUser = {
        id: 'uuid-1',
        ...registerInput,
        password: 'hashed',
        role: 'OPERATOR',
      };
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue(fakeUser);

      // ACT
      await service.register(registerInput as any);

      // ASSERT
      expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
    });

    it('sets role to OPERATOR by default when role is not provided', async () => {
      // ARRANGE
      const fakeUser = {
        id: 'uuid-1',
        ...registerInput,
        password: 'hashed',
        role: 'OPERATOR',
      };
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue(fakeUser);

      // ACT
      await service.register(registerInput as any);

      // ASSERT
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'OPERATOR' }),
      });
    });

    it('preserves explicit ADMIN role when provided', async () => {
      // ARRANGE
      const adminInput = { ...registerInput, role: 'ADMIN' as any };
      const fakeUser = { id: 'uuid-2', ...adminInput, password: 'hashed' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue(fakeUser);

      // ACT
      await service.register(adminInput as any);

      // ASSERT
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'ADMIN' }),
      });
    });

    it('throws ConflictException when email already exists', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      // ACT + ASSERT
      await expect(service.register(registerInput as any)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    const loginInput = { email: 'alice@example.com', password: 'password123' };
    const fakeUser = {
      id: 'uuid-1',
      email: 'alice@example.com',
      password: 'hashed-password',
      role: 'OPERATOR',
    };

    it('returns accessToken and user when credentials are valid', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // ACT
      const result = await service.login(loginInput as any);

      // ASSERT
      expect(result).toMatchObject({
        accessToken: 'mock.jwt.token',
        user: fakeUser,
      });
    });

    it('calls bcrypt.compare with plain password and stored hash', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // ACT
      await service.login(loginInput as any);

      // ASSERT
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        fakeUser.password,
      );
    });

    it('calls prisma.user.findUnique with the provided email', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // ACT
      await service.login(loginInput as any);

      // ASSERT
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
      });
    });

    it('throws UnauthorizedException when user is not found', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue(null);

      // ACT + ASSERT
      await expect(service.login(loginInput as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // ACT + ASSERT
      await expect(service.login(loginInput as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findById()', () => {
    it('returns user when found', async () => {
      // ARRANGE
      const fakeUser = { id: 'uuid-1', email: 'alice@example.com' };
      prismaMock.user.findUnique.mockResolvedValue(fakeUser);

      // ACT
      const result = await service.findById('uuid-1');

      // ASSERT
      expect(result).toEqual(fakeUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('returns null when user does not exist', async () => {
      // ARRANGE
      prismaMock.user.findUnique.mockResolvedValue(null);

      // ACT
      const result = await service.findById('nonexistent-id');

      // ASSERT
      expect(result).toBeNull();
    });
  });
});
