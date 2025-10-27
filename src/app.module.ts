import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { InterpretersModule } from './modules/interpreters/interpreters.module';
import { validateEnv } from './config/env.validation';
import { AdminModule } from './modules/admin/admin.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { SpecializationsModule } from './modules/specializations/specializations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validate: validateEnv,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    InterpretersModule,
    AdminModule,
    LanguagesModule,
    SpecializationsModule,
  ],
  providers: [],
})
export class AppModule {}
