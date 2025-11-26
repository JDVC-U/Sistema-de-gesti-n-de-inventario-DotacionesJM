import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Shield, User } from 'lucide-react';
import type { UserRole } from './AuthContext';

interface RoleSelectionDialogProps {
  onRoleSelect: (role: UserRole) => void;
  username: string;
}

export function RoleSelectionDialog({ onRoleSelect, username }: RoleSelectionDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRoleSelect(selectedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Bienvenido, {username}!</CardTitle>
          <CardDescription className="text-center">
            Por favor, selecciona tu rol en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="role-select">Rol del Usuario</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Empleado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role descriptions */}
            <div className="space-y-3">
              {selectedRole === 'employee' ? (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Empleado</p>
                      <p className="text-sm text-muted-foreground">
                        Acceso a inventario, registro de ventas/compras, consulta de facturas y alertas
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">Administrador</p>
                      <p className="text-sm text-muted-foreground">
                        Acceso completo al sistema: inventario, CRUD productos, facturas, reportes, alertas y configuración
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">
              Continuar al Sistema
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
