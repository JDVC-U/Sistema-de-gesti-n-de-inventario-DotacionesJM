import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { InventoryProvider } from './components/InventoryContext';
import { LoginForm } from './components/LoginForm';
import { RoleSelectionDialog } from './components/RoleSelectionDialog';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { InventoryManagement } from './components/InventoryManagement';
import { ProductCRUD } from './components/ProductCRUD';
import { SalesRegistration } from './components/SalesRegistration';
import { InvoiceManagement } from './components/InvoiceManagement';
import { Reports } from './components/Reports';
import { Alerts } from './components/Alerts';
import { Toaster } from './components/ui/sonner';

function MainApp() {
  const { isAuthenticated, user, needsRoleSelection, setUserRole, pendingOAuthUser } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Show role selection dialog if OAuth user needs to select role
  if (needsRoleSelection && pendingOAuthUser) {
    const username = pendingOAuthUser.user_metadata?.name || 
                     pendingOAuthUser.email?.split('@')[0] || 
                     'Usuario';
    
    return (
      <RoleSelectionDialog 
        username={username}
        onRoleSelect={setUserRole}
      />
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'inventory':
        return <InventoryManagement />;
      case 'products':
        return user?.role === 'admin' ? <ProductCRUD /> : <Dashboard />;
      case 'sales':
        return user?.role === 'employee' ? <SalesRegistration /> : <Dashboard />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'reports':
        return user?.role === 'admin' ? <Reports /> : <Dashboard />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return user?.role === 'admin' ? (
          <div className="space-y-6">
            <div>
              <h1>Configuración</h1>
              <p className="text-muted-foreground">Configuración del sistema (en desarrollo)</p>
            </div>
          </div>
        ) : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <MainApp />
      </InventoryProvider>
    </AuthProvider>
  );
}