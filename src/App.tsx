import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ProjectOne } from './components/ProjectOne';
import { ProjectTwo } from './components/ProjectTwo';

type ViewMode = 'home' | 'project-one' | 'project-two';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  // Support URL hash changes or internal navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('project-one')) {
        setCurrentView('project-one');
      } else if (hash.includes('project-two')) {
        setCurrentView('project-two');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'home') {
      window.location.hash = 'portfolio';
    } else {
      window.location.hash = view;
    }
  };

  if (currentView === 'project-one') {
    return <ProjectOne onBack={() => handleNavigate('home')} />;
  }

  if (currentView === 'project-two') {
    return <ProjectTwo onBackToPortfolio={() => handleNavigate('home')} />;
  }

  return <Home onNavigate={handleNavigate} />;
};

export default App;
