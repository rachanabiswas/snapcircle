"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/shadcnui/badge";
import { Card, CardContent } from "@/components/shadcnui/card";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  id: string;
  step: number;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  cardClassName?: string;
  titleClassName?: string;
  children: ReactNode;
};

const SettingsSection = ({
  id,
  step,
  title,
  description,
  open,
  onToggle,
  cardClassName,
  titleClassName,
  children,
}: SettingsSectionProps) => {
  const panelId = `${id}-panel`;

  return (
    <Card
      id={id}
      className={cardClassName}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 px-(--card-spacing) text-left">
        <Badge variant={open ? "default" : "secondary"}>{step}</Badge>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={cn(
              "font-heading text-base font-medium",
              titleClassName,
            )}>
            {title}
          </span>
          <span className="text-muted-foreground truncate text-sm">
            {description}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <CardContent
        id={panelId}
        className={cn(!open && "hidden")}>
        {children}
      </CardContent>
    </Card>
  );
};

export default SettingsSection;
