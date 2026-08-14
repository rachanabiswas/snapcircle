import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { clientEnv } from "@/lib/env/clientEnv";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient()],
});
