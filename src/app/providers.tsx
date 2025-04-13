'use client';

import { ThemeProvider } from "next-themes";
import React from 'react';
import { RecoilRoot } from 'recoil';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RecoilRoot>{children}</RecoilRoot>
    </ThemeProvider>
  );
};

export default Providers;
