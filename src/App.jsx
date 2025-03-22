import React, { useState } from 'react'
import { Routes, Route, Link, useLocation, BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import Dashboard from './pages/Dashboard'
import Alunos from './pages/Alunos'
import Login from './pages/Login'
import Onibus from './pages/Onibus'
import Rotas from './pages/Rotas'
import Viagens from './pages/Viagens'
import Monitores from './pages/Monitores'
import Motoristas from './pages/Motoristas'
import Paradas from './pages/Paradas'
import Horarios from './pages/Horarios'
import Reports from './pages/Reports'
import brasaoLogo from './assets/images/Brasao.png'

// The App component is the only one using BrowserRouter now
const App = () => {
  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true
    }}>
      <AppContent />
    </BrowserRouter>
  );
}

// The main app content extracted into a separate component
const AppContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path || 
           (location.pathname === '/' && path === '/dashboard');
  };
  
  // Don't render sidebar on login page
  if (location.pathname === '/login') {
    return (
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <div className="h-screen flex flex-col md:flex-row w-full bg-blue-50 overflow-hidden">
        {/* Sidebar - Always visible but collapsible on smaller screens */}
        <div className={`
          bg-gray-800 text-white transition-all duration-300 
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          flex-shrink-0 sticky top-0 h-screen z-30
        `}>
          {/* Sidebar Header with Toggle Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <img 
                  src={brasaoLogo}
                  alt="Brasão de Navegantes" 
                  className="h-10 w-auto mr-3"
                />
                <div>
                  <h2 className="text-xl font-bold text-blue-400">Coracao</h2>
                  <p className="text-sm text-gray-400">Sistema de Transporte</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="flex justify-center w-full">
                <img 
                  src={brasaoLogo}
                  alt="Brasão de Navegantes" 
                  className="h-8 w-auto"
                />
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`text-gray-400 hover:text-white p-1 rounded-md ${sidebarCollapsed ? 'mx-auto' : ''}`}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="mt-4 overflow-y-auto h-[calc(100%-4rem)]">
            <ul>
              <li>
                <Link 
                  to="/dashboard"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/dashboard') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Dashboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/onibus"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/onibus') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Ônibus"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 6v-4m4 4v-4" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Ônibus</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/alunos"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/alunos') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Alunos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Alunos</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/rotas"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/rotas') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Rotas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Rotas</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/paradas"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/paradas') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Paradas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Paradas</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/horarios"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/horarios') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Horários"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Horários</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/viagens"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/viagens') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Viagens"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Viagens</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/motoristas"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/motoristas') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Motoristas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Motoristas</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/monitores"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/monitores') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Monitores"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Monitores</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/relatorios"
                  className={`flex items-center py-3 px-4 w-full text-left ${isActive('/relatorios') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  title="Relatórios"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Relatórios</span>}
                </Link>
              </li>
              <li className="mt-6 border-t border-gray-700 pt-4">
                <Link 
                  to="/login"
                  className="flex items-center py-3 px-4 w-full text-left text-gray-300 hover:bg-gray-700"
                  title="Sair"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {!sidebarCollapsed && <span className="ml-3">Sair</span>}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 h-full bg-blue-50 overflow-auto">
          <main className="px-6 py-4 w-full h-full">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="alunos/*" element={<Alunos />} />
              <Route path="onibus/*" element={<Onibus />} />
              <Route path="rotas/*" element={<Rotas />} />
              <Route path="paradas/*" element={<Paradas />} />
              <Route path="horarios/*" element={<Horarios />} />
              <Route path="viagens/*" element={<Viagens />} />
              <Route path="motoristas/*" element={<Motoristas />} />
              <Route path="monitores/*" element={<Monitores />} />
              <Route path="relatorios/*" element={<Reports />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;