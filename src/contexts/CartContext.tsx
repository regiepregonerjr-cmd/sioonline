import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.productID === product.productID
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.productID === product.productID
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: (item.quantity + 1) * item.product.price,
              }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product,
          quantity: 1,
          lineTotal: product.price,
        },
      ];
    });
  };

  const removeFromCart = (productID: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.productID !== productID));
  };

  const updateQuantity = (productID: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productID);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.productID === productID
          ? {
              ...item,
              quantity,
              lineTotal: quantity * item.product.price,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
