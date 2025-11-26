import React, { useState } from 'react';
import { useInventory } from './InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertTriangle, FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AlertsAndReports() {
  const { products, transactions, invoices, getLowStockProducts, getUpcomingInvoices } = useInventory();
  const [reportType, setReportType] = useState('sales');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const lowStockProducts = getLowStockProducts();
  const upcomingInvoices = getUpcomingInvoices();
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filter transactions for reports
  const getFilteredTransactions = () => {
    let filtered = transactions.filter(t => {
      if (reportType !== 'all' && t.type !== reportType) return false;
      
      const transactionDate = new Date(t.date);
      const now = new Date();
      
      if (dateFilter === 'today') {
        return transactionDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      }
      
      return true;
    });

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => {
        const product = products.find(p => p.id === t.productId);
        return product?.category === categoryFilter;
      });
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  const generateReport = () => {
    const reportData = {
      type: reportType,
      dateFilter,
      categoryFilter,
      transactions: filteredTransactions,
      summary: {
        totalSales: filteredTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.quantity, 0),
        totalPurchases: filteredTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.quantity, 0),
        totalTransactions: filteredTransactions.length
      }
    };

    // In a real app, this would generate and download a real file
    console.log('Report data:', reportData);
    toast.success('Reporte generado correctamente (ver consola)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Alertas y Reportes</h1>
        <p className="text-muted-foreground">Monitorea el estado del inventario y genera reportes</p>
      </div>

      {/* Alerts Section */}
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

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generador de Reportes</CardTitle>
          <CardDescription>
            Configura y genera reportes personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las transacciones</SelectItem>
                  <SelectItem value="sales">Solo ventas</SelectItem>
                  <SelectItem value="purchase">Solo compras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Ventas: {filteredTransactions.filter(t => t.type === 'sale').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-blue-500" />
                <span>Compras: {filteredTransactions.filter(t => t.type === 'purchase').length}</span>
              </div>
              <span>Total: {filteredTransactions.length} transacciones</span>
            </div>
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>

          {/* Report Preview */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay transacciones para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'sale' ? 'default' : 'secondary'}>
                          {transaction.type === 'sale' ? 'Venta' : 'Compra'}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.productName}</TableCell>
                      <TableCell>
                        <span className={transaction.type === 'sale' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.type === 'sale' ? '-' : '+'}{transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell>Usuario {transaction.userId}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length > 10 && (
            <p className="text-sm text-muted-foreground text-center">
              Mostrando 10 de {filteredTransactions.length} transacciones. 
              Genera el reporte para ver todos los datos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}