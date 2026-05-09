import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Sale, CartItem, Payment, SalesContextType, Product } from '../types';
import { generateID } from '../data/mockData';

const SalesContext = createContext<SalesContextType | undefined>(undefined);

// In-memory storage for sales
let salesStorage: Sale[] = [];

// Stock storage - shared across the app
let stockStorage: Record<string, number> = {};

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);

  const createSale = (
    items: CartItem[],
    payment: Payment,
    cashier: string
  ): Sale | null => {
    if (items.length === 0) {
      return null;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // Calculate change
    payment.change = payment.amount - totalAmount;

    if (payment.change < 0) {
      return null; // Insufficient payment
    }

    // Deduct stock for each item
    items.forEach((item) => {
      const currentStock = stockStorage[item.product.productID] ?? item.product.stockQty;
      const newStock = Math.max(0, currentStock - item.quantity);
      stockStorage[item.product.productID] = newStock;
    });

    // Create sale items
    const saleItems = items.map((item) => ({
      saleItemID: generateID(),
      productID: item.product.productID,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }));

    const newSale: Sale = {
      saleID: generateID(),
      saleDate: new Date().toISOString(),
      items: saleItems,
      totalAmount,
      payment,
      cashier,
    };

    salesStorage = [...salesStorage, newSale];
    setSales(salesStorage);

    return newSale;
  };

  const getTotalSales = (): number => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const getSalesByDate = (date: string): Sale[] => {
    return sales.filter((sale) => sale.saleDate.startsWith(date));
  };

  // Get sales by date range
  const getSalesByDateRange = (startDate: string, endDate: string): Sale[] => {
    return sales.filter((sale) => {
      const saleDate = sale.saleDate.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  // Get weekly sales (last 7 days)
  const getWeeklySales = (): { date: string; amount: number; orders: number }[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const daySales = sales.filter((s) => s.saleDate.startsWith(date));
      return {
        date,
        amount: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
        orders: daySales.length,
      };
    });
  };

  // Get monthly sales (last 30 days grouped by week)
  const getMonthlySales = (): { week: string; amount: number; orders: number }[] => {
    const weeks: { week: string; amount: number; orders: number }[] = [];
    
    for (let i = 0; i < 4; i++) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - ((i + 1) * 7) + 1);
      
      const weekSales = sales.filter((s) => {
        const saleDate = new Date(s.saleDate);
        return saleDate >= startDate && saleDate <= endDate;
      });

      weeks.unshift({
        week: `Week ${4 - i}`,
        amount: weekSales.reduce((sum, s) => sum + s.totalAmount, 0),
        orders: weekSales.length,
      });
    }
    
    return weeks;
  };

  // Get low stock products
  const getLowStockProducts = (products: Product[]): Product[] => {
    return products.filter((p) => {
      const currentStock = stockStorage[p.productID] ?? p.stockQty;
      return currentStock <= 10;
    });
  };

  // Get current stock for a product
  const getProductStock = (productId: string, defaultStock: number): number => {
    return stockStorage[productId] ?? defaultStock;
  };

  // Update stock manually (for restocking)
  const updateStock = (productId: string, newStock: number): void => {
    stockStorage[productId] = newStock;
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        createSale,
        getTotalSales,
        getSalesByDate,
        getSalesByDateRange,
        getWeeklySales,
        getMonthlySales,
        getLowStockProducts,
        getProductStock,
        updateStock,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
