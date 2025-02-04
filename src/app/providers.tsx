'use client';

import React from 'react';
import { RecoilRoot } from 'recoil';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

export default Providers;
