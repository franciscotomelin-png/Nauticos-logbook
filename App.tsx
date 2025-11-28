
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Embarkations from './components/Embarkations';
import Documents from './components/Documents';
import Notes from './components/Notes';
import CalendarView from './components/CalendarView';
import PlannedCourses from './components/PlannedCourses';
import SeaTimeCalculator from './components/SeaTimeCalculator';
import Auth from './components/Auth';
import { storageService } from './services/storageService';
import { authService } from './services/authService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const user = authService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
    }
    
    // Initialize demo data if empty
    storageService.seedData();
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setActiveTab('dashboard'); // Reset tab on logout
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'embarkations': return <Embarkations />;
      case 'calculator': return <SeaTimeCalculator />;
      case 'agenda': return <PlannedCourses />;
      case 'documents': return <Documents />;
      case 'notes': return <Notes />;
      case 'calendar': return <CalendarView />;
      default: return <Dashboard />;
    }
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}

export default App;
