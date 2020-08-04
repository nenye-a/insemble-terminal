import { PrismaClient } from '@prisma/client';

/**
 * Universal server types.
 */

export type Root = object | undefined;

export type Context = {
  prisma: PrismaClient;
  userId: string;
};
