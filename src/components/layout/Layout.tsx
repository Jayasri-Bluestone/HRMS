import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, onSelectTab, children }) => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col text-slate-800">
      <Navbar currentTab={currentTab} onSelectTab={onSelectTab} />
      <main className="flex-1 px-4 sm:px-6 md:px-8 max-w-[1520px] w-full mx-auto pt-2 pb-12">
        {children}
      </main>
    </div>
  );
};
