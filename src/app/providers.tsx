"use client";

import { TRPCReactProvider } from "@/lib/trpc/client";
import type { ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
};
