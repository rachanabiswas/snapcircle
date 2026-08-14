"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/shadcnui/button";
import { Input } from "@/components/shadcnui/input";
import { cn } from "@/lib/utils";

const PasswordInput = ({
  className,
  ...props
}: React.ComponentProps<"input">) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2">
        {visible ?
          <EyeIcon aria-hidden="true" />
        : <EyeOffIcon aria-hidden="true" />}
      </Button>
    </div>
  );
};

export default PasswordInput;
