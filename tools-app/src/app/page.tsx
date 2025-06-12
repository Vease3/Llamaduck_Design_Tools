'use client';

import { useState } from 'react';
import LeftDrawer from './components/global/LeftDrawer';
import TopBar from './components/global/TopBar';
import Dashboard from './components/dashboard/DashBoard';
import LottieTokenAssign from './components/animation-tools/LottieTokenAssign';
import SvgTokenAssign from './components/imagery-tools/SvgTokenAssign';
import VidToGif from './components/imagery-tools/VidToGif';
import YoutubeTranscriber from './components/misc-tools/YoutubeTranscriber';

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleToolSelect = (toolId: string) => {
    setCurrentView(toolId);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleNavigation = (view: string) => {
    if (view === 'Dashboard') {
      setCurrentView('dashboard');
    } else if (view === 'Lottie Token Assigner') {
      setCurrentView('2');
    } else if (view === 'SVG Token Assigner') {
      setCurrentView('3');
    } else if (view === 'Video to GIF Converter') {
      setCurrentView('5');
    } else if (view === 'Youtube Transcriber') {
      setCurrentView('4');
    }
  };

  const getCurrentSelectedTab = () => {
    switch (currentView) {
      case '2':
        return 'Lottie Token Assigner';
      case '3':
        return 'SVG Token Assigner';
      case '5':
        return 'Video to GIF Converter';
      case '4':
        return 'Youtube Transcriber';
      default:
        return 'Dashboard';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case '2': // Lottie Token Assigner ID
        return (
          <div className="flex-1 overflow-hidden">
            <LottieTokenAssign onBack={handleBackToDashboard} />
          </div>
        );
      case '3': // SVG Token Assigner ID
        return (
          <div className="flex-1 overflow-hidden">
            <SvgTokenAssign onBack={handleBackToDashboard} />
          </div>
        );
      case '5': // Video to GIF Converter ID
        return (
          <div className="flex-1 overflow-hidden">
            <VidToGif onBack={handleBackToDashboard} />
          </div>
        );
      case '4': // YouTube Video Transcriber ID
        return (
          <div className="flex-1 overflow-hidden">
            <YoutubeTranscriber onBack={handleBackToDashboard} />
          </div>
        );
      default:
        return (
          <div className="flex-1 p-8 bg-[var(--system-color-elevation-base-background)] overflow-y-auto">
            <Dashboard onToolSelect={handleToolSelect} />
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-[var(--system-color-elevation-base-background)] relative overflow-hidden">
      <LeftDrawer 
        isOpen={isDrawerOpen} 
        selectedItem={getCurrentSelectedTab()}
        onNavigation={handleNavigation}
      />
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0"
        style={{
          marginLeft: isDrawerOpen ? '300px' : '0px'
        }}
      >
        <TopBar onMenuClick={toggleDrawer} selectedItem={getCurrentSelectedTab()} />
        {renderCurrentView()}
      </div>
    </div>
  );
}
