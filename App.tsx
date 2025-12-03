import React, { useState, useEffect } from 'react';
import { Project, Category } from './types';
import { getProjects, saveProjects, getCategories, saveCategories, getAppData, overwriteAppData } from './services/storageService';
import { initializeGoogleApi, handleLogin, handleLogout, syncToDrive, loadFromDrive } from './services/driveService';
import ProjectList from './components/ProjectList';
import ProjectDashboard from './components/ProjectDashboard';
import Button from './components/Button';
import { LogIn, LogOut, RefreshCw, Cloud, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Auth & Sync State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    setProjects(getProjects());
    setCategories(getCategories());

    const initGapi = async () => {
        try {
            // NOTE: process.env.GOOGLE_CLIENT_ID must be set in the environment
            if(process.env.GOOGLE_CLIENT_ID) {
                await initializeGoogleApi(process.env.GOOGLE_CLIENT_ID);
            } else {
                console.warn("GOOGLE_CLIENT_ID not found. Drive features disabled.");
            }
        } catch (e) {
            console.error("Failed to init Google API", e);
        }
    };
    initGapi();
  }, []);

  const onLogin = async () => {
      setAuthError(null);
      try {
          await handleLogin();
          setIsAuthenticated(true);
          // Auto-sync on login: Try to pull data
          await onSync(true); 
      } catch (err) {
          console.error(err);
          setAuthError("Login failed.");
      }
  };

  const onLogout = () => {
      handleLogout();
      setIsAuthenticated(false);
      setProjects(getProjects()); // Revert to local state if needed, though usually same
  };

  const onSync = async (isPull = false) => {
      if(!isAuthenticated) return;
      setIsSyncing(true);
      try {
          if (isPull) {
              const driveData = await loadFromDrive();
              if (driveData) {
                  overwriteAppData(driveData);
                  setProjects(driveData.projects);
                  setCategories(driveData.categories);
                  // Reload window or force update logic usually needed if deep children hold state, 
                  // but here simple state update is enough for main views.
              } else {
                  // No file exists, so push current local data to create it
                  await syncToDrive(getAppData());
              }
          } else {
              // Push
              await syncToDrive(getAppData());
          }
      } catch (e) {
          console.error("Sync error", e);
          setAuthError("Sync failed.");
      } finally {
          setIsSyncing(false);
      }
  };

  const handleCreateProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    if(isAuthenticated) onSync(false); // Auto-push
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
      setCategories(newCategories);
      saveCategories(newCategories);
      if(isAuthenticated) onSync(false); // Auto-push
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveProjectId(null)}
          >
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 3.666V3m0 7.666V19.833a1.833 1.833 0 01-1.833 1.833H5.833A1.833 1.833 0 014 19.833V15.75M9 7v12.833a1.833 1.833 0 001.833 1.833h9.334a1.833 1.833 0 001.833-1.833V9.5a1.833 1.833 0 00-1.833-1.833h-5.5M9 7a1.833 1.833 0 01-1.833-1.833V3.333M15 10.667v.083M15 14.833v.083" /></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">FinTrack<span className="text-indigo-600">Pro</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {activeProject && (
                <span className="text-sm text-gray-500 hidden md:block">
                    Project: <span className="font-medium text-indigo-600">{activeProject.name}</span>
                </span>
            )}
            
            {/* Auth Controls */}
            {process.env.GOOGLE_CLIENT_ID ? (
                isAuthenticated ? (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onSync(true)} disabled={isSyncing} className="hidden sm:flex">
                             <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                             Sync
                        </Button>
                        <Button variant="secondary" size="sm" onClick={onLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" onClick={onLogin}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Google Login
                    </Button>
                )
            ) : (
                <span className="text-xs text-gray-400 hidden sm:block">Local Mode</span>
            )}
          </div>
        </div>
        {authError && (
             <div className="bg-red-50 text-red-600 px-4 py-1 text-xs text-center flex justify-center items-center">
                 <AlertCircle className="h-3 w-3 mr-1" />
                 {authError}
             </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeProject ? (
          <ProjectDashboard 
            project={activeProject} 
            categories={categories}
            onUpdateCategories={handleUpdateCategories}
            onBack={() => setActiveProjectId(null)} 
          />
        ) : (
          <ProjectList 
            projects={projects} 
            onSelect={(p) => setActiveProjectId(p.id)} 
            onCreate={handleCreateProject} 
          />
        )}
      </main>
      
      <footer className="border-t border-slate-200 mt-auto py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <p>&copy; {new Date().getFullYear()} FinTrack Pro. All rights reserved.</p>
            {isAuthenticated && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs">
                    <Cloud className="h-3 w-3" />
                    <span>Cloud Sync Active</span>
                </div>
            )}
        </div>
      </footer>
    </div>
  );
};

export default App;