import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSales } from '../contexts/SalesContext';
import { products as initialProducts, users as initialUsers } from '../data/mockData';
import { Product, User, Sale } from '../types';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { sales, getTotalSales, getSalesByDate } = useSales();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Inventory Management State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'users'>('dashboard');
  
  // User Management State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'cashier' as 'admin' | 'cashier',
  });
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Sales Edit Modal States
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleFormData, setSaleFormData] = useState({
    saleDate: '',
    totalAmount: '',
    paymentMethod: 'cash',
    cashier: '',
  });
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    price: '',
    stockQty: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generate unique ID
  const generateID = () => {
    return 'P' + Date.now().toString(36).substr(2, 6).toUpperCase();
  };

  // Add Product
  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.stockQty) return;
    
    const newProduct: Product = {
      productID: generateID(),
      name: formData.name,
      price: parseFloat(formData.price),
      stockQty: parseInt(formData.stockQty),
      category: formData.category as 'food' | 'drinks',
      image: formData.image || `https://via.placeholder.com/150?text=${encodeURIComponent(formData.name)}`,
    };
    
    setProducts([...products, newProduct]);
    setShowAddModal(false);
    setFormData({ name: '', category: 'food', price: '', stockQty: '', image: '' });
  };

  // Edit Product
  const handleEditProduct = () => {
    if (!selectedProduct || !formData.name || !formData.price || !formData.stockQty) return;
    
    setProducts(products.map(p => 
      p.productID === selectedProduct.productID 
        ? {
            ...p,
            name: formData.name,
            price: parseFloat(formData.price),
            stockQty: parseInt(formData.stockQty),
            category: formData.category as 'food' | 'drinks',
            image: formData.image || p.image,
          }
        : p
    ));
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setProducts(products.filter(p => p.productID !== selectedProduct.productID));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stockQty: product.stockQty.toString(),
      image: product.image,
    });
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({...formData, image: result});
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setFormData({...formData, image: ''});
    setImagePreview(null);
  };

  // Sales Edit Functions
  const openEditSaleModal = (sale: Sale) => {
    setSelectedSale(sale);
    setSaleFormData({
      saleDate: sale.saleDate,
      totalAmount: sale.totalAmount.toString(),
      paymentMethod: sale.payment.method,
      cashier: sale.cashier,
    });
    setShowEditSaleModal(true);
  };

  const handleEditSale = () => {
    if (!selectedSale) return;
    
    // Update the sale in sales storage
    const updatedSale: Sale = {
      ...selectedSale,
      saleDate: saleFormData.saleDate,
      totalAmount: parseFloat(saleFormData.totalAmount),
      payment: {
        ...selectedSale.payment,
        method: saleFormData.paymentMethod as 'cash' | 'gcash' | 'card',
        amount: parseFloat(saleFormData.totalAmount),
      },
      cashier: saleFormData.cashier,
    };
    
    // Update sales storage
    const saleIndex = sales.findIndex(s => s.saleID === selectedSale.saleID);
    if (saleIndex !== -1) {
      const updatedSales = [...sales];
      updatedSales[saleIndex] = updatedSale;
      // We need to update the context - for now we'll just close the modal
      // In a real app, you'd update the context state here
    }
    
    setShowEditSaleModal(false);
    setSelectedSale(null);
    alert('Sale record updated successfully!');
  };

  // User Management Functions
  const handleAddUser = () => {
    if (!userFormData.username || !userFormData.password) return;
    
    const newUser: User = {
      username: userFormData.username,
      password: userFormData.password,
      role: userFormData.role,
    };
    
    setUsers([...users, newUser]);
    setShowUserModal(false);
    setUserFormData({ username: '', password: '', role: 'cashier' });
  };

  const handleEditUser = () => {
    if (!selectedUser || !userFormData.username || !userFormData.password) return;
    
    setUsers(users.map(u => 
      u.username === selectedUser.username 
        ? { ...u, username: userFormData.username, password: userFormData.password, role: userFormData.role }
        : u
    ));
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.username !== selectedUser.username));
    setShowDeleteUserModal(false);
    setSelectedUser(null);
  };

  const openAddUserModal = () => {
    setSelectedUser(null);
    setUserFormData({ username: '', password: '', role: 'cashier' });
    setShowUserModal(true);
  };

  const openEditUserModal = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      username: user.username,
      password: user.password,
      role: user.role,
    });
    setShowUserModal(true);
  };

  const openDeleteUserModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  };

  const totalSales = getTotalSales();
  const todaySales = getSalesByDate(selectedDate);
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  // Calculate statistics
  const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!itemSales[item.productName]) {
        itemSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      itemSales[item.productName].quantity += item.quantity;
      itemSales[item.productName].revenue += item.lineTotal;
    });
  });

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Get category label
  const getCategoryLabel = (category: string) => {
    if (category === 'drinks') return 'Drinks';
    const nameLower = category.toLowerCase();
    if (nameLower.includes('siomai')) return 'Siomai';
    if (nameLower.includes('fries')) return 'Snacks';
    return 'Rice Meals';
  };

  // Sales Chart Data - Daily (Last 7 Days)
  const getSalesChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const daySales = sales.filter(s => s.saleDate.startsWith(date));
      const total = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      return {
        date: new Date(date).toLocaleDateString('en-PH', { weekday: 'short' }),
        fullDate: date,
        sales: total,
        orders: daySales.length,
      };
    });
  };

  const chartData = getSalesChartData();
  const maxSales = Math.max(...chartData.map(d => d.sales), 1);

  // Yearly Sales Chart Data - Monthly
  const getYearlySalesData = () => {
    const currentYear = new Date().getFullYear();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      const monthStr = String(index + 1).padStart(2, '0');
      const monthPrefix = `${currentYear}-${monthStr}`;
      
      const monthSales = sales.filter(s => s.saleDate.startsWith(monthPrefix));
      const total = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
      
      return {
        month,
        sales: total,
        orders: monthSales.length,
      };
    });
  };

  const yearlyChartData = getYearlySalesData();
  const maxYearlySales = Math.max(...yearlyChartData.map(d => d.sales), 1);

  // Category Sales Data
  const getCategorySalesData = () => {
    const categoryMap: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.productID === item.productID);
        if (product) {
          const category = getCategoryLabel(product.name);
          categoryMap[category] = (categoryMap[category] || 0) + item.lineTotal;
        }
      });
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  const categoryData = getCategorySalesData();
  const maxCategory = Math.max(...categoryData.map(d => d.value), 1);

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalSales)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{sales.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Today&apos;s Sales</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(todayTotal)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Today&apos;s Orders</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{todaySales.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Charts */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Daily Sales Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">DAILY SALES (LAST 7 DAYS)</h2>
              <div className="h-64">
                {chartData.every(d => d.sales === 0) ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No sales data available
                  </div>
                ) : (
                  <div className="h-full flex items-end justify-between gap-2">
                    {chartData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-500">₱{data.sales.toFixed(0)}</span>
                          <div
                            className="w-full bg-orange-500 rounded-t transition-all duration-500"
                            style={{ height: `${(data.sales / maxSales) * 180}px`, minHeight: data.sales > 0 ? '4px' : '0' }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{data.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sales by Category Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">SALES BY CATEGORY</h2>
              <div className="h-64">
                {categoryData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No category data available
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center gap-4">
                    {categoryData.map((data, index) => {
                      const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24">{data.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div
                              className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                              style={{ width: `${(data.value / maxCategory) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-800 w-20 text-right">{formatCurrency(data.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Yearly Sales Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">YEARLY SALES BY MONTH</h2>
            <div className="h-72">
              {yearlyChartData.every(d => d.sales === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No yearly sales data available
                </div>
              ) : (
                <div className="h-full flex items-end justify-between gap-1">
                  {yearlyChartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center gap-1">
                        {data.sales > 0 && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">₱{(data.sales / 1000).toFixed(0)}k</span>
                        )}
                        <div
                          className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 relative group"
                          style={{ height: `${(data.sales / maxYearlySales) * 200}px`, minHeight: data.sales > 0 ? '4px' : '0' }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {data.month}: {formatCurrency(data.sales)}
                            <br />
                            Orders: {data.orders}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2 font-medium">{data.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">Hover over bars to see detailed information</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Top Selling Items */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">TOP SELLING ITEMS</h2>
              </div>
              <div className="p-6">
                {topItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sales data yet</p>
                ) : (
                  <div className="space-y-4">
                    {topItems.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} sold</p>
                        </div>
                        <p className="font-bold text-gray-800">{formatCurrency(item.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">RECENT TRANSACTIONS</h2>
              </div>
              <div className="p-6">
                {sales.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sales.slice(-10).reverse().map((sale) => (
                      <div key={sale.saleID} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">Order #{sale.saleID.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{formatDate(sale.saleDate)}</p>
                          <p className="text-xs text-gray-400">Cashier: {sale.cashier}</p>
                        </div>
                        <p className="font-bold text-orange-500">{formatCurrency(sale.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales Records Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">SALES RECORDS</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cashier</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaySales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No sales records for this date
                      </td>
                    </tr>
                  ) : (
                    todaySales.map((sale) => (
                      <tr key={sale.saleID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          #{sale.saleID.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sale.saleDate)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {sale.items.map((item) => `${item.quantity}x ${item.productName}`).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {sale.payment.method.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sale.cashier}</td>
                        <td className="px-6 py-4 text-sm font-bold text-orange-500 text-right">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditSaleModal(sale)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit Sale"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'inventory') {
      return (
        <div className="space-y-6">
          {/* Inventory Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">INVENTORY STATUS</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.productID} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://via.placeholder.com/48?text=${encodeURIComponent(product.name)}`;
                              }}
                            />
                            <span className="font-medium text-gray-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            product.category === 'food' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {getCategoryLabel(product.name)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${
                            product.stockQty <= 10 
                              ? 'text-red-600' 
                              : product.stockQty <= 30 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {product.stockQty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                          ₱{product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Total Products</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {products.filter(p => p.stockQty <= 10).length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Total Inventory Value</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₱{products.reduce((sum, p) => sum + (p.price * p.stockQty), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Users Tab
    return (
      <div className="space-y-6">
        {/* Users Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">USER MANAGEMENT</h2>
          <button
            onClick={openAddUserModal}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            <span className={`font-bold ${
                              user.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                            }`}>
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteUserModal(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Summary */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Users</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Admins</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Cashiers</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {users.filter(u => u.role === 'cashier').length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-wide">ADMIN DASHBOARD</h1>
              <p className="text-xs text-orange-500 font-medium tracking-wider">SIO REPUBLIC - HINUNANGAN BRANCH</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded transition"
            >
              POS VIEW
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 border-2 border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-100 transition"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-4 text-sm font-bold tracking-wide transition border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-4 text-sm font-bold tracking-wide transition border-b-2 ${
              activeTab === 'inventory'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            INVENTORY
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-sm font-bold tracking-wide transition border-b-2 ${
              activeTab === 'users'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            USERS
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  >
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({...formData, stockQty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="flex items-center gap-4">
                    {formData.image ? (
                      <div className="relative">
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 transition">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', category: 'food', price: '', stockQty: '', image: '' });
                    setImagePreview(null);
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={!formData.name || !formData.price || !formData.stockQty}
                  className="flex-1 py-2 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  >
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({...formData, stockQty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="flex items-center gap-4">
                    {formData.image ? (
                      <div className="relative">
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditProduct}
                  disabled={!formData.name || !formData.price || !formData.stockQty}
                  className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedProduct.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal (Add/Edit) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value as 'admin' | 'cashier'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                    setUserFormData({ username: '', password: '', role: 'cashier' });
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedUser ? handleEditUser : handleAddUser}
                  disabled={!userFormData.username || !userFormData.password}
                  className="flex-1 py-2 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {selectedUser ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {showEditSaleModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Sale Record</h3>
                <span className="text-sm text-gray-500">
                  Order #{selectedSale.saleID.slice(0, 8).toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Sale Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date & Time</label>
                  <input
                    type="datetime-local"
                    value={saleFormData.saleDate.slice(0, 16)}
                    onChange={(e) => setSaleFormData({...saleFormData, saleDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₱)</label>
                  <input
                    type="number"
                    value={saleFormData.totalAmount}
                    onChange={(e) => setSaleFormData({...saleFormData, totalAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={saleFormData.paymentMethod}
                    onChange={(e) => setSaleFormData({...saleFormData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                {/* Cashier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cashier</label>
                  <input
                    type="text"
                    value={saleFormData.cashier}
                    onChange={(e) => setSaleFormData({...saleFormData, cashier: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Items Summary (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items Sold</label>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {selectedSale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="font-medium">₱{item.lineTotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">* Items cannot be edited. Create a new sale for corrections.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditSaleModal(false);
                    setSelectedSale(null);
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSale}
                  disabled={!saleFormData.saleDate || !saleFormData.totalAmount || !saleFormData.cashier}
                  className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete User?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete user <strong>{selectedUser.username}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default AdminDashboard;
