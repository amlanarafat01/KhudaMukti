// SHARED (Member 1 owns the real version). Kept here so Member 3 code runs on its own.
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string().min(8).required(),

  MAIL_HOST: Joi.string().default('sandbox.smtp.mailtrap.io'),
  MAIL_PORT: Joi.number().default(2525),
  MAIL_USER: Joi.string().allow('').default(''),
  MAIL_PASS: Joi.string().allow('').default(''),
  MAIL_FROM: Joi.string().default('KhudaMukti <no-reply@khudamukti.test>'),

  ALLOW_DEMO_FAILURE: Joi.boolean().default(false),
});
