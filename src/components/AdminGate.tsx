import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  X,
  Save,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Mail,
  MapPin,
  Clock,
  Eye,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Globe
} from 'lucide-react';
import { Product, Review } from '../types';
import { CATEGORIES } from '../data';
import { dbUpdateOrderStatus, dbSaveShopConfig } from '../lib/supabase';
// @ts-ignore
import nusrahLogo from '../assets/images/nusrah_logo_luxury_1780810335921.png';

interface AdminGateProps {
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  reviews: Record<string, Review[]>;
  setReviews: React.Dispatch<React.SetStateAction<Record<string, Review[]>>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  shopConfig: any;
  setShopConfig: React.Dispatch<React.SetStateAction<any>>;
  leadership: any;
  setLeadership: React.Dispatch<React.SetStateAction<any>>;
  adminToken: string;
  setAdminToken: (token: string) => void;
  formatPrice: (price: number) => string;
}

export default function AdminGate({
  lang,
  setLang,
  products,
  setProducts,
  reviews,
  setReviews,
  orders,
  setOrders,
  shopConfig,
  setShopConfig,
  adminToken,
  setAdminToken,
  formatPrice,
  leadership,
  setLeadership
}: AdminGateProps) {
  // Authentication local states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Active workspace state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'configs' | 'analytics'>('dashboard');

  // Product manager filter/search states
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('All');

  // Modal active states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<any | null>(null);

  // Add Product Form State
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    bnName: '',
    description: '',
    bnDescription: '',
    price: 0,
    originalPrice: 0,
    images: [''],
    category: 'womens-fashion',
    subCategory: 'শাড়ি',
    stock: 12,
    costPrice: 0,
    isFeatured: false,
    rating: 5,
    reviewCount: 1,
    colors: [
      { name: 'Indigo Blue', class: 'bg-indigo-900', hex: '#312e81' },
      { name: 'Burgundy Red', class: 'bg-red-950', hex: '#450a0a' }
    ],
    sizes: ['M', 'L', 'XL'],
    specifications: ''
  });

  // Edit Product Form State
  const [editProductForm, setEditProductForm] = useState<Partial<Product>>({});

  // Product Deletion State - replacement for window.confirm which is blocked in sandboxed iframes
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);

  // Config Form State (Editable banner slogans and info metrics)
  const [configForm, setConfigForm] = useState({ ...shopConfig });
  const [leadershipForm, setLeadershipForm] = useState({ ...leadership });

  // Dynamically synchronize the forms whenever parent states (loaded asynchronously from Supabase) update
  useEffect(() => {
    setConfigForm({ ...shopConfig });
  }, [shopConfig]);

  useEffect(() => {
    setLeadershipForm({ ...leadership });
  }, [leadership]);

  // Dashboard Metrics Calculation
  const { totalInvestment, totalProfit, inStockCount, outOfStockCount } = useMemo(() => {
    const inv = products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.stock), 0);
    const revenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const profit = revenue - inv;
    const inStock = products.filter(p => p.stock > 0).length;
    const outStock = products.filter(p => p.stock === 0).length;
    return { totalInvestment: inv, totalProfit: profit, inStockCount: inStock, outOfStockCount: outStock };
  }, [products, orders]);

  // Handle standard Authenticated system gate trigger
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setErrorMsg(lang === 'bn' ? 'অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Account temporarily locked. Please try again later.');
      return;
    }

    if (username === 'KaziNusrah' && password === 'Nascox123@1') {
      setErrorMsg('');
      setFailedAttempts(0);
      const token = 'nusrah-token-' + Date.now();
      sessionStorage.setItem('nusrah_admin_token', token);
      setAdminToken(token);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsLocked(true);
        setErrorMsg(lang === 'bn' ? 'অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Account temporarily locked. Please try again later.');
      } else {
        setErrorMsg(lang === 'bn' ? `ভুল অ্যাডমিন ইউজারনেম অথবা সিক্রেট পাসওয়ার্ড! (অবশিষ্ট চেষ্টা: ${5 - newAttempts})` : `Incorrect username or password! (Attempts remaining: ${5 - newAttempts})`);
      }
    }
  };

  // Logout Handler
  const handleSystemLogout = () => {
    sessionStorage.removeItem('nusrah_admin_token');
    setAdminToken('');
    setErrorMsg('');
    setFailedAttempts(0);
    setIsLocked(false);
  };

  // Exit Admin Panel View
  const handleReturnToStorefront = () => {
    window.location.hash = '';
    // Trigger location reload to sync states
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  // Save changes to parameters configuration CMS
  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setShopConfig(configForm);
    setLeadership(leadershipForm);
    
    try {
      await dbSaveShopConfig({ ...configForm, leadership: leadershipForm });
    } catch (err) {
      console.warn('Could not save configuration to Supabase:', err);
    }

    alert(lang === 'bn' ? 'দোকানের বিবরণ ও নেতৃত্ব বিস্তারিত সফলভাবে আপডেট করা হয়েছে!' : 'Store specifications and leadership updated successfully!');
  };

  // Remove/Delete product handler
  const handleDeleteProduct = (productId: string) => {
    setProductIdToDelete(productId);
  };

  const confirmDeleteProduct = () => {
    if (productIdToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productIdToDelete));
      setProductIdToDelete(null);
    }
  };

  // Quick state toggle: Stock toggle
  const toggleStockStatus = (product: Product) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === product.id) {
          const newStock = p.stock > 0 ? 0 : 15;
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  // Add Product Submit
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProductForm.name || !newProductForm.bnName || !newProductForm.price) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে ইংরেজি নাম, বাংলা নাম এবং মূল্য অবশ্যই পূরণ করুন!' : 'Please supply English heading, Bangla heading and Price!');
      return;
    }

    const uniqueId = `NSR-PROD-${Date.now()}`;
    const productToAdd: Product = {
      id: uniqueId,
      name: newProductForm.name,
      bnName: newProductForm.bnName,
      description: newProductForm.description || 'Premium genuine craftsmanship.',
      bnDescription: newProductForm.bnDescription || 'প্রিমিয়াম নুসরাহ ক্লোথিং ফ্যাশন কালেকশন।',
      price: Number(newProductForm.price),
      originalPrice: newProductForm.originalPrice ? Number(newProductForm.originalPrice) : undefined,
      images: newProductForm.images?.filter(img => img.trim() !== '') || ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'],
      category: newProductForm.category as any,
      subCategory: newProductForm.subCategory,
      stock: Number(newProductForm.stock || 0),
      rating: 5.0,
      reviewCount: 0,
      isFeatured: !!newProductForm.isFeatured,
      colors: newProductForm.colors,
      sizes: newProductForm.sizes,
      specifications: newProductForm.specifications,
      tags: []
    };

    setProducts(prev => [productToAdd, ...prev]);
    setIsAddModalOpen(false);
    
    // Reset Form
    setNewProductForm({
      name: '',
      bnName: '',
      description: '',
      bnDescription: '',
      price: 0,
      originalPrice: 0,
      images: [''],
      category: 'womens-fashion',
      subCategory: 'শাড়ি',
      stock: 12,
      isFeatured: false,
      rating: 5,
      reviewCount: 1,
      colors: [
        { name: 'Indigo Blue', class: 'bg-indigo-900', hex: '#312e81' },
        { name: 'Burgundy Red', class: 'bg-red-950', hex: '#450a0a' }
      ],
      sizes: ['M', 'L', 'XL']
    });

    alert(lang === 'bn' ? 'পণ্যটি সফলভাবে যুক্ত করা হয়েছে!' : 'Product uploaded successfully inside database storage!');
  };

  // Open Edit Dialog
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditProductForm({ ...product });
  };

  // Save Edit Product Submit
  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProductForm.name || !editProductForm.bnName || !editProductForm.price) {
      alert('Missing required fields');
      return;
    }

    setProducts(prev =>
      prev.map(p => {
        if (p.id === editingProduct?.id) {
          return {
            ...p,
            ...editProductForm,
            price: Number(editProductForm.price),
            originalPrice: editProductForm.originalPrice ? Number(editProductForm.originalPrice) : undefined,
            stock: Number(editProductForm.stock)
          } as Product;
        }
        return p;
      })
    );

    setEditingProduct(null);
    alert(lang === 'bn' ? 'পণ্যের বিবরণ সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Product changes updated safely!');
  };

  // Change Order Statuses
  const handleUpdateOrderStatus = (orderId: string, itemType: 'status' | 'paymentStatus' | 'shipmentLocation', val: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId === orderId) {
          const updated = { ...o, [itemType]: val };
          
          dbUpdateOrderStatus(orderId, updated.status, updated.paymentStatus).then(success => {
            if (success) {
              console.log('Order status updated in Supabase successfully.');
            }
          }).catch(err => {
            console.warn('Supabase order update status failed:', err);
          });

          return updated;
        }
        return o;
      })
    );
  };

  // Derived dashboard analytics
  const totalStockCount = useMemo(() => products.reduce((sum, p) => sum + p.stock, 0), [products]);
  const lowStockCount = useMemo(() => products.filter(p => p.stock <= 3).length, [products]);
  const totalRevenue = useMemo(() => orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalSalesCount = useMemo(() => orders.filter(o => o.status !== 'Cancelled').length, [orders]);

  // Filtered Products List
  const computedFilteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchQuery =
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.bnName.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(prodSearch.toLowerCase());
      
      const matchCat = prodCategoryFilter === 'All' || p.category === prodCategoryFilter;
      return matchQuery && matchCat;
    });
  }, [products, prodSearch, prodCategoryFilter]);

  // Unpack mapped subcategories for lists
  const availableSubCategories = useMemo(() => {
    const parentCategory = newProductForm.category;
    const catObj = CATEGORIES.find(c => c.slug === parentCategory);
    if (catObj) {
      return catObj.subCategories.map(s => s.bnName);
    }
    return [];
  }, [newProductForm.category]);

  const editAvailableSubCategories = useMemo(() => {
    const parentCategory = editProductForm.category;
    const catObj = CATEGORIES.find(c => c.slug === parentCategory);
    if (catObj) {
      return catObj.subCategories.map(s => s.bnName);
    }
    return [];
  }, [editProductForm.category]);

  // UN-AUTHENTICATED LOGIN GATEWAY
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 relative">
          <button 
            onClick={handleReturnToStorefront}
            className="absolute top-4 right-4 text-stone-400 hover:text-rose-500 cursor-pointer p-1 rounded-full hover:bg-stone-850 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-stone-850 border border-amber-500/30 overflow-hidden flex items-center justify-center shadow-lg">
              <img
                src={nusrahLogo}
                alt="Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-xl font-black uppercase text-stone-100 tracking-wider">
              {lang === 'bn' ? 'নুসরাহ অ্যাপারেলস' : 'Nusrah Apparel'}
            </h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-amber-500">
              {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি গেটওয়ে' : 'Secure Backoffice Gateline'}
            </p>
          </div>

          {!isLocked && (
            /* PHASE 1: Username & Password */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-950/60 border border-red-900 rounded-lg p-3 flex items-start gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block">Admin Name</label>
                <input
                  type="text"
                  required
                  placeholder="KaziNusrah"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-800 text-stone-150 rounded-lg px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-stone-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-450 block">Secret Authorization Key</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-800 text-stone-150 rounded-lg px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-stone-600"
                />
              </div>

              <div className="py-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 active:scale-98 text-stone-950 font-black text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10 transition-all duration-300"
                >
                  <span>Verify Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {isLocked && (
            <div className="bg-red-950/20 border border-red-900 rounded-lg p-6 flex flex-col items-center text-center gap-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm font-bold text-red-300">
                {lang === 'bn' ? 'অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে!' : 'Account temporarily locked!'}
              </p>
              <p className="text-xs text-red-400">
                {lang === 'bn' ? '৫ বারের অধিক ভুল তথ্য ব্যবহারের জন্য সিকিউরিটি লক সক্রিয় হয়েছে।' : 'Security lockout active due to excessive failed login attempts.'}
              </p>
            </div>
          )}

          <div className="border-t border-stone-850 pt-4 flex items-center justify-between text-[10px] text-stone-550 font-bold">
            <button
              onClick={handleReturnToStorefront}
              className="text-stone-450 hover:text-rose-400 transition-colors"
            >
              ← Return to public website
            </button>
            <span>v1.2 Secure Ledger</span>
          </div>

        </div>
      </div>
    );
  }

  // AUTHENTICATED PANEL WORKFLOW
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* 1. TOP HEADER BRAND PANEL */}
      <header className="h-16 bg-stone-900 border-b border-stone-850 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white overflow-hidden border border-stone-800">
            <img
              src={nusrahLogo}
              alt="Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase leading-none">
              {lang === 'bn' ? 'নুসরাহ অ্যাপারেলস' : 'Nusrah Apparel'}
            </h1>
            <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">
              {lang === 'bn' ? 'সিকিউর ম্যানেজমেন্ট ড্যাশবোর্ড' : 'Secure Admin Authority'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="bg-stone-850 border border-stone-800 hover:border-amber-500 text-stone-400 hover:text-amber-500 rounded px-2 py-1 text-[10px] font-black transition-all cursor-pointer"
          >
            {lang === 'bn' ? 'ENGLISH MODE' : 'বাংলা সংস্করণ'}
          </button>
          
          <button
            onClick={handleReturnToStorefront}
            className="hidden sm:flex text-stone-400 hover:text-white items-center gap-1.5 text-xs font-extrabold pr-3 border-r border-stone-800"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'স্টোরে প্রবেশ করুন' : 'View Storefront'}</span>
          </button>

          <button
            onClick={handleSystemLogout}
            className="text-stone-400 hover:text-rose-500 flex items-center gap-1 text-xs font-black"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      {/* ==========================================
          ORDER DETAIL VIEW MODAL (ADMIN)
          ========================================== */}
      {selectedAdminOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-stone-950/80 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-stone-950">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">{lang === 'bn' ? 'অর্ডার বিস্তারিত' : 'Order Specification'}</h3>
                  <p className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest">{selectedAdminOrder.orderId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAdminOrder(null)}
                className="p-2 text-stone-500 hover:text-white bg-stone-850 hover:bg-stone-800 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-850/50 rounded-2xl border border-stone-800">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-none">Current Status</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedAdminOrder.status === 'Delivered' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' :
                      selectedAdminOrder.status === 'Cancelled' ? 'bg-rose-900/30 text-rose-400 border border-rose-500/20' :
                      'bg-amber-900/30 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedAdminOrder.status}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedAdminOrder.paymentStatus === 'Paid' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'
                    }`}>
                      {selectedAdminOrder.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedAdminOrder.orderId, 'status', 'Delivered');
                      handleUpdateOrderStatus(selectedAdminOrder.orderId, 'paymentStatus', 'Paid');
                      setSelectedAdminOrder(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'অ্যাপ্রুভ' : 'Approve'}
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedAdminOrder.orderId, 'status', 'Cancelled');
                      setSelectedAdminOrder(null);
                    }}
                    className="bg-rose-900/40 hover:bg-rose-900 text-rose-400 hover:text-white border border-rose-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'ক্যান্সেল' : 'Cancel'}
                  </button>
                </div>
              </div>

              {/* Customer & Payment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">{lang === 'bn' ? 'কাস্টমার তথ্য' : 'Customer Ledger'}</h4>
                  <div className="bg-stone-950/40 border border-stone-850 p-5 rounded-2xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-stone-900 text-amber-500 rounded-xl border border-stone-800">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase">{selectedAdminOrder.fullName}</p>
                        <p className="text-[10px] font-bold text-stone-500 mt-0.5">{selectedAdminOrder.phone}</p>
                        <p className="text-[10px] font-bold text-stone-500">{selectedAdminOrder.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 pt-4 border-t border-stone-800">
                      <div className="p-2.5 bg-stone-900 text-stone-400 rounded-xl border border-stone-800">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1">{lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Logistics Port'}</p>
                        <p className="text-xs text-stone-300 font-medium leading-relaxed italic">{selectedAdminOrder.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">{lang === 'bn' ? 'পেমেন্ট ট্র্যাকিং' : 'Financial Logs'}</h4>
                  <div className="bg-brand-navy/30 border border-brand-gold/10 p-5 rounded-2xl space-y-4 h-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4.5 h-4.5 text-brand-gold" />
                        <span className="text-[11px] font-black text-white uppercase tracking-wider">{selectedAdminOrder.paymentMethod}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{selectedAdminOrder.paymentStatus}</span>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1">Transaction ID Protocol</p>
                        <p className="text-xs font-mono font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 truncate">{selectedAdminOrder.txId || 'N/A'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.15em]">Total Settlement</p>
                        <p className="text-lg font-black text-white">{formatPrice(selectedAdminOrder.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 pb-4">
                <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">{lang === 'bn' ? 'অর্ডারকৃত প্রোডাক্ট' : 'Inventory Manifest'}</h4>
                <div className="space-y-3">
                  {selectedAdminOrder.items.map((item: any, i: number) => (
                    <div key={i} className="bg-stone-950/40 border border-stone-850 p-3 rounded-2xl flex gap-4 items-center group hover:border-brand-gold/20 transition-all">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-800 bg-stone-900 shrink-0">
                        <img src={item.product?.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate uppercase">{lang === 'bn' ? item.product?.bnName : item.product?.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-stone-500 uppercase">Qty: {item.quantity}</span>
                          <span className="w-1 h-1 bg-stone-700 rounded-full" />
                          <span className="text-[10px] font-bold text-stone-500 uppercase">Size: {item.selectedSize || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-white">{formatPrice(item.product?.price * item.quantity)}</p>
                        <p className="text-[10px] font-bold text-stone-500">@{formatPrice(item.product?.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-stone-950 border-t border-stone-800">
              <button 
                onClick={() => setSelectedAdminOrder(null)}
                className="w-full bg-stone-850 hover:bg-stone-800 text-stone-300 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN LAYOUT COLLABORATOR */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDE BAR NAVIGATION */}
        <nav className="w-full md:w-64 bg-stone-900/40 md:border-r border-stone-850 p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all w-full flex-shrink-0 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview Dashboard'}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all w-full flex-shrink-0 cursor-pointer ${
              activeTab === 'products' ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পণ্য তালিকা (CRUD)' : 'Products Catalog'}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all w-full flex-shrink-0 relative cursor-pointer ${
              activeTab === 'orders' ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অর্ডার প্রসেসিং' : 'Orders Pipeline'}</span>
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="absolute right-3 top-3 bg-rose-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('configs')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all w-full flex-shrink-0 cursor-pointer ${
              activeTab === 'configs' ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ওয়েবসাইট CMS কনফিগ' : 'Site Configuration'}</span>
          </button>
          
          <button
            onClick={handleReturnToStorefront}
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all w-full flex-shrink-0 cursor-pointer text-amber-500 hover:bg-stone-850 hover:text-white"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অর্ডার করতে ক্লিক করুন' : 'Click to Order'}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all w-full flex-shrink-0 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/10' : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'bn' ? 'বিশ্লেষণাত্মক রিপোর্ট' : 'Analytics Reports'}</span>
          </button>
        </nav>

        {/* WORKSPACE AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">

          {/* ==========================================
              TAB 1: ANALYTICS OVERVIEW DASHBOARD
              ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {lang === 'bn' ? 'সিস্টেম সংক্ষিপ্ত বিবরণ' : 'Administrative Overview'}
                  </h2>
                  <p className="text-xs text-stone-400 bg-stone-900 border border-stone-850 px-3 py-1 rounded w-fit mt-1">
                    {lang === 'bn' ? 'তাত্ক্ষণিক পরিসংখ্যান ও বিক্রয় ট্র্যাক করুন' : 'Real-time sales & inventory metrics track records.'}
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-stone-400">
                  📍 Server Address Mode: <span className="text-amber-500 font-extrabold">Active</span>
                </div>
              </div>

              {/* QUICK CONTROL ACTIONS */}
              <div className="bg-stone-900 border border-amber-950/20 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-amber-500 tracking-wider">Quick Actions Portal</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => { setActiveTab('products'); setIsAddModalOpen(true); }}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Upload New Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('configs')}
                    className="bg-stone-800 hover:bg-stone-750 text-stone-250 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all"
                  >
                    Adjust Banners & Contact Slogans
                  </button>
                  <button
                    onClick={handleReturnToStorefront}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all"
                  >
                    Return to Storefront
                  </button>
                </div>
              </div>

              {/* INCOMING PENDING SYSTEM ORDER LOGS */}
              <div className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-stone-850 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-250">Latest Registered Incoming Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-amber-500 hover:underline">
                    View Pipeline →
                  </button>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-950 border-b border-stone-850 text-[10px] font-black uppercase tracking-widest text-stone-450">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Total Value</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.orderId} className="hover:bg-stone-850/50">
                          <td className="p-3 font-mono font-bold text-amber-500">{o.orderId}</td>
                          <td className="p-3 font-semibold text-white">
                            <div>{o.fullName}</div>
                            <span className="text-[10px] text-stone-450">{o.phone}</span>
                          </td>
                          <td className="p-3 text-stone-300">{o.date}</td>
                          <td className="p-3 font-extrabold text-stone-400">{o.paymentMethod}</td>
                          <td className="p-3 text-stone-200 font-mono font-bold">{formatPrice(o.total)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              o.status === 'Completed' || o.status === 'Delivered' ? 'bg-emerald-900/30 text-emerald-400' :
                              o.status === 'Pending' ? 'bg-amber-900/30 text-amber-400' :
                              o.status === 'Cancelled' ? 'bg-red-900/30 text-red-400' : 'bg-stone-800 text-stone-300'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-stone-550">
                            No orders placed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 2: PRODUCTS CRUD SYSTEM
              ========================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {lang === 'bn' ? 'পণ্য সম্ভার CRUD গেট' : 'Inventory Catalog'}
                  </h2>
                  <p className="text-xs text-stone-400">
                    {lang === 'bn' ? 'স্টক, টাইটেল, ইমেজ, ক্যাটাগরি এবং ক্রিয়েট-রিড-আপডেট-ডিলিট অ্যাক্সেস করুন।' : 'Full authority to create, edit, stock toggle, or scrub inventory assets in real-time.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-lg flex items-center justify-center gap-1 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'bn' ? 'নতুন প্রডাক্ট যুক্ত করুন' : 'Create New Product'}</span>
                </button>
              </div>

              {/* SEARCH FILTERS CLUSTER */}
              <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'পণ্যের নাম অথবা আইডি দিয়ে খুঁজুন...' : 'Search inside products database by name or ID...'}
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="bg-stone-850 border border-stone-800 text-stone-150 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder:text-stone-600 transition-all font-sans"
                />
                <select
                  value={prodCategoryFilter}
                  onChange={(e) => setProdCategoryFilter(e.target.value)}
                  className="bg-stone-850 border border-stone-800 text-stone-150 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all font-semibold"
                >
                  <option value="All">{lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                  <option value="womens-fashion">{lang === 'bn' ? 'নারীদের ফ্যাশন' : 'Womens Fashion'}</option>
                  <option value="mens-fashion">{lang === 'bn' ? 'পুরুষদের ফ্যাশন' : 'Mens Fashion'}</option>
                  <option value="cosmetics-beauty">{lang === 'bn' ? 'কসমেটিক্স ও বিউটি' : 'Cosmetics & Beauty'}</option>
                  <option value="electronics-gadgets">{lang === 'bn' ? 'ইলেকট্রনিক্স ও গ্যাজেট' : 'Electronics & Gadgets'}</option>
                </select>
              </div>

              {/* PRODUCTS LIST TABLE */}
              <div className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-950 border-b border-stone-850 text-[10px] font-black uppercase tracking-widest text-stone-450">
                      <tr>
                        <th className="p-3">ID / Image</th>
                        <th className="p-3">Product Name (EN & BN)</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Inventory Stock</th>
                        <th className="p-3">Promo Slider</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850">
                      {computedFilteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-stone-850/40">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[9px] font-bold text-stone-500 block w-14 truncate">{p.id}</span>
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-stone-950 border border-stone-800 flex-shrink-0">
                                <img
                                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">
                            <div className="text-white text-xs">{p.name}</div>
                            <div className="text-amber-500 text-[11px] font-bold mt-0.5">{p.bnName}</div>
                          </td>
                          <td className="p-3">
                            <span className="bg-stone-850 text-stone-300 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                              {p.category}
                            </span>
                            {p.subCategory && (
                              <span className="ml-1.5 bg-rose-950 text-rose-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                {p.subCategory}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-white font-extrabold">{formatPrice(p.price)}</div>
                            {p.originalPrice && (
                              <div className="font-mono text-stone-500 line-through text-[10px] font-bold">{formatPrice(p.originalPrice)}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-xs font-bold leading-none ${p.stock === 0 ? 'text-rose-500' : 'text-stone-200'}`}>
                                {p.stock} pcs
                              </span>
                              <button
                                onClick={() => toggleStockStatus(p)}
                                className={`px-2 py-0.5 rounded text-[9px] font-extrabold cursor-pointer uppercase tracking-wider ${
                                  p.stock > 0 ? 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40' : 'bg-rose-950/40 text-rose-400 hover:bg-rose-950/60'
                                }`}
                              >
                                {p.stock > 0 ? 'Mark Out' : 'Add Stock'}
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              p.isFeatured ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-stone-850 text-stone-500'
                            }`}>
                              {p.isFeatured ? 'Slider Active' : 'Off'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(p)}
                                className="bg-stone-800 hover:bg-stone-750 text-stone-300 p-2 rounded-lg cursor-pointer"
                                title="Edit Product Specs"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="bg-red-950/30 hover:bg-red-950/60 text-red-400 p-2 rounded-lg cursor-pointer"
                                title="Erase Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {computedFilteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-stone-550">
                            {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No products found matching filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: ANALYTICS HUB
              ========================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white">
                {lang === 'bn' ? 'অ্যানালিটিক্স ওভারভিউ' : 'Analytics Hub'}
              </h2>
              
              {/* STAT BENTO CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Total Investment</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-amber-400 font-sans">{formatPrice(totalInvestment)}</p>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Total Profit</p>
                    <p className={`text-xl sm:text-2xl font-extrabold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'} font-sans`}>{formatPrice(totalProfit)}</p>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Total Sales</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">{totalSalesCount}</p>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Total Turnover</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-sans">{formatPrice(totalRevenue)}</p>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">In Stock</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-sky-400">{inStockCount}</p>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Out of Stock</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-rose-500">{outOfStockCount}</p>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Low Stock Warnings</p>
                    <p className={`text-xl sm:text-2xl font-extrabold ${lowStockCount > 0 ? 'text-amber-500 animate-pulse' : 'text-white'}`}>{lowStockCount}</p>
                  </div>
                  <div className="w-9 h-9 bg-stone-850 rounded-lg flex items-center justify-center text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Total Inventory Value</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-sans">{formatPrice(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}</p>
                  </div>
                  <div className="w-9 h-9 bg-stone-850 rounded-lg flex items-center justify-center text-amber-500">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* PRODUCT-WISE TABLE */}
              <div className="bg-stone-900 border border-stone-850 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">{lang === 'bn' ? 'পণ্য ভিত্তিক বিশ্লেষণ' : 'Product-wise Analytics'}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-stone-400 border-b border-stone-800">
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-right">Stock</th>
                        <th className="p-2 text-right">Investment</th>
                        <th className="p-2 text-right">Profit Per Unit</th>
                        <th className="p-2 text-right">Total Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grandTotals = products.reduce((acc, p) => {
                          const inv = (p.costPrice || 0) * p.stock;
                          const profitPerUnit = p.price - (p.costPrice || 0);
                          const totalProfit = profitPerUnit * p.stock;
                          return {
                            stock: acc.stock + (p.stock || 0),
                            investment: acc.investment + inv,
                            profit: acc.profit + totalProfit
                          };
                        }, { stock: 0, investment: 0, profit: 0 });

                        return (
                          <>
                            {products.map(p => {
                              const inv = (p.costPrice || 0) * p.stock;
                              const profitPerUnit = p.price - (p.costPrice || 0);
                              const totalProfit = profitPerUnit * p.stock;
                              return (
                                <tr key={p.id} className="border-b border-stone-850 text-white">
                                  <td className="p-2">{p.name}</td>
                                  <td className="p-2 text-right">{p.stock}</td>
                                  <td className="p-2 text-right">{formatPrice(inv)}</td>
                                  <td className="p-2 text-right">{formatPrice(profitPerUnit)}</td>
                                  <td className="p-2 text-right">{formatPrice(totalProfit)}</td>
                                </tr>
                              );
                            })}
                            <tr className="border-t-2 border-stone-700 bg-stone-800 font-bold text-white">
                              <td className="p-2">Grand Total</td>
                              <td className="p-2 text-right">{grandTotals.stock}</td>
                              <td className="p-2 text-right">{formatPrice(grandTotals.investment)}</td>
                              <td className="p-2 text-right">-</td>
                              <td className="p-2 text-right">{formatPrice(grandTotals.profit)}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>
          )}
          
          {/* ==========================================
              TAB 3: ORDER WORKSPACE
              ========================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {lang === 'bn' ? 'অর্ডার তালিকা ডিসপ্যাচ ও পাইপলাইন' : 'Orders Dispatch Hub'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {lang === 'bn' ? 'গ্রাহকদের ঠিকানা, বিকাশ/নগদ পেমেন্ট ট্রানজেকশন ভেরিফিকেশন এবং শিপিং আপডেট নিশ্চিত করুন।' : 'Confirm addresses, mobile banking receipts, adjust payment states, and update delivery milestones.'}
                </p>
              </div>

              {/* ORDERS DISPLAY CARDS LIST */}
              <div className="space-y-4 text-xs">
                {orders.map(o => (
                  <div key={o.orderId} className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden hover:border-stone-800 transition-all p-5 space-y-4">
                    
                    {/* Header bar card */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-850 pb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-amber-500 font-mono tracking-wider">{o.orderId}</span>
                        <span className="text-[10px] text-stone-500 font-bold">{o.date}</span>
                        <div className="bg-stone-850 px-2 py-0.5 rounded text-stone-300 font-extrabold text-[10px]">
                          {o.paymentMethod}
                        </div>
                        {o.txId && (
                          <div className="text-[10.5px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-950">
                            TxID: {o.txId}
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-xs font-bold text-white bg-stone-950 border border-stone-850 px-3 py-1 rounded">
                        Total Charge: <span className="text-amber-400 font-extrabold font-sans text-sm">{formatPrice(o.total)}</span>
                      </div>
                    </div>

                    {/* Columns info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Customer metrics */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Customer & Location Details</h4>
                        <div className="space-y-1.5 text-stone-200">
                          <p className="font-extrabold text-white text-[12.5px] flex items-center gap-1.5">
                            <span>{o.fullName}</span>
                          </p>
                          <p className="flex items-center gap-1 text-stone-300">
                            <Smartphone className="w-3.5 h-3.5 text-stone-550 flex-shrink-0" />
                            <span className="font-bold">{o.phone}</span>
                          </p>
                          <p className="flex items-start gap-1 text-stone-300">
                            <MapPin className="w-3.5 h-3.5 text-stone-550 flex-shrink-0 mt-0.5" />
                            <span>{o.address}</span>
                          </p>
                          {o.note && (
                            <p className="bg-stone-950 border border-stone-850 text-amber-500 p-2 rounded text-[11px] leading-relaxed italic">
                              Note: "{o.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Purchase Items ({o.items?.length})</h4>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {o.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2.5 items-center bg-stone-950 p-2 rounded border border-stone-850/60 font-sans">
                              <div className="w-8 h-8 rounded bg-stone-900 overflow-hidden flex-shrink-0">
                                <img
                                  src={item.product?.images?.[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11.5px] font-extrabold text-white truncate">{item.product?.bnName || item.product?.name}</div>
                                <div className="text-[10px] text-stone-450 mt-0.5 font-bold flex flex-wrap gap-2">
                                  <span>Qty: {item.quantity}</span>
                                  {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                  {item.selectedColor && (
                                    <span className="flex items-center gap-1">
                                      <span>Color:</span>
                                      <span className="w-2.5 h-2.5 rounded-full border border-stone-800" style={{ backgroundColor: item.selectedColor.hex }} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Controls state updates */}
                      <div className="space-y-3 bg-stone-950/60 p-3.5 rounded-xl border border-stone-850">
                        <h4 className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Logistics Dispatch Controller</h4>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-stone-400 block uppercase">Payment Status</label>
                          <select
                            value={o.paymentStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.orderId, 'paymentStatus', e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 text-stone-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 text-xs font-extrabold"
                          >
                            <option value="Paid">Paid ( settlement verified )</option>
                            <option value="Unpaid">Unpaid ( COD fallback )</option>
                            <option value="Refused">Refused / Charged-back</option>
                          </select>
                        </div>
                        
                        {o.status === 'Shipped' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-stone-400 block uppercase">Shipment Location</label>
                            <input
                              type="text"
                              value={o.shipmentLocation || ''}
                              onChange={(e) => handleUpdateOrderStatus(o.orderId, 'shipmentLocation', e.target.value)}
                              placeholder="e.g., Courier Sorting Hub - Dhaka"
                              className="w-full bg-stone-850 border border-stone-800 text-stone-150 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 text-xs font-bold placeholder:text-stone-700"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-stone-400 block uppercase">Delivery Action</label>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.orderId, 'status', e.target.value)}
                            className={`w-full border text-stone-50 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 text-xs font-black uppercase tracking-wider ${
                              o.status === 'Pending' ? 'bg-amber-950/30 border-amber-900 text-amber-400' :
                              o.status === 'Processing' ? 'bg-sky-950/30 border-sky-900 text-sky-400' :
                              o.status === 'Shipped' ? 'bg-purple-950/30 border-purple-900 text-purple-400' :
                              o.status === 'Delivered' ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' : 'bg-red-950/30 border-red-900 text-red-400'
                            }`}
                          >
                            <option value="Pending">Pending Validation</option>
                            <option value="Processing">Processing Packaging</option>
                            <option value="Shipped">Shipped Dispatching</option>
                            <option value="Delivered">Delivered ( closed )</option>
                            <option value="Cancelled">Cancelled Erased</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-800/80">
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, 'status', 'Processing')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/20"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve Order</span>
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, 'status', 'Cancelled')}
                            className="bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-900/30 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Detailed Order Summary Footer */}
                    <div className="bg-stone-950 p-3 rounded-lg border border-stone-850 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[9px] font-black text-stone-500 uppercase">Payment Channel</p>
                          <p className="text-[11px] font-bold text-white uppercase">{o.paymentMethod}</p>
                        </div>
                        {o.txId && (
                          <div className="border-l border-stone-800 pl-4">
                            <p className="text-[9px] font-black text-stone-500 uppercase">Transaction ID</p>
                            <p className="text-[11px] font-mono font-bold text-brand-gold uppercase tracking-tighter">{o.txId}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {o.status === 'Processing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, 'status', 'Shipped')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded flex items-center gap-1 transition-all"
                          >
                            Dispatch Order
                          </button>
                        )}
                        {o.status === 'Shipped' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.orderId, 'status', 'Delivered')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded flex items-center gap-1 transition-all"
                          >
                            Confirm Delivery
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="bg-stone-900 border border-stone-850 p-10 rounded-xl text-center text-stone-550">
                    {lang === 'bn' ? 'স্টোরে কোনো অর্ডার করা হয়নি।' : 'No customer orders captured inside database registers yet.'}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: CONFIG COPIES AND LOGOS (CMS)
              ========================================== */}
          {activeTab === 'configs' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {lang === 'bn' ? 'ওয়েবসাইট কন্টেন্ট CMS' : 'Core Website Parameters CMS'}
                </h2>
                <p className="text-xs text-stone-400">
                  {lang === 'bn' ? 'অফিসিয়াল ব্র্যান্ড অবস্থান, কন্ট্যাক্ট নাম্বার, কাস্টমার সেভিংস এনাউন্সমেন্ট এবং প্রমোশনাল স্লোগান মডিফাই করুন।' : 'Directly alter sliders metadata, slogans copy, bank gateway numbers, and official footers on the fly.'}
                </p>
              </div>

              <form onSubmit={handleSaveConfigs} className="bg-stone-900 border border-stone-850 rounded-xl p-5 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Official Support Mobile (English display)</label>
                    <input
                      type="text"
                      value={configForm.phoneEn}
                      onChange={(e) => setConfigForm({...configForm, phoneEn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Official Support Mobile (Bangla display)</label>
                    <input
                      type="text"
                      value={configForm.phoneBn}
                      onChange={(e) => setConfigForm({...configForm, phoneBn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Customer Support Email</label>
                    <input
                      type="text"
                      value={configForm.email}
                      onChange={(e) => setConfigForm({...configForm, email: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2 border-t border-stone-800 pt-4 mt-4">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider mb-4">Payment Numbers Management</h3>
                    
                    {/* bKash */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">bKash Account Numbers</label>
                      {configForm.bkashNumbers?.map((num: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={num} onChange={(e) => { const arr = [...configForm.bkashNumbers]; arr[i] = e.target.value; setConfigForm({...configForm, bkashNumbers: arr}); }} className="w-full bg-stone-850 p-2 rounded text-white" />
                          <button type="button" onClick={() => setConfigForm({...configForm, bkashNumbers: configForm.bkashNumbers.filter((_: any, idx: number) => idx !== i)})} className="bg-rose-900 text-rose-200 px-3 py-1 rounded">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setConfigForm({...configForm, bkashNumbers: [...(configForm.bkashNumbers || []), '']})} className="bg-stone-700 text-white px-3 py-1 rounded text-xs">Add bKash Number</button>
                    </div>

                    {/* Nagad */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Nagad Account Numbers</label>
                      {configForm.nagadNumbers?.map((num: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={num} onChange={(e) => { const arr = [...configForm.nagadNumbers]; arr[i] = e.target.value; setConfigForm({...configForm, nagadNumbers: arr}); }} className="w-full bg-stone-850 p-2 rounded text-white" />
                          <button type="button" onClick={() => setConfigForm({...configForm, nagadNumbers: configForm.nagadNumbers.filter((_: any, idx: number) => idx !== i)})} className="bg-rose-900 text-rose-200 px-3 py-1 rounded">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setConfigForm({...configForm, nagadNumbers: [...(configForm.nagadNumbers || []), '']})} className="bg-stone-700 text-white px-3 py-1 rounded text-xs">Add Nagad Number</button>
                    </div>

                    {/* Rocket */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Rocket Account Numbers</label>
                      {configForm.rocketNumbers?.map((num: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={num} onChange={(e) => { const arr = [...configForm.rocketNumbers]; arr[i] = e.target.value; setConfigForm({...configForm, rocketNumbers: arr}); }} className="w-full bg-stone-850 p-2 rounded text-white" />
                          <button type="button" onClick={() => setConfigForm({...configForm, rocketNumbers: configForm.rocketNumbers.filter((_: any, idx: number) => idx !== i)})} className="bg-rose-900 text-rose-200 px-3 py-1 rounded">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setConfigForm({...configForm, rocketNumbers: [...(configForm.rocketNumbers || []), '']})} className="bg-stone-700 text-white px-3 py-1 rounded text-xs">Add Rocket Number</button>
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Top Announcement Slogan Alert (English version)</label>
                    <input
                      type="text"
                      value={configForm.announcementEn}
                      onChange={(e) => setConfigForm({...configForm, announcementEn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Top Announcement Slogan Alert (Bangla version)</label>
                    <input
                      type="text"
                      value={configForm.announcementBn}
                      onChange={(e) => setConfigForm({...configForm, announcementBn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Footer Brand Slogan Text (Bangla display)</label>
                    <textarea
                      rows={2}
                      value={configForm.footerBioBn}
                      onChange={(e) => setConfigForm({...configForm, footerBioBn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-sans"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Footer Brand Slogan Text (English display)</label>
                    <textarea
                      rows={2}
                      value={configForm.footerBioEn}
                      onChange={(e) => setConfigForm({...configForm, footerBioEn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-sans"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Official Cox's Bazar Store Address (Bangla)</label>
                    <textarea
                      rows={2}
                      value={configForm.addressBn}
                      onChange={(e) => setConfigForm({...configForm, addressBn: e.target.value})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-sans"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Facebook Link</label>
                      <input
                        type="text"
                        value={configForm.facebookLink || ''}
                        onChange={(e) => setConfigForm({...configForm, facebookLink: e.target.value})}
                        className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">Instagram Link</label>
                      <input
                        type="text"
                        value={configForm.instagramLink || ''}
                        onChange={(e) => setConfigForm({...configForm, instagramLink: e.target.value})}
                        className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-stone-450 tracking-wider block">YouTube Link</label>
                      <input
                        type="text"
                        value={configForm.youtubeLink || ''}
                        onChange={(e) => setConfigForm({...configForm, youtubeLink: e.target.value})}
                        className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* LEADERSHIP EDITING SECTION (With Picture Option) */}
                  <div className="md:col-span-2 mt-6 pt-6 border-t border-stone-800">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider mb-4">Leadership Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CEO */}
                      <div className="space-y-2 border border-stone-800 p-4 rounded-lg">
                        <h4 className="font-bold text-stone-200">Managing Director (CEO)</h4>
                        <input type="text" placeholder="Name (EN)" value={leadershipForm.ceo.nameEn} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, nameEn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <input type="text" placeholder="Name (BN)" value={leadershipForm.ceo.nameBn} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, nameBn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <input type="text" placeholder="Title (EN)" value={leadershipForm.ceo.titleEn} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, titleEn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <input type="text" placeholder="Title (BN)" value={leadershipForm.ceo.titleBn} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, titleBn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <label className="text-xs text-stone-400">Picture Update Only via URL</label>
                        <input type="text" placeholder="Picture URL (e.g. uploaded file URL)" value={leadershipForm.ceo.pic} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, pic: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <label className="text-xs text-stone-400">Or Upload File:</label>
                        <input type="file" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLeadershipForm(prev => ({...prev, ceo: {...prev.ceo, pic: reader.result as string}}));
                            };
                            reader.readAsDataURL(file);
                          }
                        }} className="w-full bg-stone-850 p-2 rounded text-xs" />
                        <textarea placeholder="Message (EN)" value={leadershipForm.ceo.textEn} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, textEn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded h-20" />
                        <textarea placeholder="Message (BN)" value={leadershipForm.ceo.textBn} onChange={(e) => setLeadershipForm({...leadershipForm, ceo: {...leadershipForm.ceo, textBn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded h-20" />
                      </div>
                      {/* MD */}
                      <div className="space-y-2 border border-stone-800 p-4 rounded-lg">
                        <h4 className="font-bold text-stone-200">Director (Operations & Marketing)</h4>
                        <input type="text" placeholder="Name (EN)" value={leadershipForm.md.nameEn} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, nameEn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <input type="text" placeholder="Name (BN)" value={leadershipForm.md.nameBn} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, nameBn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <input type="text" placeholder="Title (EN)" value={leadershipForm.md.titleEn} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, titleEn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <input type="text" placeholder="Title (BN)" value={leadershipForm.md.titleBn} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, titleBn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <label className="text-xs text-stone-400">Picture Update Only via URL</label>
                        <input type="text" placeholder="Picture URL (e.g. uploaded file URL)" value={leadershipForm.md.pic} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, pic: e.target.value}})} className="w-full bg-stone-850 p-2 rounded" />
                        <label className="text-xs text-stone-400">Or Upload File:</label>
                        <input type="file" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLeadershipForm(prev => ({...prev, md: {...prev.md, pic: reader.result as string}}));
                            };
                            reader.readAsDataURL(file);
                          }
                        }} className="w-full bg-stone-850 p-2 rounded text-xs" />
                        <textarea placeholder="Message (EN)" value={leadershipForm.md.textEn} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, textEn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded h-20" />
                        <textarea placeholder="Message (BN)" value={leadershipForm.md.textBn} onChange={(e) => setLeadershipForm({...leadershipForm, md: {...leadershipForm.md, textBn: e.target.value}})} className="w-full bg-stone-850 p-2 rounded h-20" />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-2 border-t border-stone-850 flex justify-end">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Parameters Configuration</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          SUB-MODAL: NEW PRODUCT LOADER
          ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Upload New Product specifications</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5 focus:outline-none" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Heading (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="Classic Indigo Punjabi v3"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Heading (Bangla)</label>
                  <input
                    type="text"
                    required
                    placeholder="ক্লাসিক ব্লু প্রিমিয়াম পাঞ্জাবি"
                    value={newProductForm.bnName}
                    onChange={(e) => setNewProductForm({...newProductForm, bnName: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-amber-500 font-bold rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Direct Selling Price (BDT value)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="2450"
                    value={newProductForm.price || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, price: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-white font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Cost Price (BDT value)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="1500"
                    value={newProductForm.costPrice || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, costPrice: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-white font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Original Price (optional cut-off tag)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="3400"
                    value={newProductForm.originalPrice || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, originalPrice: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-stone-400 font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Main Category Map</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value as any, subCategory: 'All'})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-bold"
                  >
                    <option value="womens-fashion">Womens Fashion (নারীদের ফ্যাশন)</option>
                    <option value="mens-fashion">Mens Fashion (পুরুষদের ফ্যাশন)</option>
                    <option value="cosmetics-beauty">Cosmetics & Beauty (কসমেটিক্স ও বিউটি)</option>
                    <option value="electronics-gadgets">Electronics & Gadget (ইলেকট্রনিক্স ও গ্যাজেট)</option>
                    <option value="baby-items">Baby collection (শিশুদের পণ্য)</option>
                    <option value="others-items">Others Items (অন্যান্য)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Sub-Category Tag</label>
                  <select
                    value={newProductForm.subCategory}
                    onChange={(e) => setNewProductForm({...newProductForm, subCategory: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-semibold"
                  >
                    <option value="All">All / None</option>
                    {availableSubCategories.map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Allocated Stock Amount</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="12"
                    value={newProductForm.stock || 0}
                    onChange={(e) => setNewProductForm({...newProductForm, stock: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-white font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Sizes (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="M, L, XL"
                    value={newProductForm.sizes?.join(', ') || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, sizes: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Specifications</label>
                  <textarea
                    rows={2}
                    value={newProductForm.specifications || ''}
                    onChange={(e) => setNewProductForm({...newProductForm, specifications: e.target.value})}
                    placeholder="Product specifications..."
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1 flex items-center pt-5 pl-1.5 gap-2">
                  <input
                    type="checkbox"
                    id="isFeaturedAdd"
                    checked={!!newProductForm.isFeatured}
                    onChange={(e) => setNewProductForm({...newProductForm, isFeatured: e.target.checked})}
                    className="w-4 h-4 rounded text-amber-500 bg-stone-850 border-stone-800"
                  />
                  <label htmlFor="isFeaturedAdd" className="text-[10px] font-extrabold uppercase text-stone-300 tracking-wider cursor-pointer">
                    Show in homepage banner slider?
                  </label>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Image Display URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={newProductForm.images?.[0] || ''}
                      onChange={(e) => setNewProductForm({...newProductForm, images: [e.target.value]})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-mono"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewProductForm({...newProductForm, images: [reader.result as string]});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="bg-stone-850 border border-stone-800 text-white rounded-lg p-1 w-24 text-[10px] file:text-[9px] file:bg-stone-700 file:text-white file:border-0 file:rounded file:px-2 file:py-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block font-sans">English Spec Notes</label>
                  <textarea
                    rows={2}
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                    placeholder="Describe design cut, materials quality..."
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block font-sans">Bangla Spec Notes</label>
                  <textarea
                    rows={2}
                    value={newProductForm.bnDescription}
                    onChange={(e) => setNewProductForm({...newProductForm, bnDescription: e.target.value})}
                    placeholder="ডিজাইন ও কাপড়ের সুতা বিবরণ..."
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

              </div>

              <div className="pt-3 border-t border-stone-850 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-transparent hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-300 px-5 py-2.5 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black uppercase px-6 py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Save Product specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          SUB-MODAL: EDIT CATALOG DIALOG
          ========================================== */}
      {editingProduct && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Update Product: {editingProduct.id}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5 focus:outline-none" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editProductForm.name || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Title (Bangla)</label>
                  <input
                    type="text"
                    required
                    value={editProductForm.bnName || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, bnName: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-amber-500 font-bold rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Price (BDT value)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProductForm.price || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, price: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-white font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Original Price cut-off</label>
                  <input
                    type="number"
                    min={0}
                    value={editProductForm.originalPrice || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, originalPrice: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-stone-400 font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Category Layout</label>
                  <select
                    value={editProductForm.category}
                    onChange={(e) => setEditProductForm({...editProductForm, category: e.target.value as any, subCategory: 'All'})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-bold"
                  >
                    <option value="womens-fashion">Womens Fashion</option>
                    <option value="mens-fashion">Mens Fashion</option>
                    <option value="cosmetics-beauty">Cosmetics & Beauty</option>
                    <option value="electronics-gadgets">Electronics & Gadget</option>
                    <option value="baby-items">Baby collection</option>
                    <option value="others-items">Others Items</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Sub-Category Tag</label>
                  <select
                    value={editProductForm.subCategory}
                    onChange={(e) => setEditProductForm({...editProductForm, subCategory: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-semibold"
                  >
                    <option value="All">All / None</option>
                    {editAvailableSubCategories.map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Stock Level</label>
                  <input
                    type="number"
                    min={0}
                    value={editProductForm.stock ?? 0}
                    onChange={(e) => setEditProductForm({...editProductForm, stock: Number(e.target.value)})}
                    className="w-full bg-stone-850 border border-stone-800 text-white font-mono rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1 flex items-center pt-5 pl-1.5 gap-2">
                  <input
                    type="checkbox"
                    id="isFeaturedEdit"
                    checked={!!editProductForm.isFeatured}
                    onChange={(e) => setEditProductForm({...editProductForm, isFeatured: e.target.checked})}
                    className="w-4 h-4 rounded text-amber-500 bg-stone-850 border-stone-800"
                  />
                  <label htmlFor="isFeaturedEdit" className="text-[10px] font-extrabold uppercase text-stone-300 tracking-wider cursor-pointer">
                    Show in homepage banner slider?
                  </label>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Cover Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editProductForm.images?.[0] || ''}
                      onChange={(e) => setEditProductForm({...editProductForm, images: [e.target.value]})}
                      className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2 font-mono"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditProductForm({...editProductForm, images: [reader.result as string]});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="bg-stone-850 border border-stone-800 text-white rounded-lg p-1 w-24 text-[10px] file:text-[9px] file:bg-stone-700 file:text-white file:border-0 file:rounded file:px-2 file:py-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">English Spec Description</label>
                  <textarea
                    rows={2}
                    value={editProductForm.description || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-black uppercase text-stone-450 tracking-wider block">Bangla Spec Description</label>
                  <textarea
                    rows={2}
                    value={editProductForm.bnDescription || ''}
                    onChange={(e) => setEditProductForm({...editProductForm, bnDescription: e.target.value})}
                    className="w-full bg-stone-850 border border-stone-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

              </div>

              <div className="pt-3 border-t border-stone-850 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-transparent hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-300 px-5 py-2.5 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black uppercase px-6 py-2.5 rounded-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETION MODAL */}
      {productIdToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl transition-all scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-950/40 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-950">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight uppercase mb-2">
                {lang === 'bn' ? 'পণ্য মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Product Erasure'}
              </h3>
              <p className="text-stone-400 text-xs font-bold leading-relaxed mb-6 uppercase tracking-wider">
                {lang === 'bn' 
                  ? 'আপনি কি নিশ্চিত যে আপনি এই পণ্যটি সম্পূর্ণ মুছে ফেলতে চান? এই অ্যাকশনটি পূর্বাবস্থায় ফেরানো যাবে না।' 
                  : 'Are you sure you want to permanently delete this product? This action cannot be undone.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setProductIdToDelete(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-transparent hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-300 font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-600/20"
                >
                  {lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
