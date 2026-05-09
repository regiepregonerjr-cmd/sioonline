import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { products as initialProducts } from '../data/mockData';
import { Sale, Product } from '../types';
import { useSales } from '../contexts/SalesContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { getProductStock, getLowStockProducts } = useSales();
  const navigate = useNavigate();
  
  // Local state for products with real-time stock
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Refresh stock levels
  const refreshStock = () => {
    setProducts(products.map(p => ({
      ...p,
      stockQty: getProductStock(p.productID, p.stockQty)
    })));
  };

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'meals' | 'snacks' | 'drinks'>('all');
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [gcashReference, setGcashReference] = useState('');
  const [gcashQRImage, setGcashQRImage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [showInsufficientPopup, setShowInsufficientPopup] = useState(false);
  const [insufficientAmount, setInsufficientAmount] = useState(0);

  // Load GCash QR from localStorage on mount
  React.useEffect(() => {
    const savedQR = localStorage.getItem('gcashQRImage');
    if (savedQR) {
      setGcashQRImage(savedQR);
    }
  }, []);

  // Filter products by category
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'meals') return product.category === 'food' && ['Pork Sisig', 'Pork Tocino', 'Sio Rice'].some(name => product.name.includes(name));
    if (selectedCategory === 'snacks') return product.category === 'food' && ['Siomai', 'French Fries'].some(name => product.name.includes(name));
    if (selectedCategory === 'drinks') return product.category === 'drinks';
    return true;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const tax = total * 0.12; // 12% VAT
  const grandTotal = total;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setPaymentError('');
    setGcashReference('');
    setCashAmount('');
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setGcashQRImage(result);
        localStorage.setItem('gcashQRImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processPayment = () => {
    setPaymentError('');

    if (paymentMethod === 'cash') {
      const amount = parseFloat(cashAmount);
      if (!amount || amount < grandTotal) {
        const shortfall = grandTotal - (amount || 0);
        setInsufficientAmount(shortfall);
        setShowInsufficientPopup(true);
        return;
      }

      const sale: Sale = {
        saleID: Date.now().toString(36),
        saleDate: new Date().toISOString(),
        items: cart.map(item => ({
          saleItemID: Math.random().toString(36).substr(2, 9),
          productID: item.product.productID,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        totalAmount: grandTotal,
        payment: {
          amount: amount,
          change: amount - grandTotal,
          method: 'cash',
        },
        cashier: user?.username || 'Unknown',
      };

      setCurrentSale(sale);
      setShowPaymentModal(false);
      setShowReceipt(true);
      clearCart();
      setCashAmount('');
    } else {
      // GCash payment
      if (!gcashReference || gcashReference.length < 4) {
        setPaymentError('Please enter a valid GCash reference number (at least 4 characters).');
        return;
      }

      const sale: Sale = {
        saleID: Date.now().toString(36),
        saleDate: new Date().toISOString(),
        items: cart.map(item => ({
          saleItemID: Math.random().toString(36).substr(2, 9),
          productID: item.product.productID,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        totalAmount: grandTotal,
        payment: {
          amount: grandTotal,
          change: 0,
          method: 'gcash',
        },
        cashier: user?.username || 'Unknown',
      };

      setCurrentSale(sale);
      setShowPaymentModal(false);
      setShowReceipt(true);
      clearCart();
      setGcashReference('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-wide">SIO REPUBLIC</h1>
              <p className="text-xs text-orange-500 font-medium tracking-wider">HINUNANGAN BRANCH</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Cashier: <span className="font-medium text-gray-800">{user?.username}</span></p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition"
            >
              ADMIN PORTAL
            </button>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Menu Items */}
        <div className="flex-1 flex flex-col">
          {/* Category Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex gap-2">
              {(['all', 'meals', 'snacks', 'drinks'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 text-sm font-medium rounded transition ${
                    selectedCategory === category
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'ALL ITEMS' : category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Menu Items</h2>
            <div className="grid grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.productID}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 transition group text-left"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                  </div>
                  <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-orange-500 font-bold">₱{product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Current Order */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Order Header */}
          <div className="bg-gray-800 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">CURRENT ORDER</h2>
              <span className="text-2xl font-bold">#{cartItemCount.toString().padStart(3, '0')}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No items in cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.productID} className="flex justify-between items-start py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.product.productID, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.productID, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.productID)}
                          className="text-red-400 hover:text-red-600 text-xs ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-gray-800">₱{item.lineTotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (Non-VAT)</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-300">
                <span>TOTAL</span>
                <span className="text-orange-500">₱{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="py-3 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="py-3 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 transition disabled:opacity-50"
              >
                PAY NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white px-6 py-2 text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              SYSTEM STATUS: ONLINE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              DATABASE: CONNECTED (AIVEN MYSQL)
            </span>
          </div>
          <p>© 2024 SIO REPUBLIC SYSTEM</p>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Payment</h3>
                <p className="text-sm text-gray-500">Select payment method</p>
              </div>

              {/* Total Amount */}
              <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Amount to Pay</p>
                <p className="text-3xl font-bold text-orange-500">₱{grandTotal.toFixed(2)}</p>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setPaymentMethod('cash');
                    setPaymentError('');
                  }}
                  className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === 'cash'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cash
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod('gcash');
                    setPaymentError('');
                  }}
                  className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === 'gcash'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  GCash
                </button>
              </div>

              {/* Cash Payment Form */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cash Received <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => {
                        setCashAmount(e.target.value);
                        setPaymentError('');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold focus:border-gray-800 focus:outline-none"
                      placeholder="Enter amount"
                      autoFocus
                    />
                  </div>

                  {/* Change Display */}
                  {cashAmount && parseFloat(cashAmount) >= grandTotal && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Change:</span>
                        <span className="text-2xl font-bold text-green-700">
                          ₱{(parseFloat(cashAmount) - grandTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GCash Payment Form */}
              {paymentMethod === 'gcash' && (
                <div className="space-y-4">
                  {/* QR Code Upload / Display */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3 text-center">Owner&apos;s GCash QR Code</p>
                    {gcashQRImage ? (
                      <div className="relative">
                        <img 
                          src={gcashQRImage} 
                          alt="GCash QR Code" 
                          className="w-40 h-40 mx-auto object-contain border-2 border-gray-200 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setGcashQRImage(null);
                            localStorage.removeItem('gcashQRImage');
                          }}
                          className="absolute top-0 right-1/3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          title="Remove QR Code"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <label className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition">
                          Upload QR
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQRUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center mt-2">Upload owner&apos;s GCash QR code</p>
                  </div>

                  {/* GCash Reference Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GCash Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={gcashReference}
                      onChange={(e) => {
                        setGcashReference(e.target.value.toUpperCase());
                        setPaymentError('');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold tracking-wider uppercase focus:border-blue-500 focus:outline-none"
                      placeholder="Enter reference number"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ask customer for the GCash reference number</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {paymentError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {paymentError}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={processPayment}
                  disabled={
                    paymentMethod === 'cash' 
                      ? (!cashAmount || parseFloat(cashAmount) < grandTotal)
                      : (!gcashReference || gcashReference.length < 4)
                  }
                  className={`w-full py-3 font-bold rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    paymentMethod === 'cash'
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {paymentMethod === 'cash' ? 'Complete Cash Payment' : 'Verify & Complete Payment'}
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentError('');
                    setCashAmount('');
                    setGcashReference('');
                  }}
                  className="w-full py-3 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Payment Popup */}
      {showInsufficientPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform animate-bounce-in">
            <div className="p-6 text-center">
              {/* Warning Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-red-600 mb-2">Insufficient Payment!</h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-4">
                The amount received is not enough.
              </p>
              
              {/* Amount Details */}
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Additional amount needed:</p>
                <p className="text-3xl font-bold text-red-600">₱{insufficientAmount.toFixed(2)}</p>
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => setShowInsufficientPopup(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                OK, I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && currentSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h2 className="text-xl font-bold">SIO REPUBLIC</h2>
              <p className="text-sm text-gray-500">Hinunangan Branch</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(currentSale.saleDate)}</p>
              <p className="text-xs text-gray-400">Order #{currentSale.saleID.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="px-6 py-4 border-t border-b border-dashed border-gray-300">
              {currentSale.items.map((item) => (
                <div key={item.saleItemID} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.productName}</span>
                  <span>₱{item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

              <div className="px-6 py-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal</span>
                  <span>₱{currentSale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span>₱{currentSale.totalAmount.toFixed(2)}</span>
                </div>
                {currentSale.payment.method === 'cash' ? (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Cash</span>
                      <span>₱{currentSale.payment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change</span>
                      <span>₱{currentSale.payment.change.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-600 font-medium">Payment Method: Cash</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600 font-medium">Payment Method: GCash</p>
                    <p className="text-xs text-gray-600">Ref #: {gcashReference || 'N/A'}</p>
                  </div>
                )}
              </div>

            <div className="px-6 py-4 border-t text-center">
              <p className="text-xs text-gray-500">Cashier: {currentSale.cashier}</p>
              <p className="text-xs text-gray-400 mt-1">Thank you for your order!</p>
              <p className="text-xs text-gray-400">Please come again!</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full py-3 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 transition"
              >
                CLOSE RECEIPT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
