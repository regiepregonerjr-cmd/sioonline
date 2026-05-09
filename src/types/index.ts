// User types
export interface User {
  username: string;
  password: string;
  role: 'admin' | 'cashier';
}

// Product types
export interface Product {
  productID: string;
  name: string;
  price: number;
  stockQty: number;
  image: string;
  category: 'food' | 'drinks';
}

// Sale Item types
export interface SaleItem {
  saleItemID: string;
  productID: string;
  productName: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

// Sale types
export interface Sale {
  saleID: string;
  saleDate: string;
  items: SaleItem[];
  totalAmount: number;
  payment: Payment;
  cashier: string;
}

// Payment types
export interface Payment {
  amount: number;
  change: number;
  method: 'cash' | 'gcash' | 'card';
}

// Cart Item types
export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

// Cart context types
export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productID: string) => void;
  updateQuantity: (productID: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

// Sales context types
export interface SalesContextType {
  sales: Sale[];
  createSale: (items: CartItem[], payment: Payment, cashier: string) => Sale | null;
  getTotalSales: () => number;
  getSalesByDate: (date: string) => Sale[];
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[];
  getWeeklySales: () => { date: string; amount: number; orders: number }[];
  getMonthlySales: () => { week: string; amount: number; orders: number }[];
  getLowStockProducts: (products: Product[]) => Product[];
  getProductStock: (productId: string, defaultStock: number) => number;
  updateStock: (productId: string, newStock: number) => void;
}
