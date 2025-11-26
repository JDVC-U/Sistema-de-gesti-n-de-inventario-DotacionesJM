import React from 'react';
import { useAuth } from './AuthContext';
import { useInventory } from './InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Package, FileText, DollarSign } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { products, getLowStockProducts, getUpcomingInvoices, transactions } = useInventory();

  const lowStockProducts = getLowStockProducts();
  const upcomingInvoices = getUpcomingInvoices();
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  // Calculate recent sales
  const recentSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.quantity, 0);

  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1>Dashboard - Administrador</h1>
          <p className="text-muted-foreground">Resumen general del inventario</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                productos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Stock Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">
                unidades en inventario
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ventas Recientes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentSales}</div>
              <p className="text-xs text-muted-foreground">
                unidades vendidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Productos con Stock Bajo
              </CardTitle>
              <CardDescription>
                Productos que necesitan reposición urgente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-muted-foreground">No hay productos con stock bajo</p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Código: {product.code}</p>
                      </div>
                      <Badge variant="destructive">
                        {product.stock} restantes
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Facturas Próximas a Vencer
              </CardTitle>
              <CardDescription>
                Facturas que vencen en los próximos 7 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInvoices.length === 0 ? (
                <p className="text-muted-foreground">No hay facturas próximas a vencer</p>
              ) : (
                <div className="space-y-2">
                  {upcomingInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">
                          Vence: {invoice.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                        ${invoice.amount.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard - Empleado</h1>
        <p className="text-muted-foreground">Listado rápido de productos en stock</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Disponibles</CardTitle>
          <CardDescription>
            Lista de productos con stock disponible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products
              .filter(product => product.stock > 0)
              .map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.code} • {product.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                    <Badge 
                      variant={product.stock <= product.minStock ? "destructive" : "secondary"}
                    >
                      Stock: {product.stock}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {lowStockProducts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {lowStockProducts.length} productos con stock bajo que requieren atención.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}