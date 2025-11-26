import React, { useState } from 'react';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function SalesRegistration() {
  const { products, addTransaction } = useInventory();
  const { user } = useAuth();
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState<'sale' | 'purchase'>('sale');
  const [selectedProduct, setSelectedProduct] = useState(products[0] || null);

  // Find product by code
  const findProductByCode = (code: string) => {
    return products.find(p => p.code.toLowerCase() === code.toLowerCase());
  };

  const handleProductCodeChange = (code: string) => {
    setProductCode(code);
    const product = findProductByCode(code);
    setSelectedProduct(product || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Producto no encontrado');
      return;
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    // Check stock for sales
    if (transactionType === 'sale' && quantity > selectedProduct.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    // Add transaction
    addTransaction({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: transactionType,
      quantity: quantity,
      userId: user?.id || '1'
    });

    const action = transactionType === 'sale' ? 'Venta' : 'Compra';
    toast.success(`${action} registrada correctamente`);

    // Reset form
    setProductCode('');
    setQuantity(1);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Registrar Venta/Compra</h1>
        <p className="text-muted-foreground">Registra movimientos de inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Nueva Transacción
            </CardTitle>
            <CardDescription>
              Registra una venta o compra de productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionType">Tipo de Transacción</Label>
                <Select value={transactionType} onValueChange={(value: 'sale' | 'purchase') => setTransactionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="purchase">Compra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCode">Código del Producto</Label>
                <Input
                  id="productCode"
                  value={productCode}
                  onChange={(e) => handleProductCodeChange(e.target.value)}
                  placeholder="Ingresa el código del producto"
                  required
                />
                {productCode && !selectedProduct && (
                  <p className="text-sm text-destructive">Producto no encontrado</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
                {selectedProduct && transactionType === 'sale' && quantity > selectedProduct.stock && (
                  <p className="text-sm text-destructive">
                    Stock insuficiente (disponible: {selectedProduct.stock})
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!selectedProduct || (transactionType === 'sale' && quantity > selectedProduct.stock)}
              >
                Confirmar {transactionType === 'sale' ? 'Venta' : 'Compra'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información del Producto
            </CardTitle>
            <CardDescription>
              Detalles del producto seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Código</Label>
                    <p className="font-mono">{selectedProduct.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Categoría</Label>
                    <p>{selectedProduct.category}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Precio</Label>
                    <p className="text-lg font-semibold">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Stock Actual</Label>
                    <div className="flex items-center gap-2">
                      <span className={selectedProduct.stock <= selectedProduct.minStock ? 'text-destructive font-medium' : 'text-lg font-semibold'}>
                        {selectedProduct.stock}
                      </span>
                      {selectedProduct.stock <= selectedProduct.minStock && (
                        <Badge variant="destructive" className="text-xs">
                          Bajo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {selectedProduct.stock <= selectedProduct.minStock && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este producto tiene stock bajo. Stock mínimo: {selectedProduct.minStock}
                    </AlertDescription>
                  </Alert>
                )}

                {transactionType === 'sale' && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Resumen de la venta</p>
                    <p className="font-medium">
                      {quantity} x ${selectedProduct.price.toFixed(2)} = ${(quantity * selectedProduct.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock restante: {selectedProduct.stock - quantity}
                    </p>
                  </div>
                )}

                {transactionType === 'purchase' && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Resumen de la compra</p>
                    <p className="font-medium">
                      +{quantity} unidades
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nuevo stock: {selectedProduct.stock + quantity}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingresa un código de producto para ver los detalles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Product Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Referencia Rápida de Productos</CardTitle>
          <CardDescription>
            Lista de códigos de productos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => handleProductCodeChange(product.code)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm">{product.code}</p>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <Badge variant={product.stock <= product.minStock ? 'destructive' : 'secondary'}>
                    {product.stock}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}