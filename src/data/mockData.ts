import { User, Product } from '../types';

// Sample users
export const users: User[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'cashier1', password: 'cashier123', role: 'cashier' },
  { username: 'cashier2', password: 'cashier123', role: 'cashier' },
];

// Sample products with specified prices
export const products: Product[] = [
  {
    productID: 'P001',
    name: 'French Fries',
    price: 25,
    stockQty: 100,
    image: '/images/french-fries.jpg',
    category: 'food',
  },
  {
    productID: 'P002',
    name: 'Pork Siomai (3 pcs)',
    price: 25,
    stockQty: 150,
    image: '/images/pork-siomai.jpg',
    category: 'food',
  },
  {
    productID: 'P003',
    name: 'Pork Sisig',
    price: 75,
    stockQty: 50,
    image: '/images/pork-sisig.jpg',
    category: 'food',
  },
  {
    productID: 'P004',
    name: 'Pork Tocino',
    price: 85,
    stockQty: 60,
    image: '/images/pork-tocino.jpg',
    category: 'food',
  },
  {
    productID: 'P005',
    name: 'Premium Siomai (3 pcs)',
    price: 25,
    stockQty: 120,
    image: '/images/premium-siomai.jpg',
    category: 'food',
  },
  {
    productID: 'P006',
    name: 'Shrimp Siomai (3 pcs)',
    price: 25,
    stockQty: 100,
    image: '/images/shrimp-siomai.jpg',
    category: 'food',
  },
  {
    productID: 'P007',
    name: 'Sio Rice',
    price: 45,
    stockQty: 200,
    image: '/images/sio-rice.jpg',
    category: 'food',
  },
  {
    productID: 'P008',
    name: 'Beef Siomai (3 pcs)',
    price: 30,
    stockQty: 80,
    image: '/images/beef-siomai.jpg',
    category: 'food',
  },
  {
    productID: 'P009',
    name: 'Red Ice Tea (12oz)',
    price: 18,
    stockQty: 150,
    image: '/images/red-ice-tea.jpg',
    category: 'drinks',
  },
  {
    productID: 'P010',
    name: 'Black Gulaman (12oz)',
    price: 18,
    stockQty: 150,
    image: '/images/black-gulaman.jpg',
    category: 'drinks',
  },
];

// Generate unique ID
export const generateID = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
