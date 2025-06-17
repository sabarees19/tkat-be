import { Injectable } from '@nestjs/common';
import {
  BadRequestError,
  badRequestErrorEnum,
  CreateUserDto,
  NotFoundError,
  notFoundErrorEnum,
  UpdateUserDto,
  User,
  UserDto,
  ZodError,
  zodErrorEnum,
  zodUpdateUserSchema,
  zodUserCreateSchema,
  zodUserSchema,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly utilsService: UtilsService
  ) {}

  async createUser(request: CreateUserDto): Promise<UserDto> {
    const parsedRequest = zodUserCreateSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (await this.userRepository.existsByEmail(parsedRequest.data.email))
      throw new BadRequestError(
        badRequestErrorEnum.enum.USER_EMAIL_ALREADY_EXISTS
      );
    return this.userParse(await this.userRepository.create(parsedRequest.data));
  }

  async findAllUser(): Promise<UserDto[]> {
    const result = await this.userRepository.findAll();
    const parsedResult = zodUserSchema.array().safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }

  async findUserById(id: string): Promise<UserDto> {
    return this.userParse(await this.userRepository.findById(id));
  }

  async findUserByEmail(email: string): Promise<UserDto> {
    return this.userParse(await this.userRepository.findByEmail(email));
  }

  async updateUser(id: string, request: UpdateUserDto): Promise<UserDto> {
    const parsedRequest = zodUpdateUserSchema.safeParse(request);
    if (!parsedRequest.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedRequest.error,
      });
    if (this.utilsService.isObjectEmpty(parsedRequest.data))
      throw new BadRequestError(badRequestErrorEnum.enum.UPDATE_REQUEST_EMPTY);
    const result = await this.userRepository.update(id, parsedRequest.data);
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.USER_NOT_FOUND);
    return this.userParse(result);
  }

  async deleteUser(id: string): Promise<UserDto> {
    if (!(await this.userRepository.existsById(id)))
      throw new NotFoundError(notFoundErrorEnum.enum.USER_NOT_FOUND);
    return this.userParse(await this.userRepository.softDelete(id));
  }

  async validateUsersExist(userIds: string[]): Promise<void> {
    const existingUserIds = await this.userRepository.existsByIds(userIds);
    const missingUserIds = userIds.filter(id => !existingUserIds.includes(id));
    
    if (missingUserIds.length > 0) {
      throw new NotFoundError(notFoundErrorEnum.enum.USER_NOT_FOUND, {
        message: `Some of the approvers are not found`
      });
    }
  }

  private async userParse(result: User | null) {
    if (!result) throw new NotFoundError(notFoundErrorEnum.enum.USER_NOT_FOUND);
    const parsedResult = zodUserSchema.safeParse(result);
    if (!parsedResult.success)
      throw new ZodError(zodErrorEnum.enum.PARSE_ERROR, {
        cause: parsedResult.error,
      });
    return parsedResult.data;
  }
}
