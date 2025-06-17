import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const SignInSchema = z.object({
  accessToken: z.string(),
});

export class SignInDto extends createZodDto(SignInSchema) {}
