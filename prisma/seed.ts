import { generateId } from "@better-auth/core/utils/id";
import { hashPassword } from "better-auth/crypto";
import prisma from "../src/lib/dbClient/prisma";

const ADMIN_EMAIL = "titlyb@gmail.com";
const ADMIN_PASSWORD = "titlyb@gmail.com";
const ADMIN_NAME = "Admin";

const upsertAdmin = async () => {
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "admin", emailVerified: true },
    create: {
      id: generateId(),
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "admin",
      emailVerified: true,
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: user.id,
      },
    },
    update: { password: hashedPassword },
    create: {
      id: generateId(),
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashedPassword,
    },
  });

  console.log(`Admin user ready: ${ADMIN_EMAIL}`);
};

const main = async () => {
  await upsertAdmin();
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
