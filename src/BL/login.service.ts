import prisma from "@/DAL/prismaClient";
import type { CreateUserSchemaType } from "@/DTO/user.schema";

export async function createUser(userData: CreateUserSchemaType) {
  const user = await prisma.$transaction(async (tx) => {
    const getUser = await tx.users.findUnique({ where: userData });
    if (getUser == null) {
      // Create the user
      const newUser = await tx.users.create({
        data: userData,
      });
      return {
        newUser,
      };
    }
    return getUser
  });
  return user;
}
