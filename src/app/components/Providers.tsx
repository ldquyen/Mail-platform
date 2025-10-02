'use client';

import { HeroUIProvider } from "@heroui/react";
import { AppProvider } from "../contexts/AppContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </HeroUIProvider>
  );
}
