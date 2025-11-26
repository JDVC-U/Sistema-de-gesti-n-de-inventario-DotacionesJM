import React, { useState } from 'react';
import { useInventory } from './InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Reports() {
  const { products, transactions } = useInventory();
  const [reportType, setReportType] = useState('sales');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
        <h1>Reportes</h1>
        <p className="text-muted-foreground">Genera reportes detallados de transacciones y análisis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Generador de Reportes
          </CardTitle>
          <CardDescription>
            Configura y genera reportes personalizados de ventas y compras
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

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Ventas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  unidades vendidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Compras</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  unidades compradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Transacciones</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTransactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  movimientos totales
                </p>
              </CardContent>
            </Card>
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
              Generar Reporte (Excel/PDF)
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
                      No hay transacciones para mostrar con los filtros seleccionados
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