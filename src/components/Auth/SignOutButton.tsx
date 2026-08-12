"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2Icon, LogOutIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/shadcnui/button";
import { toast } from "@/components/shadcnui/toast";

const SignOutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            title: "Signed out",
            description: "See you soon!",
            type: "success",
          });
          router.push("/");
        },
        onError: (ctx) => {
          toast.add({
            title: "Sign out failed",
            description: ctx.error.message,
            type: "error",
          });
        },
      },
    });
    setIsPending(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isPending}>
      {isPending ?
        <Loader2Icon
          className="animate-spin"
          aria-hidden="true"
        />
      : <LogOutIcon aria-hidden="true" />}
      Sign out
    </Button>
  );
};

export default SignOutButton;
