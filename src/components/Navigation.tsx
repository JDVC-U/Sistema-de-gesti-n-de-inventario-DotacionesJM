import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { 
  Package, 
  Plus, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'products', label: 'CRUD Productos', icon: Plus },
    { id: 'invoices', label: 'Facturas', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
  ];

  const employeeMenuItems = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'sales', label: 'Registrar Venta/Compra', icon: ShoppingCart },
    { id: 'invoices', label: 'Facturas', icon: FileText },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <h2 className="mb-6">Sistema de Inventario</h2>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Bienvenido</p>
          <p className="font-medium">{user?.username}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
      </div>

      <nav className="px-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-4 w-full px-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}