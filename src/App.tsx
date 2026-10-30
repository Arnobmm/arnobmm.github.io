import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedProject } from './components/FeaturedProject';
import { ProjectShowcase } from './components/ProjectShowcase';
import { CurrentlyExploring } from './components/CurrentlyExploring';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ProjectDetail } from './components/ProjectDetail';
import { PROJECTS } from './data/projects';

export const App: React.FC = () => {
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null);

  // Sync state with URL pathname or hash (supporting /projects/:slug and #projects/:slug)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // Check path first
      const pathMatch = path.match(/\/projects\/([a-zA-Z0-9_-]+)/);
      if (pathMatch && pathMatch[1]) {
        const found = PROJECTS.find((p) => p.slug === pathMatch[1]);
        if (found) {
          setCurrentProjectSlug(found.slug);
          return;
        }
      }

      // Check hash fallback (for preview iframes and hash routing)
      const hashMatch = hash.match(/#\/?projects\/([a-zA-Z0-9_-]+)/);
      if (hashMatch && hashMatch[1]) {
        const found = PROJECTS.find((p) => p.slug === hashMatch[1]);
        if (found) {
          setCurrentProjectSlug(found.slug);
          return;
        }
      }

      setCurrentProjectSlug(null);
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleOpenProject = (slug: string) => {
    setCurrentProjectSlug(slug);
    // Update hash and history for clean URL state in preview
    window.history.pushState(null, '', `#projects/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProjects = () => {
    setCurrentProjectSlug(null);
    window.history.pushState(null, '', window.location.pathname);
    setTimeout(() => {
      const el = document.getElementById('showcase');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleNavigateHome = () => {
    setCurrentProjectSlug(null);
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreProjects = () => {
    const el = document.getElementById('featured') || document.getElementById('showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Find active project if on detail view
  const activeProject = currentProjectSlug
    ? PROJECTS.find((p) => p.slug === currentProjectSlug)
    : null;

  // Render Project Detail View
  if (activeProject) {
    return (
      <div className="min-h-screen bg-[#080914] text-[#f4f4f5]">
        <Navbar
          onNavigateHome={handleNavigateHome}
          onOpenSandbox={() => handleOpenProject('sandbox')}
          isDetailPage={true}
        />
        <ProjectDetail
          project={activeProject}
          onBack={handleBackToProjects}
          onSelectProject={handleOpenProject}
          allProjects={PROJECTS}
        />
        <Footer onNavigateHome={handleNavigateHome} />
      </div>
    );
  }

  // Find Featured Project
  const featuredProject = PROJECTS.find((p) => p.featured) || PROJECTS[0];

  // Render Continuous Homepage
  return (
    <div className="min-h-screen bg-[#080914] text-[#f4f4f5] selection:bg-[#a3e635] selection:text-black">
      <Navbar
        onNavigateHome={handleNavigateHome}
        onOpenSandbox={() => handleOpenProject('sandbox')}
        isDetailPage={false}
      />
      <Hero onExploreProjects={handleExploreProjects} />
      <FeaturedProject project={featuredProject} onOpenProject={handleOpenProject} />
      <ProjectShowcase projects={PROJECTS} onOpenProject={handleOpenProject} />
      <CurrentlyExploring />
      <AboutSection />
      <Footer onNavigateHome={handleNavigateHome} />
    </div>
  );
};

export default App;
