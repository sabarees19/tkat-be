import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EnvService } from '@tkat-backend/core';
import {
  AuthError,
  authErrorEnum,
  CreateUserDto,
  NotFoundError,
} from '@tkat-backend/shared';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { UserService } from 'libs/user/src/user.service';

@Injectable()
export class AuthService {
  private readonly client: CognitoIdentityProviderClient;

  constructor(
    private readonly envService: EnvService,
    private readonly userService: UserService
  ) {
    this.client = new CognitoIdentityProviderClient({
      credentials: {
        accessKeyId: envService.get('AWS_ACCESS_KEY'),
        secretAccessKey: envService.get('AWS_SECRET_KEY'),
      },
      region: envService.get('AWS_REGION'),
    });
  }

  async createUserInCognito(email: string) {
    const input = {
      UserPoolId: this.envService.get('USER_POOL_ID'),
      Username: email,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    };
    const command = new AdminCreateUserCommand(input);
    await this.client.send(command);
  }

  async createUser(request: CreateUserDto) {
    const userDto = await this.userService.createUser(request);
    await this.createUserInCognito(userDto.email);
    return userDto;
  }

  private async verifyToken(
    headers: IncomingHttpHeaders
  ): Promise<GetUserCommandOutput> {
    if (
      !headers?.authorization ||
      headers?.authorization?.toLowerCase().startsWith('bearer ') === false
    )
      throw new AuthError(authErrorEnum.enum.BEARER_TOKEN_NOT_FOUND);
    const accessToken = headers.authorization.substring(7);
    // await CognitoJwtVerifier.create({
    //   userPoolId: this.envService.get('USER_POOL_ID'),
    //   clientId: this.envService.get('USER_CLIENT_ID'),
    //   tokenUse: 'access',
    // })
    //   .verify(accessToken)
    //   .catch((error) => {
    //     throw new AuthError(authErrorEnum.enum.INVALID_BEARER_TOKEN, error);
    //   });
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });
    return await this.client.send(command);
  }

  async signIn(request: Request) {
    const userResponse = (await this.verifyToken(request.headers))
      .UserAttributes;
    const email = userResponse?.find((data) => data.Name === 'email')?.Value;
    if (!email) throw new NotFoundError('EMAIL_NOT_FOUND');
    request.session.user = await this.userService.findUserByEmail(email);
    request.session.isAuthenticated = true;
    if (request.session.user.userStatus === 'Not Verified')
      await this.userService.updateUser(request.session.user.id, {
        userStatus: 'Active',
      });
    else if (request.session.user.userStatus === 'Inactive')
      throw new UnauthorizedException('User is not active');
    else return request.session.user;
  }
}

