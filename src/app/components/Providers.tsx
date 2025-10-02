'use client';

import { HeroUIProvider } from "@heroui/react";
import { AppProvider } from "../contexts/AppContext";
import {ToastProvider} from "@heroui/toast";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AppProvider>
      <ToastProvider />
        {children}
      </AppProvider>
    </HeroUIProvider>
  );
}
