'use client';

import { useState } from 'react';
import LeftDrawer from './components/global/LeftDrawer';
import TopBar from './components/global/TopBar';
import Dashboard from './components/dashboard/DashBoard';

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F6FA] relative">
      <LeftDrawer isOpen={isDrawerOpen} />
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isDrawerOpen ? '340px' : '0px'
        }}
      >
        <TopBar onMenuClick={toggleDrawer} />
        <Dashboard />
      </div>
    </div>
  );
}
