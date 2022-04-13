import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 42 auth
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // cookie
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
