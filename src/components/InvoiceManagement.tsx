import React, { useState, useRef } from 'react';
import { useInventory } from './InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { FileText, Upload, Search, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function InvoiceManagement() {
  const { invoices } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => 
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing
      setTimeout(() => {
        setUploadSuccess(true);
        toast.success('Factura cargada exitosamente');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      }, 1000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary">Pagada</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencida</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Calculate statistics
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1>Gestión de Facturas</h1>
        <p className="text-muted-foreground">Administra y carga facturas del sistema</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">facturas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">por pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vencidas</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">valor total</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cargar Facturas
          </CardTitle>
          <CardDescription>
            Sube archivos Excel con facturas para procesar automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel-file">Archivo Excel</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-6"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo Excel
            </Button>
          </div>

          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Factura cargada exitosamente. Los datos han sido procesados y añadidos al sistema.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>• Formatos soportados: .xlsx, .xls</p>
            <p>• El archivo debe contener las columnas: Número, Fecha de Vencimiento, Monto, Estado</p>
            <p>• Las facturas duplicadas serán ignoradas automáticamente</p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
          <CardDescription>
            Todas las facturas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha de Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Días para Vencer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No se encontraron facturas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const now = new Date();
                    const dueDate = new Date(invoice.dueDate);
                    const diffTime = dueDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.number}</TableCell>
                        <TableCell>
                          <span className={diffDays < 0 ? 'text-destructive font-medium' : diffDays <= 7 ? 'text-orange-600 font-medium' : ''}>
                            {invoice.dueDate.toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          {diffDays < 0 ? (
                            <span className="text-destructive font-medium">
                              Vencida ({Math.abs(diffDays)} días)
                            </span>
                          ) : diffDays <= 7 ? (
                            <span className="text-orange-600 font-medium">
                              {diffDays} días
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {diffDays} días
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Total: {filteredInvoices.length} facturas</span>
            <span>Monto total: ${filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0).toFixed(2)}</span>
            <span className="text-destructive">
              Vencidas: {filteredInvoices.filter(invoice => {
                const now = new Date();
                const dueDate = new Date(invoice.dueDate);
                return dueDate < now;
              }).length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}