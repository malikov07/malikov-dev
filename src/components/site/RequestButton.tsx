"use client";

import type { ComponentProps, ReactNode } from "react";
import type { ProjectKind } from "@/lib/catalog";
import { useRequest } from "@/components/request/RequestProvider";
import { Button } from "@/components/ui/Button";

/**
 * Opens the request flow. Optionally jumps straight past the category picker
 * when the surrounding context already implies the project type.
 */
export default function RequestButton({
  kind,
  children,
  ...props
}: {
  kind?: ProjectKind;
  children: ReactNode;
} & Omit<ComponentProps<typeof Button>, "children" | "onClick">) {
  const { open } = useRequest();
  return (
    <Button onClick={() => open(kind)} {...props}>
      {children}
    </Button>
  );
}

/** Unstyled variant, for when the trigger is a card or a link. */
export function RequestTrigger({
  kind,
  className,
  children,
  ...rest
}: {
  kind?: ProjectKind;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "onClick">) {
  const { open } = useRequest();
  return (
    <button type="button" className={className} onClick={() => open(kind)} {...rest}>
      {children}
    </button>
  );
}
