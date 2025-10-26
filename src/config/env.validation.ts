import { z, ZodError } from 'zod';

const envSchema = z
  .object({
    // App
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z
      .string()
      .default('3000')
      .transform(Number)
      .pipe(z.number().positive()),

    // Database
    DATABASE_URL: z.string().url().startsWith('postgresql://'),

    // 개발 환경 전용
    POSTGRES_DB: z.string().optional(),
    POSTGRES_USER: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),
    PGADMIN_EMAIL: z.string().email().optional(),
    PGADMIN_PASSWORD: z.string().optional(),

    // JWT
    JWT_ACCESS_SECRET: z
      .string()
      .min(20, 'JWT_ACCESS_SECRET은 최소 20자 이상이어야 합니다'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(20, 'JWT_REFRESH_SECRET은 최소 20자 이상이어야 합니다'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Aligo
    ALIGO_API_KEY: z.string().min(1),
    ALIGO_USER_ID: z.string().min(1),
    ALIGO_SENDER: z
      .string()
      .regex(/^01[0-9]{8,9}$/, '올바른 전화번호 형식이 아닙니다'),
  })
  .refine(
    (env) => {
      if (env.NODE_ENV === 'production') {
        return (
          env.JWT_ACCESS_SECRET.length >= 32 &&
          env.JWT_REFRESH_SECRET.length >= 32
        );
      }
      return true;
    },
    {
      message: '프로덕션 환경에서는 JWT SECRET이 최소 32자 이상이어야 합니다!',
    },
  )
  .refine(
    (env) => {
      return env.JWT_ACCESS_SECRET !== env.JWT_REFRESH_SECRET;
    },
    {
      message: 'JWT_ACCESS_SECRET과 JWT_REFRESH_SECRET은 달라야 합니다!',
    },
  );

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  try {
    return envSchema.parse(config);
  } catch (error) {
    // 타입 가드로 간단하게
    if (error instanceof ZodError) {
      const errorMessages = error.issues
        .map((issue) => ` ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      console.error('\n=================================');
      console.error('환경 변수 검증 실패!');
      console.error('=================================');
      console.error(errorMessages);
      console.error('=================================\n');

      throw new Error('환경 변수 검증 실패');
    }
    throw error;
  }
}
