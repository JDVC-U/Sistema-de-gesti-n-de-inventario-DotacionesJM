import React from 'react';
import { useInventory } from './InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, FileText, Calendar } from 'lucide-react';

export function Alerts() {
  const { getLowStockProducts, getUpcomingInvoices } = useInventory();

  const lowStockProducts = getLowStockProducts();
  const upcomingInvoices = getUpcomingInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1>Alertas del Sistema</h1>
        <p className="text-muted-foreground">Monitorea alertas críticas de stock e invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Stock Escaso
            </CardTitle>
            <CardDescription>
              Productos que necesitan reposición urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay productos con stock bajo</p>
                <p className="text-sm mt-2">¡Excelente! Todos los productos tienen stock suficiente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <Alert key={product.id} className="border-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm">Código: {product.code}</p>
                          <p className="text-sm text-muted-foreground">Categoría: {product.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {product.stock} restantes
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Mín: {product.minStock}
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
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
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay facturas próximas a vencer</p>
                <p className="text-sm mt-2">Todas las facturas están al día o ya fueron pagadas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInvoices.map((invoice) => (
                  <Alert key={invoice.id} className={invoice.status === 'overdue' ? 'border-destructive' : 'border-orange-500'}>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm">
                            Vence: {invoice.dueDate.toLocaleDateString()}
                          </p>
                          {invoice.status === 'overdue' && (
                            <p className="text-sm text-destructive font-medium">
                              ⚠️ VENCIDA
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                            ${invoice.amount.toFixed(2)}
                          </Badge>
                          <p className="text-xs text-muted-foreground capitalize">
                            {invoice.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Alertas</CardTitle>
          <CardDescription>
            Estado general de las alertas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium">Productos con Stock Bajo</p>
                  <p className="text-sm text-muted-foreground">Requieren reposición inmediata</p>
                </div>
              </div>
              <Badge variant={lowStockProducts.length === 0 ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                {lowStockProducts.length}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium">Facturas por Vencer</p>
                  <p className="text-sm text-muted-foreground">Próximos 7 días</p>
                </div>
              </div>
              <Badge variant={upcomingInvoices.length === 0 ? "secondary" : "outline"} className="text-lg px-3 py-1">
                {upcomingInvoices.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}