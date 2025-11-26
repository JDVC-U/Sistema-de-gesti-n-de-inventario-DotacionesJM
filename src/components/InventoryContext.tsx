import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  minStock: number;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: 'sale' | 'purchase';
  quantity: number;
  date: Date;
  userId: string;
}

export interface Invoice {
  id: string;
  number: string;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  invoices: Invoice[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  getLowStockProducts: () => Product[];
  getUpcomingInvoices: () => Invoice[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Mock data
const initialProducts: Product[] = [
  {
    id: '1',
    code: 'P001',
    name: 'Laptop Dell XPS 13',
    category: 'Electrónicos',
    price: 1299.99,
    stock: 5,
    status: 'active',
    minStock: 3
  },
  {
    id: '2',
    code: 'P002',
    name: 'Mouse Inalámbrico',
    category: 'Accesorios',
    price: 25.99,
    stock: 2,
    status: 'active',
    minStock: 10
  },
  {
    id: '3',
    code: 'P003',
    name: 'Monitor 4K Samsung',
    category: 'Electrónicos',
    price: 399.99,
    stock: 15,
    status: 'active',
    minStock: 5
  },
  {
    id: '4',
    code: 'P004',
    name: 'Teclado Mecánico',
    category: 'Accesorios',
    price: 89.99,
    stock: 1,
    status: 'active',
    minStock: 5
  }
];

const initialTransactions: Transaction[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Laptop Dell XPS 13',
    type: 'sale',
    quantity: 2,
    date: new Date('2024-01-15'),
    userId: '2'
  }
];

const initialInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-001',
    dueDate: new Date('2024-02-01'),
    amount: 2599.98,
    status: 'pending'
  },
  {
    id: '2',
    number: 'INV-002',
    dueDate: new Date('2024-01-20'),
    amount: 399.99,
    status: 'overdue'
  }
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updateData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updateData } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date()
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update product stock
    setProducts(prev => prev.map(product => {
      if (product.id === transaction.productId) {
        const stockChange = transaction.type === 'sale' ? -transaction.quantity : transaction.quantity;
        return { ...product, stock: product.stock + stockChange };
      }
      return product;
    }));
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= product.minStock);
  };

  const getUpcomingInvoices = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return invoices.filter(invoice => 
      invoice.status === 'pending' && invoice.dueDate <= nextWeek
    );
  };

  return (
    <InventoryContext.Provider value={{
      products,
      transactions,
      invoices,
      addProduct,
      updateProduct,
      deleteProduct,
      addTransaction,
      getLowStockProducts,
      getUpcomingInvoices
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}