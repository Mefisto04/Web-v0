import { ReactNode } from 'react';

// import StreamVideoProvider from '@/providers/StreamClientProvider';

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      {children}
    </main>
  );
};

export default RootLayout;
