/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Star,
  X,
  Plus,
  Minus,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  MapPin,
  Send,
  CheckCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Clock,
  FileText,
  LayoutGrid,
  Settings,
  Key,
  LogOut,
  Camera,
  Edit,
  ClipboardList,
  MapPinned,
  UserCircle,
  Package,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  ArrowRight,
  Info,
  Building,
  Mail,
  Smartphone,
  Tag,
  Filter,
  Sparkles,
  ShoppingBag,
  ListFilter,
  Layers,
  Quote,
  PenTool,
  Database,
  Eye,
  Camera as CameraIcon,
  UserPlus,
  ArrowLeft,
  LogIn,
  Shield,
  Lock
} from 'lucide-react';
import { Product, CartItem, Review } from './types';
import { CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS, CategoryData } from './data';
// @ts-ignore
import nusrahLogo from './assets/images/nusrah_logo_luxury_1780810335921.png';
import AdminGate from './components/AdminGate';
import { 
  dbGetOrders, 
  dbInsertOrder, 
  dbUpdateOrderStatus, 
  dbSignUp, 
  dbLogin, 
  dbUpdateProfile, 
  dbGetShopConfig, 
  dbSaveShopConfig,
  supabase
} from './lib/supabase';


export default function App() {
  // ==========================================
  // Core Bilingual & Multi-Currency State
  // ==========================================
  const [lang, setLang] = useState<'bn' | 'en'>('bn'); // Default to Bangla for high local affinity
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');

  // Core Data States
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('nusrah_products_v2');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('nusrah_products_v2', JSON.stringify(products));
  }, [products]);

  const [reviews, setReviews] = useState<Record<string, Review[]>>(() => {
    const local = localStorage.getItem('nusrah_reviews_v2');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return INITIAL_REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem('nusrah_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); // Matches category slugs
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All'); // Matches subCategory Bangla name
  const [sortBy, setSortBy] = useState<string>('Recommended');
  const [maxPrice, setMaxPrice] = useState<number>(15000); // 15000 BDT
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Layout & Navigation Controls
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'orders' | 'addresses' | 'settings' | 'wishlist' | 'register'>('overview');
  const [dashSignupForm, setDashSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [dashSignupLoading, setDashSignupLoading] = useState(false);
  const [isProcurementLogsOpen, setIsProcurementLogsOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'logs' | 'users' | 'inventory'>('logs');

  // User Mock State - Starts as null (logged out) by default
  const [currentUser, setCurrentUser] = useState<{ 
    name: string; 
    email: string; 
    phone?: string; 
    profilePic?: string;
    dob?: string;
    gender?: string;
    joinedDate?: string;
    role?: 'student' | 'admin';
  } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [rememberMe, setRememberMe] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [signupRole, setSignupRole] = useState<'student' | 'admin'>('student');
  const [adminCode, setAdminCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // Supabase Backend Sync on Mount
  useEffect(() => {
    async function syncSupabaseOnMount() {
      try {
        // 1. Check active user session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const userEmail = session.user.email || '';
          // Try to fetch profile table metadata
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setCurrentUser({
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone || '',
              profilePic: profileData.profile_pic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
              dob: profileData.dob || '',
              gender: profileData.gender || '',
              joinedDate: profileData.joined_date || "June 2026",
              role: (profileData as any).role || session.user.user_metadata?.role || 'student'
            });
          } else {
            setCurrentUser({
              name: session.user.user_metadata?.name || userEmail.split('@')[0],
              email: userEmail,
              phone: session.user.user_metadata?.phone || '',
              joinedDate: "June 2026",
              profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
              role: session.user.user_metadata?.role || 'student'
            });
          }
        }

        // 2. Load latest database orders
        const dbOrders = await dbGetOrders();
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders);
        }

        // 3. Sync CRM Shop Configuration
        const dbConfig = await dbGetShopConfig();
        if (dbConfig) {
          setShopConfig(prev => ({ ...prev, ...dbConfig }));
        }
      } catch (err) {
        console.error('Error during initial Supabase synchronization sync:', err);
      }
    }
    syncSupabaseOnMount();
  }, []);

  // Profile Customization Form State
  const [profileEditForm, setProfileEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    profilePic: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileEditForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        dob: currentUser.dob || '',
        gender: currentUser.gender || '',
        profilePic: currentUser.profilePic || ''
      });
    }
  }, [currentUser]);

  const handleSaveProfileChanges = async () => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...profileEditForm
    };
    setCurrentUser(updated);

    try {
      const success = await dbUpdateProfile(currentUser.email, profileEditForm);
      if (success) {
        alert(lang === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে সুপাবেস (Supabase) ক্লাউড ডেটাবেসে সংরক্ষণ করা হয়েছে!' : 'Profile successfully saved to Supabase cloud!');
      } else {
        alert(lang === 'bn' ? 'প্রোফাইল লোকালি কাস্টমাইজ করা হয়েছে! সুপাবেস ক্লাউডে সিনক্রোনাইজ করতে অনুগ্রহ করে নতুন মেম্বার হিসেবে রেজিস্ট্রেশন করুন বা আপনার কাস্টমার অ্যাকাউন্টে লগইন করুন।' : 'Profile updated locally! Please register a new member profile or log in to sync directly with Supabase Cloud.');
      }
    } catch (e) {
      console.warn('Supabase profile sync fallback:', e);
      alert(lang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!');
    }
  };

  // Checkout Flow State
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'shipping' | 'payment' | 'receipt'>('none');
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    deliveryAddress: '',
    note: ''
  });
  const [sameAsHome, setSameAsHome] = useState(true);

  const [paymentForm, setPaymentForm] = useState({
    method: 'bkash', // 'bkash', 'nagad', 'rocket', 'cod', 'bank'
    mobileNumber: '০১৭৫১২৩৪৫৬৭',
    transactionId: '',
    cardName: 'NUSRAT JAHAN',
    cardNumber: '৪৪২৪ ১১২৩ ৪৫৫৬ ৭৮৯০',
    cardExpiry: '১২/২৯',
    cardCvv: '৯৯৯',
    selectedBank: 'Dutch-Bangla Bank (DBBL)' // 'DBBL', 'City', 'BRAC', 'EBL', 'MTB'
  });

  // Payment Copy & Wallet Number Auto-population Helpers
  const [copiedNotification, setCopiedNotification] = useState('');
  const [targetPaymentNumber, setTargetPaymentNumber] = useState('01851-282847');

  useEffect(() => {
    if (currentUser) {
      setShippingForm(prev => ({
        ...prev,
        fullName: currentUser.name,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  const handleCopyPaymentNumber = (num: string) => {
    const rawNumber = num.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(rawNumber);
    setCopiedNotification(num);
    setTargetPaymentNumber(num);
    setPaymentForm(prev => ({
      ...prev,
      mobileNumber: rawNumber
    }));

    // Direct Redirection Logic for Mobile Wallet Apps
    // Attempting to trigger app intent or dialer for a "direct" experience
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);

    if (isMobile) {
      if (paymentForm.method === 'bkash') {
        // Many Bangladeshi merchants use specific USSD or app shortcuts
        // Attempting to open the dialer with USSD or just the number
        window.location.href = `tel:*247#`; 
      } else if (paymentForm.method === 'nagad') {
        window.location.href = `tel:*167#`;
      } else if (paymentForm.method === 'rocket') {
        window.location.href = `tel:*322#`;
      }
    }
    
    setTimeout(() => {
      setCopiedNotification('');
    }, 2500);
  };

  const [activeReceipt, setActiveReceipt] = useState<{
    orderId: string;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
    date: string;
    paymentMethod: string;
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    deliveryAddress?: string;
    note?: string;
  } | null>(null);

  // Detail Modal Controls
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailSize, setDetailSize] = useState('');
  const [detailColor, setDetailColor] = useState<{ name: string; hex: string; class: string } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // New Review Form
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState('');

  // Newsletter Promo State
  const [promoEmail, setPromoEmail] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success'>('idle');

  // ==========================================
  // Interactive Leadership State (Editable in-app)
  // ==========================================
  const [leadership, setLeadership] = useState({
    ceo: {
      nameEn: 'Asma Ul Hosna',
      nameBn: 'আসমা উল হোসনা',
      titleEn: 'Managing Director',
      titleBn: 'ব্যবস্থাপনা পরিচালক',
      pic: 'https://ais-dev-txqe2vtaoppfzdzlywhcie-642796950155.asia-southeast1.run.app/asma_ul_hosna.png',
      textEn: "Providing the world-class, comfortable & trendy apparel experience is the core goal of Nusrah Apparel. Integrity, pristine finishing, and the love of our respected customers are our guiding paths. Customer trust is our main driving force.",
      textBn: "ভোক্তাদের জন্য বিশ্বমানের আরামদায়ক ও ট্রেন্ডি পোশাকের অভিজ্ঞতা নিশ্চিত করাই নুসরাহ অ্যাপারেল-এর মূল লক্ষ্য। সততা, নিখুত ফিনিশিং এবং সম্মানিত গ্রাহকদের ভালোবাসাকে পাথেয় করেই আমরা এগিয়ে চলছি। গ্রাহকের আস্থাই আমাদের প্রধান চালিকাশক্তি।"
    },
    md: {
      nameEn: 'Kazi Riazul Hasan',
      nameBn: 'কাজী রিয়াজুল হাসান',
      titleEn: 'Director (Operations & Marketing)',
      titleBn: 'পরিচালক (অপারেশন্স ও মার্কেটিং)',
      pic: 'https://ais-dev-txqe2vtaoppfzdzlywhcie-642796950155.asia-southeast1.run.app/kazi_riazul_hasan.png',
      textEn: "From ensuring impeccable finishing of our fabrics to delivering trendy & world-class apparel to our customers' doorsteps—at Nusrah Apparel, we are committed to maintaining excellence at every step. Together with honesty, quality, and the love of our respected customers, we aim to create new fashion experiences.",
      textBn: "কাপড়ের নিখুঁত ফিনিশিং নিশ্চিত করা থেকে শুরু করে ট্রেন্ডি ও বিশ্বমানের পোশাক গ্রাহকদের দোরগোড়ায় পৌঁছে দেওয়া—নুসরাহ অ্যাপারেল-এর প্রতিটি ধাপেই আমরা শ্রেষ্ঠত্ব বজায় রাখতে দায়বদ্ধ। সততা, গুণগত মান এবং সম্মানিত গ্রাহকদের ভালোবাসাকে সঙ্গী করেই আমরা ফ্যাশন দুনিয়ায় নতুন অভিজ্ঞতা তৈরি করতে চাই।"
    }
  });

  const [isEditingLeadership, setIsEditingLeadership] = useState(false);
  const [editLeaderForm, setEditLeaderForm] = useState({ ...leadership });

  const handleUpdateLeaderField = (role: 'ceo' | 'md', field: string, value: string) => {
    setEditLeaderForm(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };

  const handleSaveLeadership = () => {
    setLeadership({ ...editLeaderForm });
    setIsEditingLeadership(false);
  };

  // ==========================================
  // Dynamic Shop Configuration & CRM Database
  // ==========================================
  const [shopConfig, setShopConfig] = useState(() => {
    const local = localStorage.getItem('nusrah_shop_config_v1');
    const defaultConfig = {
      phoneEn: '+8801879-888883',
      phoneBn: '+৮৮০ ১৮৭৯-৮৮৮৮৮৩',
      email: 'info.nusrah.apparle@gmail.com',
      bkashNumbers: ['01851-282847', '01865-275327'],
      nagadNumbers: ['01851-282847'],
      rocketNumbers: ['01857-275327'],
      addressEn: "Nusrah Apparel, Islami Bank Bhaban, New Market, Morichya Bazar, Ukhiya, Cox's Bazar - 4700.",
      addressBn: "নুসরাহ অ্যাপারেলস, ইসলামী ব্যাংক ভবন, নিউ মার্কেট, মরিচ্যা বাজার, উখিয়া, কক্সবাজার-৪৭০০।",
      footerBioEn: "Pioneering custom authentic designs across premium apparel, traditional wear, skin-safe cosmetics & top essential modern electronics gadgets.",
      footerBioBn: "আপনার অনলাইন কেনাকাটাকে আরও সহজ ও শতভাগ ঝামেলামুক্ত করতে আমরা নিয়ে এসেছি আধুনিকতম ক্যাটাগরি ফিল্টার এবং ১০০% প্রিমিয়াম কালেকশন। নুসরাহ অ্যাপারেলস-এ আপনার পছন্দের পণ্যটি খুঁজে নিন এক ক্লিকেই!",
      announcementEn: "⚡ ORDER INSTANTLY WITH 100% SECURE DELIVERY SERVICE. ENJOY FREE DEALS FOR ORDER VALUED OVER ৳5000!",
      announcementBn: "⚡ ১০০% নিরাপদ ডেলিভারি সেবায় দ্রুত অর্ডার করুন। ৫০০০ টাকার কেনাকাটায় ফ্রি হোম ডেলিভারি!",
      facebookLink: "https://www.facebook.com/nusrahapparel",
      youtubeLink: "https://www.youtube.com/@nusrahapparel",
      instagramLink: "https://www.instagram.com/nusrahapparel",
    };
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.email === 'nusrah.apparel@gmail.com' || parsed.email === 'info.nusrah-apparel@gmail.com' || !parsed.email) {
          parsed.email = 'info.nusrah.apparle@gmail.com';
        }
        return { ...defaultConfig, ...parsed };
      } catch (e) {}
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('nusrah_shop_config_v1', JSON.stringify(shopConfig));
  }, [shopConfig]);

  const [orders, setOrders] = useState<any[]>(() => {
    const local = localStorage.getItem('nusrah_orders_v1');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [
      {
        orderId: 'NA-202601',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 2,
            selectedSize: 'M',
            selectedColor: INITIAL_PRODUCTS[0].colors?.[0] || { name: 'Indigo Blue', class: 'bg-indigo-900', hex: '#312e81' }
          }
        ],
        subtotal: INITIAL_PRODUCTS[0].price * 2,
        shipping: 120,
        total: INITIAL_PRODUCTS[0].price * 2 + 120,
        date: 'June 05, 2026',
        paymentMethod: 'bKash',
        fullName: 'Tahsin Kabir',
        phone: '01712-345678',
        address: 'House 4, Road 2, Block B, Mirpur 12, Dhaka',
        deliveryAddress: 'House 4, Road 2, Block B, Mirpur 12, Dhaka',
        note: 'Please deliver fast.',
        status: 'Pending',
        paymentStatus: 'Paid',
        txId: 'BKX93K8S20'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nusrah_orders_v1', JSON.stringify(orders));
  }, [orders]);

  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/nusrah-system-gate' || window.location.hash === '#nusrah-system-gate';
  });

  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('nusrah_admin_token') || '';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(window.location.pathname === '/nusrah-system-gate' || window.location.hash === '#nusrah-system-gate');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleSetSubCategoryClean = (categorySlug: string, subCategoryName: string) => {
    setSelectedCategory(categorySlug);
    setSelectedSubCategory(subCategoryName);
    setTimeout(() => {
      document.getElementById('store-gallery')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ==========================================
  // Bilingual Copy Dictionary
  // ==========================================
  const t = {
    all: lang === 'bn' ? 'সব উন্মুক্ত' : 'All Products',
    allCat: lang === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories',
    allSubCat: lang === 'bn' ? 'সব সাব-ক্যাটাগরি' : 'All Sub-categories',
    searchPlaceholder: lang === 'bn' ? 'পণ্য, ফ্যাশন বা গ্যাজেট খুঁজুন...' : 'Search clothing, cosmetics or gadgets...',
    cart: lang === 'bn' ? 'অর্ডার তালিকা' : 'Shopping Cart',
    wishlist: lang === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist',
    wallet: lang === 'bn' ? 'আমার প্রোফাইল' : 'My Account',
    myOrders: lang === 'bn' ? 'আমার অর্ডার' : 'My Orders',
    procurement: lang === 'bn' ? 'প্রোকিউরমেন্ট লগস' : 'Procurement Logs',
    trackOrder: lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Orders',
    signIn: lang === 'bn' ? 'লগইন' : 'Sign In',
    signOut: lang === 'bn' ? 'লগ-আউট' : 'Sign Out',
    promoBanner: lang === 'bn' ? shopConfig.announcementBn : shopConfig.announcementEn,
    support: lang === 'bn' ? 'সাহায্য' : 'Help',
    partner: lang === 'bn' ? 'নুসরাহ অ্যাপারেল' : 'Nusrah Apparel',
    featuredTitle: lang === 'bn' ? 'গ্রাহক নির্দেশিকা: ক্যাটাগরি ও সাব-ক্যাটাগরি সমূহ' : 'Customer Directory: Categories & Sub-categories',
    featuredSub: lang === 'bn' ? 'সহজে ও নিরাপদে কেনাকাটা নিশ্চিত করতে ক্যাটাগরি অনুযায়ী খুঁজুন:' : 'Browse by categories to avoid confusion and buy securely:',
    inStock: lang === 'bn' ? 'স্টকে আছে এমন পণ্য' : 'In-Stock Only',
    maxPrice: lang === 'bn' ? 'সর্বোচ্চ মূল্য:' : 'Max Price:',
    sortBy: lang === 'bn' ? 'সাজানোর মাধ্যম:' : 'Sort By:',
    featuredModel: lang === 'bn' ? 'ফিচার্ড পণ্য' : 'Featured Model',
    priceLowHigh: lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High',
    priceHighLow: lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low',
    topReviewed: lang === 'bn' ? 'সেরা রেটিং প্রাপ্ত' : 'Top Reviewed',
    productsCount: lang === 'bn' ? 'টি পণ্য পাওয়া গেছে' : 'products found',
    clearFilters: lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Clear and Reset Filters',
    onlyLeft: lang === 'bn' ? 'মাত্র ১টি স্টক বাকি!' : 'Only a few items left in stock!',
    soldOut: lang === 'bn' ? 'স্টক শেষ' : 'Sold Out',
    addToCart: lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart',
    added: lang === 'bn' ? 'যোগ করা হয়েছে' : 'Added to Cart',
    viewDetails: lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details',
    freeShippingAlert: lang === 'bn' ? 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন।' : 'Congratulations! You unlocked free shipping.',
    freeShippingProg: lang === 'bn' ? 'ফ্রি ডেলিভারি পেতে আরও পণ্য যোগ করুন' : 'Add more to achieve free shipping',
    subtotal: lang === 'bn' ? 'উপ-মোট' : 'Subtotal',
    shipping: lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge',
    total: lang === 'bn' ? 'মোট মূল্য' : 'Total Amount',
    checkout: lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Proceed to Checkout',
    emptyCart: lang === 'bn' ? 'আপনার কার্টটি একদম খালি!' : 'Your Shopping Cart is empty!',
    reviews: lang === 'bn' ? 'গ্রাহক মতামত' : 'Customer Reviews',
    writeReview: lang === 'bn' ? 'আপনার মূল্যবান রিভিউ দিন' : 'Leave Your Feedback',
    submitReview: lang === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review',
    commentLabel: lang === 'bn' ? 'মতামত লিখুন...' : 'Write your review...',
    authorLabel: lang === 'bn' ? 'আপনার নাম' : 'Your Name',
    sizeLabel: lang === 'bn' ? 'সাইজ বা পরিমাপ:' : 'Preferred Size:',
    colorLabel: lang === 'bn' ? 'রঙ নির্বাচন:' : 'Color Option:',
    qtyLabel: lang === 'bn' ? 'পরিমাণ:' : 'Quantity:',
    relatedProducts: lang === 'bn' ? 'এই ক্যাটাগরির অন্যান্য পণ্য' : 'More From This Category',
    contactUs: lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us',
    newsText: lang === 'bn' ? 'নতুন ডিসকাউন্ট ও কালেকশন আপডেট পেতে সাবস্ক্রাইব করুন' : 'Subscribe to receive dynamic stock alerts & private sales updates.',
    subscribe: lang === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe',
    subSuccess: lang === 'bn' ? 'ধন্যবাদ! আপনার ইমেইলটি আমাদের প্রমোশন তালিকায় যুক্ত হয়েছে।' : 'Thank you! You have subscribed successfully.'
  };

  // Category-specific dynamic theme colors matching the Orange, White, Red, Blue pallet
  const getCategoryThemeColor = (slug: string) => {
    switch (slug) {
      case 'mens-fashion':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'womens-fashion':
        return 'bg-brand-navy hover:bg-brand-navy/90';
      case 'cosmetics-beauty':
        return 'bg-amber-500 hover:bg-amber-600'; // Flame Orange
      case 'electronics-gadgets':
        return 'bg-indigo-600 hover:bg-indigo-700'; // Modern Indigo-Blue
      default:
        return 'bg-amber-500 hover:bg-amber-600'; 
    }
  };

  // Price conversion helper
  const formatPrice = (priceInBDT: number) => {
    if (currency === 'USD') {
      return `$${(priceInBDT / 110).toFixed(2)}`;
    }
    return `৳${priceInBDT.toLocaleString('bn-BD')}`;
  };

  // Convert BDT limit dynamically
  const maxPriceLimit = currency === 'USD' ? 140 : 15000;

  // Sync max price unit on currency switch
  useEffect(() => {
    setMaxPrice(currency === 'USD' ? 140 : 15000);
  }, [currency]);

  // Handle Carousel Rotation
  const heroSlides = useMemo(() => {
    return products.filter(p => p.isFeatured);
  }, [products]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  // ==========================================
  // Filter & Search Logic
  // ==========================================
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Main category slug matching
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        
        // Sub-category matching
        const matchesSubCategory = selectedSubCategory === 'All' || product.subCategory === selectedSubCategory;

        // Price restriction
        const currentPrice = currency === 'USD' ? (product.price / 110) : product.price;
        const matchesPrice = currentPrice <= maxPrice;

        // In stock
        const matchesInStock = !onlyInStock || product.stock > 0;

        // Custom search terms matching (Support both languages)
        const nameText = (product.name + ' ' + (product.bnName || '')).toLowerCase();
        const descText = (product.description + ' ' + (product.bnDescription || '')).toLowerCase();
        const tagText = product.tags.join(' ').toLowerCase();
        const catText = product.category.toLowerCase();
        const subCatText = (product.subCategory || '').toLowerCase();
        const searchVal = searchQuery.toLowerCase();

        const matchesSearch = searchQuery === '' ||
          nameText.includes(searchVal) ||
          descText.includes(searchVal) ||
          tagText.includes(searchVal) ||
          catText.includes(searchVal) ||
          subCatText.includes(searchVal);

        return matchesCategory && matchesSubCategory && matchesPrice && matchesInStock && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'PriceLowToHigh') return a.price - b.price;
        if (sortBy === 'PriceHighToLow') return b.price - a.price;
        if (sortBy === 'HighestRated') return b.rating - a.rating;
        // Default Recommendation logic
        const scoreA = (a.isFeatured ? 3 : 0) + (a.isNew ? 2 : 0) + (a.isTrending ? 1 : 0);
        const scoreB = (b.isFeatured ? 3 : 0) + (b.isNew ? 2 : 0) + (b.isTrending ? 1 : 0);
        return scoreB - scoreA;
      });
  }, [products, selectedCategory, selectedSubCategory, maxPrice, onlyInStock, searchQuery, sortBy, currency]);

  // Active subcategories based on chosen category slug
  const activeSubcategoryList = useMemo(() => {
    if (selectedCategory === 'All') {
      // Flatten all subcategories
      return CATEGORIES.flatMap(cat => cat.subCategories);
    }
    const cat = CATEGORIES.find(c => c.slug === selectedCategory);
    return cat ? cat.subCategories : [];
  }, [selectedCategory]);

  // ==========================================
  // Event Handlers
  // ==========================================
  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailQuantity(1);
    setDetailSize(product.sizes ? product.sizes[0] : '');
    setDetailColor(product.colors ? product.colors[0] : null);
    setActiveImageIndex(0);
    setNewReviewAuthor(currentUser?.name || '');
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewSubmitMessage('');
  };

  const handleAddToCart = (product: Product, qty = 1, size?: string, color?: any) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const idx = prev.findIndex(item =>
        item.product.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor?.name === color?.name
      );

      if (idx !== -1) {
        const next = [...prev];
        next[idx].quantity = Math.min(next[idx].quantity + qty, product.stock);
        return next;
      } else {
        return [...prev, { product, quantity: qty, selectedSize: size, selectedColor: color }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (index: number, change: number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + change;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = Math.min(newQty, next[index].product.stock);
      }
      return next;
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Cart Calculations
  const subtotalSum = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Free shipping threshold: ৳১৫,০০০ BDT or $১৫০ USD
  const freeShippingThreshold = currency === 'USD' ? 150 : 15000;
  const currentSubtotal = currency === 'USD' ? (subtotalSum / 110) : subtotalSum;
  const progressPercent = Math.min((currentSubtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - currentSubtotal, 0);

  const deliveryCharge = currentSubtotal >= freeShippingThreshold || currentSubtotal === 0 ? 0 : (currency === 'USD' ? 10 : 120);
  const finalTotalAmount = currentSubtotal + deliveryCharge;

  // Dynamic review submission
  const handleAddReviewSubmit = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!newReviewComment.trim() || !newReviewAuthor.trim()) {
      setReviewSubmitMessage(lang === 'bn' ? 'অনুগ্রহ করে মতামত এবং আপনার নাম উভয় ক্ষেত্র পূরণ করুন।' : 'Please fill out all fields.');
      return;
    }

    const newRevObj: Review = {
      id: `rev-${Date.now()}`,
      userName: newReviewAuthor,
      rating: newReviewRating,
      comment: newReviewComment,
      date: lang === 'bn' ? 'আজ' : 'Today',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
    };

    setReviews(prev => {
      const productReviews = prev[productId] || [];
      const updated = [newRevObj, ...productReviews];

      const avg = parseFloat((updated.reduce((sum, r) => sum + r.rating, 0) / updated.length).toFixed(1));

      // Propagate rating
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === productId ? { ...p, rating: avg, reviewCount: updated.length } : p)
      );

      return { ...prev, [productId]: updated };
    });

    setNewReviewComment('');
    setReviewSubmitMessage(lang === 'bn' ? 'রিভিউটি সফলভাবে যুক্ত হয়েছে!' : 'Your review has been dynamically added!');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      if (loginRole === 'admin' && adminCode !== 'Nascox123@1') {
        alert(lang === 'bn' ? 'ভুল অ্যাডমিন সিকিউরিটি কোড! সঠিক কোড ছাড়া অ্যাডমিন হিসেবে ট্রাই করা সম্ভব নয়।' : 'Incorrect Admin Security Code! Access is restricted without the verified system token.');
        return;
      }

      try {
        const user = await dbLogin(loginEmail, loginPassword);
        if (user) {
          // Strictly protect the admin gate from students
          if (loginRole === 'admin' && user.role !== 'admin') {
            await supabase.auth.signOut();
            alert(lang === 'bn' ? 'অ্যাক্সেস প্রত্যাখ্যান: এই অ্যাকাউন্টটি একজন সাধারণ স্টুডেন্টের (Student)। রোল-ভিত্তিক পারমিশনের সুরক্ষার কারণে কোনো সাধারণ স্টুডেন্ট সঠিক কোড জানলেও অ্যাডমিন ড্যাশবোর্ডে লগইন করতে পারবে না!' : 'Access Denied: This account has a Student role. Due to role-based access security, students cannot log in to the Admin Dashboard even if they know the admin verification code!');
            return;
          }

          setCurrentUser(user);
          setIsLoginModalOpen(false);
          setIsWalletOpen(true);
          setLoginEmail('');
          setLoginPassword('');
          setAdminCode('');
          return;
        }
      } catch (err: any) {
        console.warn('Supabase login error, falling back to mock authentication:', err.message);
        alert(lang === 'bn' ? `লগইন ত্রুটি: ${err.message || 'Error'}` : `Login Error: ${err.message || 'Error'}`);
      }

      // Mock logic fallback
      if (loginRole === 'admin' && adminCode !== 'Nascox123@1') {
        alert(lang === 'bn' ? 'ভুল অ্যাডমিন সিকিউরিটি কোড!' : 'Incorrect Admin Security Code!');
        return;
      }

      const mockRole = loginRole;
      setCurrentUser({ 
        name: loginEmail.split('@')[0], 
        email: loginEmail,
        phone: logoutPhone || '01XXXX-XXXXX',
        joinedDate: "June 2026",
        profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        role: mockRole
      });
      setIsLoginModalOpen(false);
      setIsWalletOpen(true);
      setLoginEmail('');
      setLoginPassword('');
      setAdminCode('');
    }
  };

  const logoutPhone = ""; // Placeholder for phone field in login if needed

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      alert(lang === 'bn' ? 'পাসওয়ার্ড মিলছে না!' : 'Passwords do not match!');
      return;
    }

    if (signupRole === 'admin' && adminCode !== 'Nascox123@1') {
      alert(lang === 'bn' ? 'অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে! সঠিক অ্যাডমিন সিকিউরিটি কোড ছাড়া অ্যাডমিন রোল নিয়ে রেজিস্ট্রেশন করা সম্ভব নয়।' : 'Access Denied: Registration as Admin requires the correct Admin authorization code.');
      return;
    }
    
    try {
      const user = await dbSignUp(signupForm.email, signupForm.password, signupForm.name, signupForm.phone, signupRole);
      if (user) {
        setCurrentUser(user);
        setIsLoginModalOpen(false);
        setIsWalletOpen(true);
        setSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setAdminCode('');
        return;
      }
    } catch (err: any) {
      console.warn('Supabase signup error, falling back to mock registration:', err.message);
      alert(lang === 'bn' ? `রেজিস্ট্রেশন ত্রুটি: ${err.message || 'Error'}` : `Registration Error: ${err.message || 'Error'}`);
    }
    
    // Simulate signup
    setCurrentUser({
      name: signupForm.name,
      email: signupForm.email,
      phone: signupForm.phone,
      joinedDate: new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' }),
      profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      role: signupRole
    });
    
    setIsLoginModalOpen(false);
    setIsWalletOpen(true);
    setSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setAdminCode('');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    setCurrentUser(null);
    setIsLoginModalOpen(false);
  };

  const handleDashSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dashSignupForm.password !== dashSignupForm.confirmPassword) {
      alert(lang === 'bn' ? 'পাসওয়ার্ড মিলছে না!' : 'Passwords do not match!');
      return;
    }
    
    setDashSignupLoading(true);
    try {
      const user = await dbSignUp(dashSignupForm.email, dashSignupForm.password, dashSignupForm.name, dashSignupForm.phone, 'student');
      if (user) {
        setCurrentUser(user);
        alert(lang === 'bn' ? 'নতুন কাস্টমার অ্যাকাউন্ট সফলভাবে রেজিস্টার ও সুইচ করা হয়েছে!' : 'New Customer account successfully registered & logged in!');
        setDashSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setActiveProfileTab('overview');
        return;
      }
    } catch (err: any) {
      console.warn('Dashboard signup error, falling back to mock registration:', err.message);
      alert(lang === 'bn' ? `রেজিস্ট্রেশন ত্রুটি: ${err.message || 'Error'}` : `Registration Error: ${err.message || 'Error'}`);
    }

    // Simulate signup fallback
    const mockUser = {
      name: dashSignupForm.name,
      email: dashSignupForm.email,
      phone: dashSignupForm.phone,
      joinedDate: new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' }),
      profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      role: 'student' as const
    };
    setCurrentUser(mockUser);
    alert(lang === 'bn' ? 'নতুন কাস্টমার অ্যাকাউন্ট সফলভাবে রেজিস্টার ও সুইচ করা হয়েছে!' : 'New Customer account successfully registered & logged in!');
    setDashSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setActiveProfileTab('overview');
    setDashSignupLoading(false);
  };

  // Simulated Checkout Submission
  const handlePaymentConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate Unique Order Serial: NA-YYYYNN (e.g. NA-202601)
    const currentYear = new Date().getFullYear();
    const prefix = `NA-${currentYear}`;
    
    // Find highest sequence for current year
    const yearOrders = orders.filter(o => o.orderId.startsWith(prefix));
    let nextNum = 1;
    
    if (yearOrders.length > 0) {
      const sequences = yearOrders.map(o => {
        const parts = o.orderId.split(prefix);
        const seq = parseInt(parts[1], 10);
        return isNaN(seq) ? 0 : seq;
      });
      nextNum = Math.max(...sequences) + 1;
    }
    
    const orderNum = `${prefix}${nextNum.toString().padStart(2, '0')}`;

    // Stock deduction
    setProducts(prev => {
      return prev.map(p => {
        const item = cart.find(c => c.product.id === p.id);
        if (item) {
          return { ...p, stock: Math.max(p.stock - item.quantity, 0) };
        }
        return p;
      });
    });

    // Mandatory field validation
    if (!shippingForm.fullName.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম প্রদান করুন।' : 'Please provide your full name.');
      return;
    }
    if (!shippingForm.phone.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে আপনার মোবাইল নম্বর প্রদান করুন।' : 'Please provide your mobile number.');
      return;
    }
    if (!shippingForm.address.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে আপনার ঠিকানা প্রদান করুন।' : 'Please provide your complete shipping address.');
      return;
    }

    if (paymentForm.method !== 'cod' && (paymentForm.method === 'bkash' || paymentForm.method === 'nagad' || paymentForm.method === 'rocket')) {
      if (!paymentForm.transactionId.trim()) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি প্রদান করুন।' : 'Please provide the Transaction ID for verification.');
        return;
      }
    }

    const orderRecord = {
      orderId: orderNum,
      items: [...cart],
      subtotal: subtotalSum,
      shipping: deliveryCharge === 0 ? 0 : 120,
      total: subtotalSum + (deliveryCharge === 0 ? 0 : 120),
      currencyAtOrder: currency,
      date: new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      paymentMethod: paymentForm.method,
      fullName: shippingForm.fullName,
      phone: shippingForm.phone,
      email: shippingForm.email || (currentUser ? currentUser.email : ''),
      address: shippingForm.address,
      deliveryAddress: shippingForm.deliveryAddress,
      note: shippingForm.note,
      status: 'Pending',
      paymentStatus: paymentForm.method === 'cod' ? 'Unpaid' : 'Paid',
      txId: paymentForm.method === 'cod' ? '' : paymentForm.transactionId || 'PAID_PROTOCOL'
    };

    setOrders(prev => [orderRecord, ...prev]);

    setActiveReceipt(orderRecord);

    setCart([]);
    setCheckoutStep('receipt');

    // Background push to Supabase with seamless failover
    dbInsertOrder(orderRecord).then(success => {
      if (success) {
        console.log('Order synced to Supabase successfully.');
      } else {
        console.warn('Supabase DB unreachable, saved to storage container successfully.');
      }
    }).catch(e => {
      console.warn('Supabase database sync exception:', e);
    });
  };

  const handleJoinPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoEmail.trim()) {
      setPromoStatus('success');
      setTimeout(() => setPromoStatus('idle'), 5000);
      setPromoEmail('');
    }
  };

  const handleSetCategoryClean = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubCategory('All'); // Reset subcategory when main category shifts to prevent dead filters
  };

  if (isAdminView) {
    return (
      <AdminGate
        lang={lang}
        setLang={setLang}
        products={products}
        setProducts={setProducts}
        reviews={reviews}
        setReviews={setReviews}
        orders={orders}
        setOrders={setOrders}
        shopConfig={shopConfig}
        setShopConfig={setShopConfig}
        leadership={leadership}
        setLeadership={setLeadership}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        formatPrice={formatPrice}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* 1. ANNOUNCEMENT HEADER */}
      <header id="announcement-banner" className="h-10 bg-slate-905 text-white flex items-center justify-between px-4 sm:px-8 text-[11px] sm:text-xs font-semibold border-b border-slate-850 z-40 bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="bg-brand-gold text-white font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse">
            {lang === 'bn' ? 'বিশেষ অফার' : 'Exclusive'}
          </span>
          <span className="truncate">{t.promoBanner}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {/* Support */}
          <span className="hidden md:inline text-stone-300">
            {t.support}: <a href={`mailto:${shopConfig.email}`} className="hover:text-amber-400 font-bold ml-1 transition-all">{shopConfig.email}</a>
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>

          {/* Explicit Customer Portal Access */}
          <button
            onClick={() => {
              if (currentUser) {
                setActiveProfileTab('overview');
                setIsWalletOpen(true);
              } else {
                setAuthMode('login');
                setIsLoginModalOpen(true);
              }
            }}
            className="text-amber-400 hover:text-amber-300 font-extrabold transition-all text-[11px] uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0 bg-transparent border-0"
          >
            <UserCircle className="w-3.5 h-3.5" />
            <span>
              {currentUser 
                ? (lang === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account') 
                : (lang === 'bn' ? 'কাস্টমার লগইন' : 'Customer Login')
              }
            </span>
          </button>
          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Dynamic Switchers */}
          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="bg-slate-800 border border-slate-755 hover:border-slate-600 rounded px-2.5 py-0.5 text-[10px] font-bold text-amber-400 cursor-pointer shadow-xs transition-all"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            {/* Currency Switch */}
            <button
              onClick={() => setCurrency(currency === 'BDT' ? 'USD' : 'BDT')}
              className="bg-slate-800 border border-slate-755 hover:border-slate-600 rounded px-2 py-0.5 text-[10px] font-bold text-emerald-400 cursor-pointer shadow-xs transition-all"
            >
              {currency === 'BDT' ? 'USD ($)' : 'BDT (৳)'}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN RETREAT HEADER */}
      <nav id="retail-navbar" className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-200 h-16 flex items-center px-4 sm:px-8 gap-4 sm:gap-8 shadow-xs z-30 transition-all">
        {/* Brand Logo Identity */}
        <div
          id="retail-logo"
          onClick={() => { handleSetCategoryClean('All'); setSearchQuery(''); }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 bg-white border border-stone-200 rounded-full overflow-hidden flex items-center justify-center shadow-xs transform transition-all group-hover:scale-105 duration-300">
            <img
              src={nusrahLogo}
              alt="Nusrah Apparel Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-tight text-stone-900 group-hover:text-brand-gold transition-colors uppercase leading-none">
              NUSRAH APPAREL
            </span>
            <span className="text-[10px] font-extrabold text-stone-500 tracking-widest uppercase mt-0.5">
              {lang === 'bn' ? 'নুসরাহ অ্যাপারেল' : 'Nusrah Apparel Boutique'}
            </span>
          </div>
        </div>

        {/* Categories Instant Pills links for desktops */}
        <div id="desktop-mega-nav" className="hidden lg:flex items-center gap-5 pl-4 border-l border-stone-200 text-xs font-extrabold uppercase tracking-widest text-slate-500">
          
          {/* ALL CATEGORIES */}
          <button
            onClick={() => handleSetCategoryClean('All')}
            className={`hover:text-brand-gold transition-colors py-1 cursor-pointer border-b-2 text-[11px] tracking-wider ${
              selectedCategory === 'All' ? 'text-brand-navy border-brand-navy font-extrabold' : 'border-transparent'
            }`}
          >
            {t.allCat}
          </button>

          {/* 1. MEN'S COLLECTION */}
          <div className="relative group py-2">
            <button
              onClick={() => handleSetCategoryClean('mens-fashion')}
              className={`hover:text-brand-gold transition-colors py-1 cursor-pointer border-b-2 text-[11px] tracking-wider flex items-center gap-1 ${
                selectedCategory === 'mens-fashion' ? 'text-brand-navy border-brand-navy font-extrabold' : 'border-transparent'
              }`}
            >
              <span>{lang === 'bn' ? "মেনস কালেকশন" : "MEN's COLLECTION"}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-brand-navy transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Dropdown Box */}
            <div className="absolute top-full left-0 mt-0.5 bg-white border border-stone-200 rounded-xl shadow-xl py-2.5 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-3 pb-2 mb-1.5 border-b border-stone-100">
                <span className="text-[10px] text-stone-400 font-black block tracking-wider uppercase">
                  {lang === 'bn' ? 'পুরুষদের সমগ্র কালেকশন' : "Combined Men's Wear"}
                </span>
                <button
                  onClick={() => handleSetCategoryClean('mens-fashion')}
                  className="text-[11px] text-brand-gold hover:underline mt-0.5 font-bold cursor-pointer inline-block"
                >
                  {lang === 'bn' ? 'সব প্রোডাক্ট একসাথে দেখুন ➔' : 'View Combined Main Page ➔'}
                </button>
              </div>
              <ul className="space-y-0.5 px-1.5">
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('mens-fashion', 'টি-শার্ট')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>T-Shirts (টি-শার্ট)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('mens-fashion', 'শার্ট')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Shirts (শার্ট)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('mens-fashion', 'প্যান্ট')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Pants (প্যান্ট)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('mens-fashion', 'পাঞ্জাবি')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Panjabi (পাঞ্জাবি)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('mens-fashion', 'অন্তর্বাস')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Innerwear & Undergarments (আন্ডারগার্মেন্টস)</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. WOMEN'S COLLECTION */}
          <div className="relative group py-2">
            <button
              onClick={() => handleSetCategoryClean('womens-fashion')}
              className={`hover:text-brand-gold transition-colors py-1 cursor-pointer border-b-2 text-[11px] tracking-wider flex items-center gap-1 ${
                selectedCategory === 'womens-fashion' ? 'text-brand-navy border-brand-navy font-extrabold' : 'border-transparent'
              }`}
            >
              <span>{lang === 'bn' ? "ওমেনস কালেকশন" : "WOMEN'S COLLECTION"}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-brand-navy transition-transform group-hover:rotate-180" />
            </button>
            
            {/* Dropdown Box */}
            <div className="absolute top-full left-0 mt-0.5 bg-white border border-stone-200 rounded-xl shadow-xl py-2.5 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-3 pb-2 mb-1.5 border-b border-stone-100">
                <span className="text-[10px] text-stone-400 font-black block tracking-wider uppercase">
                  {lang === 'bn' ? 'নারীদের সমগ্র কালেকশন' : "Combined Women's Wear"}
                </span>
                <button
                  onClick={() => handleSetCategoryClean('womens-fashion')}
                  className="text-[11px] text-brand-gold hover:underline mt-0.5 font-bold cursor-pointer inline-block"
                >
                  {lang === 'bn' ? 'সব প্রোডাক্ট একসাথে দেখুন ➔' : 'View Combined Main Page ➔'}
                </button>
              </div>
              <ul className="space-y-0.5 px-1.5">
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('womens-fashion', 'শাড়ি')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Saree (শাড়ি)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('womens-fashion', 'থ্রি-পিস')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Three-Piece (থ্রি-পিস)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('womens-fashion', 'কুর্তি')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Kurti & Tops (কুর্তি)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('womens-fashion', 'লেডিস প্যান্ট')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Ladies Pants (লেডিস প্যান্ট)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetSubCategoryClean('womens-fashion', 'অন্তর্বাস')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-brand-gold/10 hover:text-brand-navy transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Lingerie & Innerwear (লিঞ্জারি/প্যান্টি/অন্তর্বাস)</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. COSMETICS & BEAUTY */}
          <button
            onClick={() => handleSetCategoryClean('cosmetics-beauty')}
            className={`hover:text-amber-500 transition-colors py-1 cursor-pointer border-b-2 text-[11px] tracking-wider ${
              selectedCategory === 'cosmetics-beauty' ? 'text-amber-500 border-amber-500 font-extrabold' : 'border-transparent'
            }`}
          >
            {lang === 'bn' ? "কসমেটিক্স ও বিউটি" : "COSMETICS & BEAUTY"}
          </button>

          {/* 4. ELECTRONICS & GADGETS */}
          <button
            onClick={() => handleSetCategoryClean('electronics-gadgets')}
            className={`hover:text-indigo-600 transition-colors py-1 cursor-pointer border-b-2 text-[11px] tracking-wider ${
              selectedCategory === 'electronics-gadgets' ? 'text-indigo-600 border-indigo-600 font-extrabold' : 'border-transparent'
            }`}
          >
            {lang === 'bn' ? "ইলেকট্রনিক্স ও গ্যাজেট" : "ELECTRONICS & GADGETS"}
          </button>

        </div>

        {/* Central Live Search */}
        <div className="flex-1 max-w-xs sm:max-w-md ml-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchActive(true);
              }}
              onFocus={() => setIsSearchActive(true)}
              className="w-full bg-stone-100 placeholder-stone-400 text-stone-800 rounded-full py-2 pl-4 pr-10 text-xs sm:text-sm font-semibold border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-450 pointer-events-none">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-400" />
            </div>
          </div>
          {isSearchActive && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="bg-stone-50 p-2 text-[10px] font-black uppercase text-stone-400 border-b border-stone-100 flex justify-between items-center">
                <span>{lang === 'bn' ? `ম্যাচিং প্রোডাক্ট (${filteredProducts.length}টি)` : `Matching Items (${filteredProducts.length})`}</span>
                <button onClick={() => setIsSearchActive(false)} className="hover:text-brand-gold cursor-pointer">
                  [ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'} ]
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.slice(0, 5).map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        handleOpenDetails(prod);
                        setIsSearchActive(false);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-stone-50 cursor-pointer border-b border-stone-100 last:border-0 transition-colors"
                    >
                      <img src={prod.images[0]} alt={prod.name} className="w-9 h-9 object-cover rounded bg-stone-150" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-stone-900 truncate">{lang === 'bn' ? prod.bnName : prod.name}</h4>
                        <p className="text-[10px] text-brand-gold font-extrabold">{formatPrice(prod.price)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-stone-450 font-medium">
                    {lang === 'bn' ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No matching items.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Control, wishlist & cart dynamic icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Wishlisted products counter */}
          <button
            onClick={() => {
              if (wishlist.length > 0) {
                const target = products.find(p => wishlist.includes(p.id));
                if (target) {
                  setSearchQuery(lang === 'bn' ? (target.bnName || '').slice(0, 4) : target.name.slice(0, 5));
                }
              }
            }}
            className="p-1.5 text-stone-600 hover:text-brand-gold transition-all relative cursor-pointer"
            title={t.wishlist}
          >
            <Heart className={`w-5 h-5 sm:w-5.7 sm:h-5.7 ${wishlist.length > 0 ? 'fill-brand-gold text-brand-gold animate-pulse' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-brand-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Profile Icon Control */}
          <button
            onClick={() => {
              if (currentUser) {
                setActiveProfileTab('overview');
                setIsWalletOpen(true);
              } else {
                setAuthMode('login');
                setIsLoginModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 p-1 bg-white hover:bg-stone-50 rounded-full transition-all cursor-pointer shadow-sm border border-stone-200 group px-2"
            title={currentUser ? t.wallet : t.signIn}
          >
            {currentUser ? (
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center overflow-hidden shrink-0">
                {currentUser.profilePic ? (
                  <img src={currentUser.profilePic} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-brand-navy text-[10px] uppercase">{currentUser.name[0]}</span>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 group-hover:text-brand-navy transition-colors shrink-0">
                <UserCircle className="w-6 h-6" />
              </div>
            )}
            {currentUser ? (
               <span className="hidden sm:inline text-[10px] font-black uppercase tracking-tighter text-stone-500 group-hover:text-brand-navy transition-colors px-1">
                 {currentUser.name.split(' ')[0]}
               </span>
            ) : (
               <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider text-stone-500 group-hover:text-brand-navy transition-colors px-1">
                 {lang === 'bn' ? 'লগইন' : 'Log In'}
               </span>
            )}
          </button>

          {/* ADMIN ONLY: Procurement Logs Access */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setIsProcurementLogsOpen(true)}
              className="flex items-center gap-1.5 p-2 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-brand-navy rounded-full transition-all cursor-pointer border border-stone-200 group"
              title={t.procurement}
            >
              <Database className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden lg:inline text-[10px] font-black uppercase tracking-tighter text-stone-400 group-hover:text-brand-navy transition-colors">Admin Control</span>
            </button>
          )}

          {/* Cart Icon Drawer button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-stone-100 hover:bg-stone-250 text-stone-850 hover:text-brand-gold rounded-full transition-all cursor-pointer shadow-xs"
            aria-label={t.cart}
          >
            <ShoppingCart className="w-4 h-4 sm:w-4.8 sm:h-4.8 text-stone-800" />
            {cartCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-navy text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border border-white animate-bounce-short">
                {cartCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 bg-stone-400 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            )}
          </button>
        </div>
      </nav>
      {/* 3. HOME HERO INTUITION SLIDERS */}
      <section id="banner-carousel" className="bg-stone-900 overflow-hidden relative min-h-[380px] flex items-center text-white border-b border-stone-850">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center p-5 sm:p-8 md:p-10 gap-6 lg:gap-10 relative">
          
          {/* Active Featured Slide Details (LHS - 7 Columns on Desktop) */}
          <div className="lg:col-span-7 space-y-4 md:space-y-5 flex flex-col justify-center">
            {heroSlides.map((slide, index) => {
              if (index !== activeHeroIndex) return null;
              return (
                <div key={slide.id} className="space-y-4 animate-fade-in">
                  <span className="bg-brand-gold/20 text-brand-gold border border-brand-gold/35 font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full w-fit inline-block">
                    {lang === 'bn' ? 'সকাল এর জন্য সেরা অফার' : '🔥 EXCLUSIVE PREMIUM HIT'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    {lang === 'bn' ? slide.bnName : slide.name}
                  </h1>
                  <p className="text-stone-300 text-xs sm:text-sm line-clamp-3 leading-relaxed max-w-xl">
                    {lang === 'bn' ? slide.bnDescription : slide.description}
                  </p>
                  
                  {/* Rating Stars and stock badge */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-brand-gold">
                      <span className="text-sm">★</span>
                      <span className="font-extrabold">{slide.rating}</span>
                      <span className="text-stone-450 font-bold">({slide.reviewCount || 12} {lang === 'bn' ? 'টি রিভিউ' : 'reviews'})</span>
                    </div>
                    <span className="text-stone-700">|</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-950 px-2 py-0.5 rounded text-[10px] font-mono">
                      {lang === 'bn' ? 'স্টক এভেলেবল' : 'In Stock Only'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center pt-2">
                    <button
                      onClick={() => handleOpenDetails(slide)}
                      className="bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold px-6 py-3 text-xs uppercase tracking-widest rounded-lg cursor-pointer transform hover:scale-103 transition-all duration-300 shadow-xl shadow-brand-navy/30 border border-brand-gold/30"
                    >
                      {lang === 'bn' ? 'অর্ডার করতে ক্লিক করুন' : 'Order Now'} — {formatPrice(slide.price)}
                    </button>
                    <button
                      onClick={() => handleAddToCart(slide, 1, slide.sizes?.[0], slide.colors?.[0])}
                      className="bg-stone-850 hover:bg-stone-800 border border-stone-800 text-stone-250 font-bold px-5 py-3 text-xs uppercase rounded-lg cursor-pointer transition-all"
                    >
                      {t.addToCart}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Indicator Bullets inside the container */}
            <div className="flex items-center gap-2 pt-1">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveHeroIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeHeroIndex === index ? 'w-8 bg-brand-gold' : 'w-2 bg-stone-700'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column (RHS - 5 Columns on Desktop) - The Premium Live Auto-Scrolling Showcase */}
          <div className="lg:col-span-5 h-[280px] sm:h-[320px] md:h-[350px] lg:h-[400px] relative rounded-2xl overflow-hidden bg-stone-950 border border-stone-850/80 p-4 flex flex-col justify-between shadow-2xl">
            {/* Header / Title line of the scrolling container */}
            <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-2 z-10 bg-gradient-to-b from-stone-900 to-transparent">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-ping flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-brand-gold/80">
                  {lang === 'bn' ? 'লাইভ শোকেস: আমাদের সেরা পণ্যসমূহ' : 'Live Showcase: Major Products'}
                </span>
              </div>
              <span className="text-[9px] font-black tracking-widest text-[#10b981] uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/30">
                {lang === 'bn' ? 'অটো স্ক্রোল' : 'Auto'}
              </span>
            </div>

            {/* Infinite vertical marquee area */}
            <div className="flex-1 relative overflow-hidden w-full h-full pr-1">
              <div className="absolute inset-x-0 scrolling-products-track space-y-3 pt-1">
                {/* Double the products list so that the loop is perfectly infinite and smooth */}
                {[...products, ...products].map((prod, idx) => (
                  <div
                    key={`${prod.id}-${idx}`}
                    onClick={() => handleOpenDetails(prod)}
                    className="flex gap-3 bg-stone-900/80 hover:bg-stone-850 hover:border-amber-500/50 border border-stone-850/70 p-2.5 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] items-center"
                  >
                    {/* Thumbnail representation */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 flex-shrink-0 relative">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {prod.originalPrice && (
                        <span className="absolute top-0.5 left-0.5 bg-rose-600 text-white text-[7.5px] font-black px-1 rounded-xs leading-none py-0.5">
                          -{Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase text-amber-500 tracking-wider leading-none">
                        {lang === 'bn' ? 'প্রিমিয়াম ক্যাটাগরি' : 'Premium Select'}
                      </p>
                      <h4 className="font-extrabold text-[12px] sm:text-[13px] text-stone-100 mt-1 leading-snug truncate">
                        {lang === 'bn' ? prod.bnName : prod.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5 leading-none">
                        {lang === 'bn' ? prod.bnDescription : prod.description}
                      </p>
                    </div>

                    {/* Pricing Display */}
                    <div className="text-right flex-shrink-0 pl-1">
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-[#10b981] block">{formatPrice(prod.price)}</span>
                      {prod.originalPrice && (
                        <span className="font-mono text-[9.5px] text-stone-500 line-through font-extrabold block leading-none">
                          {formatPrice(prod.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Premium faded gradient overlay to make things look very polished and cohesive */}
              <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-stone-900 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-stone-900 to-transparent pointer-events-none" />
            </div>

            {/* Hint tag */}
            <div className="border-t border-stone-850 pt-2.5 mt-2 flex items-center justify-between text-[9px] text-stone-450 font-bold">
              <span>{lang === 'bn' ? '★ যেকোনো পণ্যে ক্লিক করে অর্ডার করতে পারেন' : '★ Click any item to explore & order'}</span>
              <span className="text-amber-500 flex items-center gap-1">
                <span>{lang === 'bn' ? 'মাউস রাখলে থামবে' : 'Hover to Pause'}</span>
                <span className="inline-block animate-bounce-short">↓</span>
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* 4. VALUE TRUST KEYWORDS */}
      <section id="trustable-traits" className="bg-white border-b border-stone-200 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-stone-800 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-navy">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[12px] sm:text-xs">
                {lang === 'bn' ? 'ফাস্ট ডোরস্টেপ ডেলিভারি' : 'Fast Dhaka & BD Delivery'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                {lang === 'bn' ? '১৫ হাজার টাকার কেনাকাটায় ফ্রি' : 'Free delivery at ৳15,000+'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-navy">
              <RotateCcw className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[12px] sm:text-xs">
                {lang === 'bn' ? '৭ দিনে সহজ রিটার্ন সুবিধা' : 'Easy 7-day Exchange'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                {lang === 'bn' ? 'কোনো লুকানো ঝামেলা ছাড়াই' : 'Hassle-free exchange guarantee'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-navy">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[12px] sm:text-xs">
                {lang === 'bn' ? 'শতভাগ অরিজিনাল পণ্য' : '100% Guaranteed Products'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                {lang === 'bn' ? 'সরাসরি আমদানিকৃত কালেকশন' : 'Direct from official makers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-navy">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[12px] sm:text-xs">
                {lang === 'bn' ? '২৪/৭ ডেডিকেটেড কাস্টমার কেয়ার' : 'Support Team Active'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-stone-500 font-semibold font-mono">
                {lang === 'bn' ? '+৮৮০ ১৮৭৯-৮৮৮৮৮৩' : '+8801879-888883'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE DIRECTORY & SUB-SET FINDER BOARD */}
      {/* "গ্রাহক যেন ওয়েবসাইটে এসে গুলিয়ে না ফেলেন, সেজন্য ক্যাটাগরিগুলো খুব সুন্দর করে সাজাতে হবে" */}
      <section id="category-directory" className="py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="border-b border-stone-200 pb-5 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-6 bg-brand-navy rounded"></span>
              <span className="text-brand-navy font-extrabold text-xs uppercase tracking-wider block">
                {lang === 'bn' ? 'অভিজাত শপিং গাইড' : 'FINE RETAIL HUB'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
              {t.featuredTitle}
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              {t.featuredSub}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-end">
            <span className="text-xs font-bold text-stone-500 uppercase mr-1">
              {lang === 'bn' ? 'ক্যাটাগরি ভিউ:' : 'Current View:'}
            </span>
            <div className="bg-stone-200 p-0.5 rounded-lg flex gap-1 text-[11px] font-extrabold text-stone-600 shadow-inner">
              <button
                onClick={() => handleSetCategoryClean('All')}
                className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedCategory === 'All' ? 'bg-orange-500 text-stone-950 shadow-md font-black' : 'hover:text-stone-900 bg-white/50'
                }`}
              >
                {lang === 'bn' ? 'সব উন্মুক্ত' : 'View All Products'}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Main Categories beautifully represented with icons, cover images and sub-category listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map(cat => {
            const isCatActive = selectedCategory === cat.slug;
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 flex flex-col shadow-xs ${
                  isCatActive 
                    ? 'border-brand-gold ring-2 ring-brand-gold/10 shadow-lg scale-[1.02]' 
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {/* Visual Banner */}
                <div className="h-28 relative overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                    isCatActive ? 'from-brand-navy/90 to-stone-900/30' : 'from-stone-950/70 to-stone-905/20'
                  }`}></div>
                  
                  {/* Category Title Inside */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-extrabold text-xs uppercase tracking-widest text-brand-gold/80">
                      {cat.name}
                    </h3>
                    <h4 className="font-black text-sm sm:text-base tracking-tight truncate">
                      {cat.bnName}
                    </h4>
                  </div>
                </div>

                {/* Subcategory interactive list - perfectly mapped as requested */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5 bg-stone-50/50">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block mb-2 border-b border-stone-200/60 pb-1 flex items-center gap-1">
                      <ListFilter className="w-3 h-3 text-stone-400" /> {lang === 'bn' ? 'সাব-ক্যাটাগরিসমূহ' : 'Sub-categories'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subCategories.map((sub, sIdx) => {
                        const isSubActive = selectedSubCategory === sub.bnName && isCatActive;
                        return (
                          <button
                            key={sIdx}
                            onClick={() => {
                              setSelectedCategory(cat.slug);
                              setSelectedSubCategory(sub.bnName);
                            }}
                            className={`px-3 py-1 rounded text-xs transition-all cursor-pointer font-bold ${
                              isSubActive
                                ? 'bg-brand-navy text-white shadow-xs font-black scale-103'
                                : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                            }`}
                          >
                            {lang === 'bn' ? sub.bnName : sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-semibold italic">
                      {lang === 'bn' ? cat.bnDescription.slice(0, 36) + '...' : cat.description.slice(0, 36) + '...'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setSelectedSubCategory('All');
                      }}
                      className="text-brand-gold hover:text-brand-navy font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      {lang === 'bn' ? 'ব্রাউজ ➔' : 'Explore ➔'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PRODUCTS GALLERY AREA WITH FILTERS PANEL */}
      <main id="store-gallery" className="py-2 px-4 sm:px-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* Dynamic Filters Bar */}
        <div className="bg-white rounded-xl border border-stone-200/80 p-4 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
          
          {/* Active Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5 mr-1 select-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" /> {lang === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active filters:'}
            </span>
            {/* Category Indicator */}
            <span className="px-3 py-1 text-xs font-bold bg-brand-gold/10 text-brand-navy border border-brand-gold/20 rounded-md flex items-center gap-1">
              {selectedCategory === 'All' ? t.allCat : (lang === 'bn' ? CATEGORIES.find(c => c.slug === selectedCategory)?.bnName : CATEGORIES.find(c => c.slug === selectedCategory)?.name)}
              {selectedCategory !== 'All' && (
                <button onClick={() => handleSetCategoryClean('All')} className="hover:text-brand-gold font-black ml-1 text-[10px] cursor-pointer">✕</button>
              )}
            </span>
            {/* Sub-Category Indicator */}
            {selectedSubCategory !== 'All' && (
              <span className="px-3 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-md flex items-center gap-1">
                {selectedSubCategory}
                <button onClick={() => setSelectedSubCategory('All')} className="hover:text-amber-905 font-black ml-1 text-[10px] cursor-pointer">✕</button>
              </span>
            )}
            {/* Search filter indicator */}
            {searchQuery && (
              <span className="px-3 py-1 text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200 rounded-md flex items-center gap-1">
                {lang === 'bn' ? `খুঁজুন: '${searchQuery}'` : `Query: '${searchQuery}'`}
                <button onClick={() => setSearchQuery('')} className="hover:text-stone-850 font-black ml-1 text-[10px] cursor-pointer">✕</button>
              </span>
            )}
          </div>

          {/* Slider for Price Cap, Stock Check, and Dropdown Sorterm */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
            
            {/* Price Cap Slide */}
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600">
              <span>{t.maxPrice}</span>
              <input
                type="range"
                min="100"
                max={currency === 'USD' ? 140 : 15000}
                step={currency === 'USD' ? 5 : 200}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-navy focus:outline-none"
              />
              <span className="text-brand-navy font-extrabold">{formatPrice(maxPrice)}</span>
            </div>

            {/* In-Stock filter */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-stone-600 select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-brand-navy border-stone-300 focus:ring-brand-gold cursor-pointer"
              />
              <span>{t.inStock}</span>
            </label>

            {/* Sort controls */}
            <div className="relative flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-semibold text-stone-400 mr-1.5 uppercase select-none">{t.sortBy}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-extrabold bg-transparent border-0 focus:outline-none focus:ring-0 text-stone-700 cursor-pointer pr-4 hover:text-stone-900"
              >
                <option value="Recommended">{t.featuredModel}</option>
                <option value="PriceLowToHigh">{t.priceLowHigh}</option>
                <option value="PriceHighToLow">{t.priceHighLow}</option>
                <option value="HighestRated">{t.topReviewed}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Gallery Title Counter */}
        <div className="flex justify-between items-end mb-6 border-b border-stone-200/60 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight flex items-center gap-2">
              {lang === 'bn' ? 'সুপার স্টোর প্রোডাক্টস গ্যালারি' : 'Nusrah Boutique Accessories'} 
              <span className="text-xs font-bold text-stone-500 lowercase">
                ({filteredProducts.length} {t.productsCount})
              </span>
            </h3>
          </div>

          {/* Reset Filters Option if filtered */}
          {(selectedCategory !== 'All' || selectedSubCategory !== 'All' || searchQuery !== '' || onlyInStock || maxPrice < maxPriceLimit) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSubCategory('All');
                setSearchQuery('');
                setOnlyInStock(false);
                setMaxPrice(currency === 'USD' ? 140 : 15000);
                setSortBy('Recommended');
              }}
              className="text-xs font-bold text-brand-gold hover:text-brand-navy underline hover:no-underline transition-all cursor-pointer"
            >
              ✕ {t.clearFilters}
            </button>
          )}
        </div>

        {/* Grid rendering products */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountRatio = hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-stone-200/60 p-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col relative"
                >
                  {/* Dynamic Heart Toggle */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-6 right-6 bg-white/90 p-2 rounded-full border border-stone-100 text-stone-400 hover:text-brand-gold transition-colors z-10 shadow-xs cursor-pointer"
                    title={isWishlisted ? 'Remove wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-brand-gold text-brand-gold' : ''}`} />
                  </button>

                  {/* Top Imagery Stage */}
                  <div
                    onClick={() => handleOpenDetails(product)}
                    className="bg-stone-50 h-52 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden cursor-pointer"
                  >
                    {/* Status badges */}
                    {product.isNew && (
                      <span className="absolute top-2.5 left-2.5 bg-brand-navy text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shadow">
                        NEW
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2.5 left-14 bg-brand-gold text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shadow">
                        -{discountRatio}% OFF
                      </span>
                    )}
                    {product.stock <= 3 && product.stock > 0 && (
                      <span className="absolute bottom-2 left-2 bg-brand-gold text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">
                        {t.onlyLeft}
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute inset-0 bg-stone-900/60 text-white flex items-center justify-center font-black text-xs uppercase shadow">
                        {t.soldOut}
                      </span>
                    )}

                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-40 h-40 object-cover rounded-md transform group-hover:scale-104 transition-transform duration-300"
                    />
                  </div>

                  {/* Subtitle tag details */}
                  <div className="mb-1.5 flex justify-between items-center text-[10px] uppercase font-extrabold text-stone-400">
                    <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                      {lang === 'bn' ? (CATEGORIES.find(c => c.slug === product.category)?.bnName || product.category) : product.category}
                    </span>
                    <span className="text-brand-gold font-extrabold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {product.subCategory}
                    </span>
                  </div>

                  {/* Title and descriptions */}
                  <h4
                    onClick={() => handleOpenDetails(product)}
                    className="font-extrabold text-sm mb-1.5 text-stone-900 hover:text-brand-navy cursor-pointer min-h-[40px] line-clamp-2 transition-colors leading-tight"
                  >
                    {lang === 'bn' ? product.bnName : product.name}
                  </h4>

                  {/* Star indicators */}
                  <div className="flex items-center mb-3">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-stone-400 ml-1.5">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price blocks + add to cart triggers */}
                  <div className="mt-auto pt-3 border-t border-stone-150 flex items-center justify-between">
                    <div>
                      <div className="text-stone-900 font-black text-sm sm:text-base">
                        {formatPrice(product.price)}
                      </div>
                      {hasDiscount && (
                        <div className="text-stone-400 line-through text-[11px]">
                          {formatPrice(product.originalPrice!)}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product, 1, product.sizes?.[0], product.colors?.[0])}
                        className={`font-black text-[9px] uppercase tracking-wider px-2 py-2 rounded-md transition-all cursor-pointer shadow-xs ${
                          product.stock === 0
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'border border-brand-navy text-brand-navy hover:bg-stone-50'
                        }`}
                        title={t.addToCart}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={product.stock === 0}
                        onClick={() => handleOpenDetails(product)}
                        className={`font-black text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-md transition-all cursor-pointer shadow-md ${
                          product.stock === 0
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-brand-navy hover:bg-brand-navy/90 text-white'
                        }`}
                      >
                        {lang === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-stone-800">
              {lang === 'bn' ? 'কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি' : 'No Products Match Your Criteria'}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {lang === 'bn' ? 'উইন্ডো ফিল্টার অথবা সার্চ কুয়েরি পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try loosening your price filters or search phrase.'}
            </p>
          </div>
        )}
      </main>

      {/* 7. AUTHENTICATION & PROFILE MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-fade-in shadow-black/30">
            {/* Modal Header */}
            <div className="bg-brand-navy p-4 flex justify-between items-center text-white">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-brand-gold" />
                {currentUser ? (lang === 'bn' ? 'আমার প্রোফাইল' : 'My Profile') : (lang === 'bn' ? 'লগইন করুন' : 'Sign In')}
              </h3>
              <button 
                onClick={() => setIsLoginModalOpen(false)} 
                className="hover:text-brand-gold transition-all duration-200 cursor-pointer text-lg w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {currentUser ? (
              /* PROFILE VIEW */
              <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/10 text-brand-navy flex items-center justify-center text-2xl font-black border-2 border-brand-gold/20 shadow-inner">
                    {currentUser.name[0]}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-stone-900 text-lg leading-tight">{currentUser.name}</h4>
                    <p className="text-xs text-stone-500 font-bold">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-brand-gold/10 text-brand-navy text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-gold/20 shadow-xs">
                        Nusrah Premium Member
                      </span>
                    </div>
                  </div>
                </div>

                {/* MY ORDERS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-stone-850 text-xs uppercase tracking-widest flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-brand-gold" />
                      {lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Order History'}
                    </h5>
                    <span className="text-[10px] bg-brand-navy text-white px-2.5 py-0.5 rounded-full font-black shadow-sm">
                      {orders.filter(o => o.email === currentUser.email).length} {lang === 'bn' ? 'টি অর্ডার' : 'Orders'}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {orders.filter(o => o.email === currentUser.email).length > 0 ? (
                      orders.filter(o => o.email === currentUser.email).map((order) => (
                        <div key={order.orderId} className="group bg-white hover:bg-stone-50/40 border border-stone-200 hover:border-brand-gold/40 rounded-xl p-4 transition-all duration-300 shadow-xs hover:shadow-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-[10px] font-black text-brand-navy uppercase tracking-tighter mb-0.5">#{order.orderId}</p>
                              <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                                <ListFilter className="w-2.5 h-2.5" />
                                {order.date}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.8 rounded border shadow-xs ${
                                order.status === 'Delivered' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                  : order.status === 'Cancelled'
                                  ? 'bg-stone-50 text-stone-400 border-stone-200'
                                  : 'bg-brand-gold/10 text-brand-navy border-brand-gold/20'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-[9px] text-stone-400 font-bold uppercase">{order.paymentMethod}</span>
                            </div>
                          </div>
                          
                          <div className="flex -space-x-2.5 mb-4 overflow-hidden py-1">
                            {order.items.slice(0, 4).map((item: any, i: number) => (
                              <div key={i} className="relative w-9 h-9 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                                <img 
                                  src={item.product.images[0]} 
                                  className="w-full h-full object-cover" 
                                  alt="Ordered item"
                                />
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="w-9 h-9 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-500 shadow-md">
                                +{order.items.length - 4}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট পেমেন্ট' : 'Settled Total'}</span>
                              <span className="text-sm font-black text-brand-navy">{formatPrice(order.total)}</span>
                            </div>
                            {order.txId && order.txId !== 'PAID_PROTOCOL' && (
                              <div className="flex flex-col items-center">
                                <span className="text-[8px] font-bold text-stone-400 uppercase">TrxID</span>
                                <span className="text-[9px] font-mono font-bold text-brand-gold bg-brand-gold/5 px-1.5 rounded border border-brand-gold/10 uppercase tracking-tighter">{order.txId}</span>
                              </div>
                            )}
                            <button 
                              onClick={() => {
                                setActiveReceipt(order);
                                setCheckoutStep('receipt');
                                setIsLoginModalOpen(false);
                              }}
                              className="bg-stone-50 hover:bg-brand-navy text-stone-800 hover:text-white border border-stone-200 hover:border-brand-navy py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 group/btn cursor-pointer transition-all duration-300"
                            >
                              {lang === 'bn' ? 'ডিটেইলস' : 'Details'}
                              <ArrowRight className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-100">
                        <ShoppingBag className="w-12 h-12 text-stone-200 mx-auto mb-3 opacity-50" />
                        <h6 className="text-stone-850 font-black text-xs uppercase tracking-widest">{lang === 'bn' ? 'কোনো অর্ডার অর্ডার নেই' : 'Vault is Empty'}</h6>
                        <p className="text-[10px] text-stone-400 font-bold mt-1 max-w-[200px] mx-auto uppercase">
                          {lang === 'bn' ? 'আপনার পূর্ববর্তী ও চলমান সকল অর্ডার এখানে দেখা যাবে।' : 'Every order you place will be securely archived here.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-150">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2.5 text-stone-400 hover:text-red-500 transition-all duration-300 text-[11px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-red-50/50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t.signOut}
                  </button>
                </div>
              </div>
            ) : (
              /* AUTH MODES: LOGIN, SIGNUP, FORGOT */
              <div className="p-0">
                {/* Header Profile Icon */}
                <div className="text-center pt-8 px-8 space-y-2.5">
                  <div className="w-14 h-14 bg-orange-500 text-stone-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-orange-400 shadow-xl shadow-orange-500/10 transform -rotate-3">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-stone-950 uppercase tracking-tight leading-none">
                    {authMode === 'login' ? (lang === 'bn' ? 'লগইন করুন' : 'Authentication Gate') : 
                     authMode === 'signup' ? (lang === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Member Registration') :
                     (lang === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Recovery Protocol')}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">
                    {lang === 'bn' ? 'আপনার ব্যক্তিগত অ্যাকাউন্ট অ্যাক্সেস করুন' : 'Nusrah Apparel Secure Network'}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="px-8 mt-8">
                  <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200">
                    <button 
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white text-stone-950 shadow-sm border border-stone-200' : 'text-stone-400 hover:text-stone-600 cursor-pointer'}`}
                    >
                      {lang === 'bn' ? 'লগইন' : 'Login'}
                    </button>
                    <button 
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-white text-stone-950 shadow-sm border border-stone-200' : 'text-stone-400 hover:text-stone-600 cursor-pointer'}`}
                    >
                      {lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Signup'}
                    </button>
                  </div>
                </div>

                <div className="p-8 pt-6">
                  {authMode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-5">
                      {/* Role Selector */}
                      <div className="space-y-2 mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-450 ml-1 block">
                          {lang === 'bn' ? 'লগইন রোল নির্বাচন করুন' : 'Select Login Role'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => { setLoginRole('student'); }}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                              loginRole === 'student'
                                ? 'bg-orange-500/10 border-orange-500 text-orange-900 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-450 hover:bg-stone-100 hover:text-stone-700'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'bn' ? 'স্টুডেন্ট / ইউজার' : 'Student / User'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => { setLoginRole('admin'); }}
                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                              loginRole === 'admin'
                                ? 'bg-indigo-500/10 border-indigo-550 text-indigo-900 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-450 hover:bg-stone-100 hover:text-stone-700'
                            }`}
                          >
                            <Shield className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Gate'}</span>
                          </button>
                        </div>
                      </div>

                      {loginRole === 'admin' && (
                        <div className="space-y-1 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/80 my-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-900 ml-1 block">
                            {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি কোড (মাস্টার কোড)' : 'Admin Security Access Code'}
                          </label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                              type="password" 
                              required
                              value={adminCode}
                              onChange={(e) => setAdminCode(e.target.value)}
                              placeholder={lang === 'bn' ? 'মাস্টার কোড দিন...' : 'Verification key (e.g. Nascox123@1)'}
                              className="w-full bg-white border border-indigo-200 rounded-xl py-3 pl-11 pr-5 text-sm font-bold text-indigo-950 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-stone-300 shadow-xs"
                            />
                          </div>
                          <span className="block text-[9px] text-indigo-700 font-bold leading-tight mt-1">
                            {lang === 'bn' ? '* সাধারণ স্টুডেন্ট সিক্রেট কোড জানলেও অ্যাডমিন ড্যাশবোর্ডে লগইন করতে পারবে না।' : '* Unauthorized student roles cannot enter even with correct system key.'}
                          </span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300 group-focus-within:text-orange-500 transition-colors" />
                          <input 
                            type="email" 
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="customer@example.com"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-4 pl-12 pr-5 text-sm font-bold text-stone-950 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:outline-none transition-all placeholder:text-stone-300 shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                        <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300 group-focus-within:text-orange-500 transition-colors" />
                          <input 
                            type="password" 
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-4 pl-12 pr-5 text-sm font-bold text-stone-950 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:outline-none transition-all placeholder:text-stone-300 shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4.5 h-4.5 border-2 border-stone-200 rounded text-orange-500 focus:ring-orange-500/20 cursor-pointer" 
                            />
                          </div>
                          <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest group-hover:text-stone-950 transition-colors">{lang === 'bn' ? 'মনে রাখুন' : 'Remember Me'}</span>
                        </label>
                        <button 
                          type="button"
                          onClick={() => setAuthMode('forgot')}
                          className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest cursor-pointer"
                        >
                          {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                        </button>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-stone-950 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] py-4.5 rounded-xl shadow-xl shadow-stone-950/20 transition-all flex items-center justify-center gap-3 group/submit cursor-pointer active:scale-98"
                      >
                        <span>{lang === 'bn' ? 'লগইন' : 'Login Securely'}</span>
                        <ArrowRight className="w-4 h-4 transform group-hover/submit:translate-x-1.5 transition-transform" />
                      </button>
                    </form>
                  )}

                  {authMode === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-4">
                      {/* Role Selector for Signup */}
                      <div className="space-y-2 mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-450 ml-1 block">
                          {lang === 'bn' ? 'নিবন্ধন টাইপ (Role)' : 'Select Registration Role'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => { setSignupRole('student'); }}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                              signupRole === 'student'
                                ? 'bg-orange-500/10 border-orange-500 text-orange-900 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-450 hover:bg-stone-100 hover:text-stone-700'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'bn' ? 'স্টুডেন্ট / ইউজার' : 'Student / User'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => { setSignupRole('admin'); }}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                              signupRole === 'admin'
                                ? 'bg-indigo-500/10 border-indigo-550 text-indigo-900 shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-450 hover:bg-stone-100 hover:text-stone-700'
                            }`}
                          >
                            <Shield className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'bn' ? 'অ্যাডমিন রোল' : 'Admin Role'}</span>
                          </button>
                        </div>
                      </div>

                      {signupRole === 'admin' && (
                        <div className="space-y-1 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/80 my-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-900 ml-1 block">
                            {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি কোড (কোর্স কোড)' : 'Admin Authorization Code'}
                          </label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                              type="password" 
                              required
                              value={adminCode}
                              onChange={(e) => setAdminCode(e.target.value)}
                              placeholder={lang === 'bn' ? 'মাস্টার সিক্রেট কোড...' : 'Admin verification key...'}
                              className="w-full bg-white border border-indigo-200 rounded-xl py-3 pl-11 pr-5 text-xs font-bold text-indigo-950 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-stone-300 shadow-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'আপনার নাম' : 'Full Name'}</label>
                          <input 
                            type="text" 
                            required
                            value={signupForm.name}
                            onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                            placeholder="John Doe"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-bold text-stone-950 focus:border-orange-500 focus:outline-none transition-all placeholder:text-stone-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}</label>
                          <input 
                            type="tel" 
                            required
                            value={signupForm.phone}
                            onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                            placeholder="01XXX-XXXXXX"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-bold text-stone-950 focus:border-orange-500 focus:outline-none transition-all placeholder:text-stone-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                        <input 
                          type="email" 
                          required
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                          placeholder="hello@example.com"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-bold text-stone-950 focus:border-orange-500 focus:outline-none transition-all placeholder:text-stone-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                          <input 
                            type="password" 
                            required
                            value={signupForm.password}
                            onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-bold text-stone-950 focus:border-orange-500 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}</label>
                          <input 
                            type="password" 
                            required
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-xs font-bold text-stone-950 focus:border-orange-500 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-stone-950 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer mt-4"
                      >
                        {lang === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Create Account'}
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {authMode === 'forgot' && (
                    <form onSubmit={(e) => { 
                      e.preventDefault(); 
                      alert(lang === 'bn' ? 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে!' : 'Password reset link dispatched!'); 
                      setAuthMode('login'); 
                    }} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-450 ml-1">{lang === 'bn' ? 'আপনার রেজিস্টার্ড ইমেইল' : 'Registered Email'}</label>
                        <input 
                          type="email" 
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="customer@example.com"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl py-4 px-5 text-sm font-bold text-stone-950 focus:border-orange-500 focus:outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-stone-950 text-white font-black text-xs uppercase tracking-[0.2em] py-4.5 rounded-xl shadow-xl transition-all cursor-pointer"
                      >
                        {lang === 'bn' ? 'লিঙ্ক পাঠান' : 'Send Reset Link'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="w-full text-[10px] font-black text-stone-400 hover:text-stone-950 uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        {lang === 'bn' ? 'লগইন এ ফিরে যান' : 'Back to Login'}
                      </button>
                    </form>
                  )}

                  <div className="pt-6 border-t border-stone-100 mt-6 text-center">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide leading-relaxed">
                      {lang === 'bn' 
                        ? 'নুসরাহ অ্যাপারেল - আপনার শপিং অভিজ্ঞতা হোক নিরাপদ ও নিরবচ্ছিন্ন।'
                        : 'Secure session initiation via Nusrah Encrypted Flow.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. DETAILED POPUP DIALOG */}
      {selectedProduct && (
        <div id="product-modal-panel" className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative animate-scale-up py-1 md:py-0">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 p-1.5 rounded-full z-20 cursor-pointer shadow"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Left Column Imagery Slide - Multiple Images Carousel Gallery */}
              <div className="bg-stone-50 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[280px] md:min-h-[420px] border-r border-stone-100">
                <div className="w-full h-64 sm:h-72 flex items-center justify-center mb-4 bg-white rounded-xl p-3 border border-stone-100 shadow-xs relative">
                  <img
                    src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="max-h-[240px] max-w-full object-contain rounded-lg transition-all duration-300 transform hover:scale-103"
                  />
                  {selectedProduct.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-stone-900/70 text-white font-mono text-[10px] px-2 py-0.5 rounded-full select-none">
                      {activeImageIndex + 1} / {selectedProduct.images.length}
                    </span>
                  )}
                </div>
                {/* Clickable Image Thumbnails */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 justify-center items-center overflow-x-auto max-w-full py-1">
                    {selectedProduct.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer focus:outline-none transition-all ${
                          activeImageIndex === index
                            ? 'border-rose-600 scale-105 ring-2 ring-rose-300/40'
                            : 'border-stone-200 hover:border-stone-400 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`${selectedProduct.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column Specifications */}
              <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-rose-55 text-rose-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-rose-100 uppercase">
                      {selectedProduct.category}
                    </span>
                    <span className="bg-amber-50 text-amber-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-amber-100 uppercase">
                      {selectedProduct.subCategory}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-stone-900 leading-tight">
                    {lang === 'bn' ? selectedProduct.bnName : selectedProduct.name}
                  </h2>
                </div>

                {/* Rating display */}
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(selectedProduct.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-500">
                    {selectedProduct.rating} ({selectedProduct.reviewCount} {lang === 'bn' ? 'রিভিউ' : 'reviews'})
                  </span>
                </div>

                {/* Pricing layout */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-stone-900">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-stone-400 line-through text-xs font-semibold">
                      {formatPrice(selectedProduct.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Descriptions block */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {lang === 'bn' ? selectedProduct.bnDescription : selectedProduct.description}
                </p>

                {/* Technical dynamic selections (Sizes & Colors) if exists */}
                <div className="space-y-4 pt-4 border-t border-stone-200">
                  {/* Sizes */}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase block mb-1.5">{t.sizeLabel}</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setDetailSize(size)}
                            className={`px-3 py-1.5 text-xs font-bold rounded border transition-all cursor-pointer ${
                              detailSize === size
                                ? 'border-rose-650 bg-rose-50 text-rose-650 font-black'
                                : 'border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase block mb-1.5">{t.colorLabel}</span>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.colors.map(color => (
                        <button
                          key={color.name}
                          onClick={() => setDetailColor(color)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded border cursor-pointer transition-all ${
                            detailColor?.name === color.name
                              ? 'border-rose-650 bg-stone-50 scale-103 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full ${color.class}`} />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action row Quantities */}
                  <div className="flex items-center gap-4 pt-2">
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase block mb-1.5">{t.qtyLabel}</span>
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          onClick={() => setDetailQuantity(q => Math.max(q - 1, 1))}
                          className="px-3 py-1.5 text-stone-500 hover:text-stone-850 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-extrabold text-stone-850 select-none">
                          {detailQuantity}
                        </span>
                        <button
                          onClick={() => setDetailQuantity(q => Math.min(q + 1, selectedProduct.stock))}
                          className="px-3 py-1.5 text-stone-500 hover:text-stone-850 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex gap-3">
                      <button
                        disabled={selectedProduct.stock === 0}
                        onClick={() => {
                          handleAddToCart(selectedProduct, detailQuantity, detailSize, detailColor);
                          setSelectedProduct(null);
                        }}
                        className={`flex-1 font-black text-[10px] uppercase tracking-wider py-3 rounded-md text-center transition-all cursor-pointer border-2 shadow-xs ${
                          selectedProduct.stock === 0
                            ? 'bg-stone-150 text-stone-400 border-stone-200 cursor-not-allowed'
                            : 'border-brand-navy text-brand-navy hover:bg-stone-50'
                        }`}
                      >
                        {selectedProduct.stock === 0 ? t.soldOut : lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                      </button>
                      <button
                        disabled={selectedProduct.stock === 0}
                        onClick={() => {
                          handleAddToCart(selectedProduct, detailQuantity, detailSize, detailColor);
                          setSelectedProduct(null);
                          setIsCartOpen(false);
                          setCheckoutStep('shipping');
                        }}
                        className={`flex-1 font-black text-[10px] uppercase tracking-wider py-3 rounded-md text-center transition-all cursor-pointer shadow-lg ${
                          selectedProduct.stock === 0
                            ? 'bg-stone-150 text-stone-400 cursor-not-allowed'
                            : 'bg-brand-navy hover:bg-brand-navy/90 text-white shadow-brand-navy/20'
                        }`}
                      >
                        {lang === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-component review feeds */}
                <div className="pt-6 border-t border-stone-200 space-y-4">
                  <h3 className="font-extrabold text-stone-850 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-brand-gold" /> {t.reviews} ({reviews[selectedProduct.id]?.length || 0})
                  </h3>

                  <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                    {reviews[selectedProduct.id]?.map((review) => (
                      <div key={review.id} className="bg-stone-50 p-3 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800 text-xs">{review.userName}</span>
                          <span className="text-[10px] text-stone-400 font-semibold">{review.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400' : 'text-stone-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-stone-600 italic">"{review.comment}"</p>
                      </div>
                    ))}
                    {(!reviews[selectedProduct.id] || reviews[selectedProduct.id].length === 0) && (
                      <p className="text-[11px] text-stone-450 italic">
                        {lang === 'bn' ? 'এই প্রোডাক্টে এখনো কোনো রিভিউ দেয়া হয়নি। প্রথম রিভিউটি দিন!' : 'No feedback left yet. Be the first to share your thoughts.'}
                      </p>
                    )}
                  </div>

                  {/* Inline review form */}
                  <form onSubmit={(e) => handleAddReviewSubmit(e, selectedProduct.id)} className="pt-4 border-t border-stone-150 space-y-2.5">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-stone-500">{t.writeReview}</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">{t.authorLabel}</label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="bg-stone-50 text-stone-850 text-xs font-semibold px-2 py-1.5 border border-stone-205 rounded w-full focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 mb-1">{lang === 'bn' ? 'রেটিং দিন' : 'Rating scale'}</label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="bg-stone-50 text-stone-850 text-xs font-semibold px-2 py-1.5 border border-stone-205 rounded w-full focus:outline-none focus:ring-1 focus:ring-rose-500"
                        >
                          <option value="5">★★★★★ (5)</option>
                          <option value="4">★★★★☆ (4)</option>
                          <option value="3">★★★☆☆ (3)</option>
                          <option value="2">★★☆☆☆ (2)</option>
                          <option value="1">★☆☆☆☆ (1)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 mb-1">{t.commentLabel}</label>
                      <textarea
                        required
                        rows={2}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="bg-stone-50 text-stone-850 text-xs font-semibold p-2 border border-stone-205 rounded w-full focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      />
                    </div>

                    {reviewSubmitMessage && (
                      <p className="text-[10px] font-extrabold text-teal-600 bg-teal-50 px-2 py-1.5 rounded">{reviewSubmitMessage}</p>
                    )}

                    <button
                      type="submit"
                      className="bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-md shadow-xs transition-all cursor-pointer"
                    >
                      {t.submitReview}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SHOPPING CART BOTTOM DRAWER */}
      {isCartOpen && (
        <div id="shopping-cart-drawer" className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col p-6 animate-slide-left">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
              <h3 className="font-black text-stone-850 text-base sm:text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-navy" /> {t.cart} ({cartCount})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-stone-450 hover:text-stone-850 hover:bg-stone-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Courier Shipping metrics */}
            <div className="bg-stone-50 rounded-xl p-3 mb-4 space-y-1.5 border border-stone-150">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                <span>{lang === 'bn' ? 'ফ্রি ডেলিভারি প্রোগ্রেস:' : 'Free Delivery Status:'}</span>
                <span className="text-brand-gold font-extrabold">
                  {progressPercent >= 100 ? t.freeShippingAlert : `${t.freeShippingProg} (${formatPrice(remainingForFreeShipping)})`}
                </span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-navy h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-stone-50/50 p-2.5 rounded-lg border border-stone-200/40 relative">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded bg-stone-150"
                  />
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-extrabold text-xs text-stone-900 truncate">
                      {lang === 'bn' ? item.product.bnName : item.product.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-bold mb-1">
                      {item.selectedSize && `Size: ${item.selectedSize}`} 
                      {item.selectedColor && ` / Color: ${item.selectedColor.name}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-205 rounded bg-white">
                        <button
                          onClick={() => handleUpdateCartQty(idx, -1)}
                          className="px-2 py-0.5 text-stone-400 hover:text-stone-850 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-extrabold text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(idx, 1)}
                          className="px-2 py-0.5 text-stone-400 hover:text-stone-850 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-brand-navy">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateCartQty(idx, -item.quantity)}
                    className="absolute top-2.5 right-2.5 text-stone-300 hover:text-brand-gold cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-16 space-y-2">
                  <ShoppingCart className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-stone-450 font-bold text-xs">{t.emptyCart}</p>
                </div>
              )}
            </div>

            {/* Cart summary and CTA */}
            {cart.length > 0 && (
              <div className="border-t border-stone-200 pt-4 mt-4 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-stone-500 font-bold">
                    <span>{t.subtotal}</span>
                    <span>{formatPrice(subtotalSum)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-500 font-bold">
                    <span>{t.shipping}</span>
                    <span>{deliveryCharge === 0 ? (lang === 'bn' ? 'ফ্রি' : 'FREE') : formatPrice(currency === 'USD' ? 10 : 120)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-850 font-black text-sm pt-1 border-t border-stone-150">
                    <span>{t.total}</span>
                    <span className="text-brand-gold text-base">{formatPrice(currency === 'USD' ? finalTotalAmount : (subtotalSum + (deliveryCharge === 0 ? 0 : 120)))}</span>
                  </div>
                </div>

                {!currentUser && (
                  <div className="bg-orange-50 rounded-lg p-2.5 text-center text-[10px] sm:text-xs">
                    <p className="font-bold text-orange-950 mb-0.5 animate-pulse">
                      {lang === 'bn' ? 'অ্যাকাউন্টে লগইন নেই' : 'You are not logged in'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setAuthMode('login');
                        setIsLoginModalOpen(true);
                      }}
                      className="text-orange-600 hover:text-orange-700 font-extrabold uppercase tracking-wide underline cursor-pointer bg-transparent border-none py-0.5"
                    >
                      {lang === 'bn' ? 'সহজ ট্র্যাকিংয়ের জন্য এখনই লগইন করুন' : 'Log in for easier tracking'}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep('shipping');
                  }}
                  className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-lg text-center cursor-pointer shadow-lg hover:shadow-brand-navy/10 active:scale-[0.98] transition-all"
                >
                  {t.checkout} ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. SECURE LOCAL MULTI-STEP CHECKOUT SYSTEM */}
      {checkoutStep !== 'none' && (
        <div id="checkout-panel-root" className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  {lang === 'bn' ? 'নিরাপদ গেটওয়ে পেমেন্ট' : 'Secure Checkout Protocol'}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutStep('none')}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Visual Steps Tracker */}
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex justify-between items-center text-[11px] font-extrabold text-stone-400">
              <span className={checkoutStep === 'shipping' ? 'text-brand-navy' : 'text-stone-550'}>
                {lang === 'bn' ? '১. ঠিকানা' : '1. Delivery Info'}
              </span>
              <span className="text-stone-300">➔</span>
              <span className={checkoutStep === 'payment' ? 'text-brand-navy' : 'text-stone-550'}>
                {lang === 'bn' ? '২. পেমেন্ট পদ্ধতি' : '2. Secure Payment'}
              </span>
              <span className="text-stone-300">➔</span>
              <span className={checkoutStep === 'receipt' ? 'text-brand-navy' : 'text-stone-550'}>
                {lang === 'bn' ? '৩. চালান রসিদ' : '3. Official Invoice'}
              </span>
            </div>

            {/* STEP 1: SHIPPING DETAILS */}
            {checkoutStep === 'shipping' && (
              <form onSubmit={() => setCheckoutStep('payment')} className="p-6 space-y-4">
                <h4 className="font-extrabold text-stone-850 text-xs sm:text-sm uppercase tracking-wide border-b border-stone-150 pb-2 flex justify-between items-center">
                  <span>{lang === 'bn' ? 'ডেলিভারি ও কাস্টমার তথ্য' : 'Confirm Order Credentials'}</span>
                  <span className="text-[10px] text-brand-navy font-bold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20 italic">Nusrah Premium</span>
                </h4>

                {!currentUser && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 animate-fade-in">
                    <UserCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-amber-900 leading-tight">
                        {lang === 'bn' ? 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' : 'Already have an account?'}
                      </p>
                      <p className="text-[10px] text-amber-800/80 leading-normal mb-1.5 font-medium">
                        {lang === 'bn' ? 'আপনার সংরক্ষিত ঠিকানা ব্যবহার করতে এবং ওয়ালেটে পয়েন্ট পেতে লগইন করুন।' : 'Log in to auto-fill saved addresses and earn customer wallet points.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setIsLoginModalOpen(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider cursor-pointer shadow-xs border-none"
                      >
                        {lang === 'bn' ? 'লগইন করুন' : 'Log In Now'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3.5 text-xs text-stone-700">
                  {/* Full name */}
                  <div>
                    <label className="block text-brand-navy font-bold mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <User className="w-3 h-3 text-brand-gold" />
                      {lang === 'bn' ? 'কাস্টমারের পূর্ণ নাম (Full Name)' : 'Recipient Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'bn' ? 'উদা: নুসরাত জাহান' : 'e.g. Nusrat Jahan'}
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* Phone / Mobile No */}
                  <div>
                    <label className="block text-brand-navy font-bold mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <Smartphone className="w-3 h-3 text-brand-gold" />
                      {lang === 'bn' ? 'মোবাইল নম্বর (Phone Number)' : 'Contact Number'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="017XXXXXXXX"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none transition-all font-mono font-semibold"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-brand-navy font-bold mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <Mail className="w-3 h-3 text-brand-gold" />
                      {lang === 'bn' ? 'ইমেইল (Email - ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={shippingForm.email || ''}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-brand-navy font-bold mb-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <MapPin className="w-3 h-3 text-brand-gold" />
                      {lang === 'bn' ? 'বিস্তারিত ঠিকানা (Full Address)' : 'Complete Shipping Address'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder={lang === 'bn' ? 'বাসা নং ৪২, রোড ৭, ধানমন্ডি, ঢাকা' : 'e.g. House 42, Road 7, Dhanmondi, Dhaka'}
                      value={shippingForm.address}
                      onChange={(e) => {
                        const newAddr = e.target.value;
                        setShippingForm(prev => ({
                          ...prev,
                          address: newAddr,
                          deliveryAddress: sameAsHome ? newAddr : prev.deliveryAddress
                        }));
                      }}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none transition-all font-semibold justify-start text-left"
                    />
                  </div>

                  {/* Same as Home Address Toggle */}
                  <div className="flex items-center gap-2 py-0.5">
                    <input
                      type="checkbox"
                      id="same-address-checkbox"
                      checked={sameAsHome}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsHome(checked);
                        if (checked) {
                          setShippingForm(prev => ({ ...prev, deliveryAddress: prev.address }));
                        }
                      }}
                      className="w-4 h-4 text-brand-navy border-stone-300 rounded focus:ring-brand-gold cursor-pointer"
                    />
                    <label htmlFor="same-address-checkbox" className="text-[11px] font-bold text-stone-600 cursor-pointer select-none">
                      {lang === 'bn' ? 'ডেলিভারি ঠিকানা বর্তমান ঠিকানার মতই' : 'Delivery Address is same as Home/Contact Address'}
                    </label>
                  </div>

                  {/* Delivery Address (Conditional / Static input toggle) */}
                  {!sameAsHome && (
                    <div className="bg-stone-50/60 p-3 rounded-lg border border-stone-150 animate-fade-in">
                      <label className="block text-stone-650 font-bold mb-1">{lang === 'bn' ? 'ডেলিভারি ঠিকানা (Delivery Address)' : 'Specific Delivery Address'}</label>
                      <textarea
                        required
                        rows={2}
                        placeholder={lang === 'bn' ? 'পণ্যটি যেখানে ডেলিভারি নিতে চান...' : 'Where should the courier drop off your products?'}
                        value={shippingForm.deliveryAddress}
                        onChange={(e) => setShippingForm({ ...shippingForm, deliveryAddress: e.target.value })}
                        className="bg-white border border-stone-200 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none transition-all font-semibold"
                      />
                    </div>
                  )}

                  {/* Note / Comments */}
                  <div>
                    <label className="block text-stone-650 font-bold mb-1 flex items-center gap-1">
                      <span>{lang === 'bn' ? 'বিশেষ নোট বা মন্তব্য (Note/Comments)' : 'Special Note / Delivery Comments'}</span>
                      <span className="text-[10px] text-stone-400 font-normal">({lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'})</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder={lang === 'bn' ? 'উদা: ডেলিভারি বিকেল ৫টার পর দিলে ভালো হয়...' : 'e.g. Call before coming, drop off at reception...'}
                      value={shippingForm.note}
                      onChange={(e) => setShippingForm({ ...shippingForm, note: e.target.value })}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-150 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('none')}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs uppercase py-2.5 rounded cursor-pointer transition-all"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-navy hover:bg-brand-navy/90 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-md cursor-pointer shadow-lg transition-all"
                  >
                    {lang === 'bn' ? 'পেমেন্ট ধাপে যান' : 'Next Step'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {checkoutStep === 'payment' && (
              <form onSubmit={handlePaymentConfirm} className="p-6 space-y-4">
                <h4 className="font-extrabold text-stone-850 text-xs sm:text-sm uppercase tracking-wide border-b border-stone-150 pb-2">
                  {lang === 'bn' ? 'পছন্দসই পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Authorized Secure Settlement'}
                </h4>

                <div className="space-y-4.5 text-xs text-stone-700">
                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* bKash */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentForm({ ...paymentForm, method: 'bkash' });
                        setTargetPaymentNumber('01851-282847');
                        setPaymentForm(prev => ({ ...prev, mobileNumber: '01851282847' }));
                      }}
                      className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center text-center font-bold relative transition-all cursor-pointer ${
                        paymentForm.method === 'bkash'
                          ? 'border-pink-600 bg-pink-50/70 text-pink-600 ring-2 ring-pink-100 scale-[1.01]'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700 hover:scale-[1.01]'
                      }`}
                    >
                      {/* bKash Official replica logo */}
                      <div className="w-11 h-11 mb-1.5 flex items-center justify-center rounded-xl bg-pink-100/30 p-1">
                        <svg className="w-full h-full rounded-lg shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" rx="18" fill="#e2125a"/>
                          <path d="M50 20C38 30 30 43 28 56C36 48 48 44 58 44C65 44 72 47 78 52C72 43 62 36 50 20Z" fill="white"/>
                          <path d="M28 56C27 63 30 70 36 76C42 68 48 60 58 56C52 56 40 58 28 56Z" fill="#ffe4e6"/>
                          <circle cx="50" cy="48" r="4" fill="#fb7185"/>
                        </svg>
                      </div>
                      <span className="block text-[9px] uppercase tracking-wider text-pink-650 font-black mb-0.5">Mobile Wallet</span>
                      <span className="font-extrabold text-xs">বিকাশ (bKash)</span>
                      {paymentForm.method === 'bkash' && (
                        <span className="absolute top-1.5 right-1.5 bg-pink-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow">✓</span>
                      )}
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentForm({ ...paymentForm, method: 'nagad' });
                        setTargetPaymentNumber('01851-282847');
                        setPaymentForm(prev => ({ ...prev, mobileNumber: '01851282847' }));
                      }}
                      className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center text-center font-bold relative transition-all cursor-pointer ${
                        paymentForm.method === 'nagad'
                          ? 'border-orange-500 bg-orange-50/70 text-orange-600 ring-2 ring-orange-100 scale-[1.01]'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Nagad Official replica logo */}
                      <div className="w-11 h-11 mb-1.5 flex items-center justify-center rounded-xl bg-orange-100/30 p-1">
                        <svg className="w-full h-full rounded-lg shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" rx="18" fill="url(#nagadGradBig)"/>
                          <defs>
                            <linearGradient id="nagadGradBig" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                          </defs>
                          <path d="M50 18C38 35 34 48 38 62C42 76 52 80 58 80C64 80 70 76 68 66C66 56 58 52 60 40C62 28 50 18 50 18Z" fill="white"/>
                          <path d="M42 56c0 8 6 12 10 12s6-4 4-10-6-10-4-14c-8 6-10 12-10 12z" fill="#ffe4e6"/>
                        </svg>
                      </div>
                      <span className="block text-[9px] uppercase tracking-wider text-orange-600 font-black mb-0.5">Mobile Wallet</span>
                      <span className="font-extrabold text-xs">নগদ (Nagad)</span>
                      {paymentForm.method === 'nagad' && (
                        <span className="absolute top-1.5 right-1.5 bg-orange-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow">✓</span>
                      )}
                    </button>

                    {/* Rocket */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentForm({ ...paymentForm, method: 'rocket' });
                        setTargetPaymentNumber('01857-275327');
                        setPaymentForm(prev => ({ ...prev, mobileNumber: '01857275327' }));
                      }}
                      className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center text-center font-bold relative transition-all cursor-pointer ${
                        paymentForm.method === 'rocket'
                          ? 'border-purple-650 bg-purple-50/70 text-purple-700 ring-2 ring-purple-100 scale-[1.01]'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Rocket Official replica logo */}
                      <div className="w-11 h-11 mb-1.5 flex items-center justify-center rounded-xl bg-purple-100/30 p-1">
                        <svg className="w-full h-full rounded-lg shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" rx="18" fill="#8114a1"/>
                          <path d="M50 20 L25 55 L38 55 L28 75 L45 75 L38 85 L62 85 L55 75 L72 75 L62 55 L75 55 Z" fill="white" opacity="0.3"/>
                          <path d="M50 15 L66 40 H58 V55 H68 L50 85 L32 55 H42 V40 H34 Z" fill="white"/>
                          <circle cx="50" cy="30" r="3" fill="#8114a1" />
                        </svg>
                      </div>
                      <span className="block text-[9px] uppercase tracking-wider text-purple-600 font-black mb-0.5">DBBL Mobile</span>
                      <span className="font-extrabold text-xs">রকেট (Rocket)</span>
                      {paymentForm.method === 'rocket' && (
                        <span className="absolute top-1.5 right-1.5 bg-purple-700 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow">✓</span>
                      )}
                    </button>

                    {/* Others bank */}
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, method: 'bank' })}
                      className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center text-center font-bold relative transition-all cursor-pointer ${
                        paymentForm.method === 'bank'
                          ? 'border-indigo-800 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-100'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="block text-[9px] uppercase tracking-wider text-indigo-700 font-extrabold mb-0.5">Cards & Bank</span>
                      <span className="font-black text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-850" />
                        অন্যান্য ব্যাংক (Bank Transfer)
                      </span>
                      {paymentForm.method === 'bank' && (
                        <span className="absolute top-1.5 right-1.5 bg-indigo-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                      )}
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, method: 'cod' })}
                      className={`p-3.5 rounded-xl border-2 flex flex-col items-center justify-center text-center font-bold relative transition-all cursor-pointer sm:col-span-2 ${
                        paymentForm.method === 'cod'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-100'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="block text-[9px] uppercase tracking-wider text-emerald-650 font-extrabold mb-0.5">Direct Delivery</span>
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : 'Cash on Delivery (COD)'}
                      </span>
                      {paymentForm.method === 'cod' && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-650 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                      )}
                    </button>
                  </div>

                   {/* Dynamic Fields for Mobile wallets (bKash / Nagad / Rocket) */}
                  {(paymentForm.method === 'bkash' || paymentForm.method === 'nagad' || paymentForm.method === 'rocket') && (
                    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 space-y-4 animate-fade-in shadow-inner">
                      
                      {/* Interactive click to pay selection block */}
                      <div className="p-3 rounded-xl bg-white border border-stone-200 text-[11px] leading-relaxed shadow-sm">
                        {paymentForm.method === 'bkash' && (
                          <div className="space-y-2">
                            <span className="font-extrabold text-pink-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                              🌸 {lang === 'bn' ? 'অফিসিয়াল বিকাশ অ্যাকাউন্টসমূহ (ক্লিক করুন সরাসরি পেমেন্ট করতে):' : 'Official bKash Accounts (Click to Pay Directly):'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {shopConfig.bkashNumbers.map((num: string) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => handleCopyPaymentNumber(num)}
                                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    targetPaymentNumber === num
                                      ? 'bg-pink-600 text-white border-pink-700 shadow-sm scale-[1.02]'
                                      : 'bg-pink-50/40 hover:bg-pink-50 text-pink-700 border-pink-100'
                                  }`}
                                >
                                  <span>{num}</span>
                                  {copiedNotification === num ? (
                                    <span className="text-[9px] bg-white text-pink-700 px-1.2 py-0.1 rounded font-sans uppercase font-bold">Copied!</span>
                                  ) : (
                                    <span className="text-[10px] text-pink-400">📋</span>
                                  )}
                                </button>
                              ))}
                            </div>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">*{lang === 'bn' ? 'ক্লিক করলেই নম্বরটি কপি হবে এবং সরাসরি পেমেন্ট অ্যাপ/ডায়ালারে নিয়ে যাবে।' : 'Clicking will copy the number and attempt to initiate the payment app.'}</p>
                          </div>
                        )}

                        {paymentForm.method === 'nagad' && (
                          <div className="space-y-2">
                            <span className="font-extrabold text-orange-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              🔥 {lang === 'bn' ? 'অফিসিয়াল নগদ অ্যাকাউন্টসমূহ (ক্লিক করুন সরাসরি পেমেন্ট করতে):' : 'Official Nagad Accounts (Click to Pay Directly):'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {shopConfig.nagadNumbers.map((num: string) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => handleCopyPaymentNumber(num)}
                                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    targetPaymentNumber === num
                                      ? 'bg-orange-600 text-white border-orange-700 shadow-sm scale-[1.02]'
                                      : 'bg-orange-50/40 hover:bg-orange-50 text-orange-700 border-orange-100'
                                  }`}
                                >
                                  <span>{num}</span>
                                  {copiedNotification === num ? (
                                    <span className="text-[9px] bg-white text-orange-600 px-1.2 py-0.1 rounded font-sans uppercase font-bold">Copied!</span>
                                  ) : (
                                    <span className="text-[10px] text-orange-400">📋</span>
                                  )}
                                </button>
                              ))}
                            </div>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">*{lang === 'bn' ? 'ক্লিক করলেই নম্বরটি কপি হবে এবং সরাসরি পেমেন্ট অ্যাপ/ডায়ালারে নিয়ে যাবে।' : 'Clicking will copy the number and attempt to initiate the payment app.'}</p>
                          </div>
                        )}

                        {paymentForm.method === 'rocket' && (
                          <div className="space-y-2">
                            <span className="font-extrabold text-purple-700 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                              🚀 {lang === 'bn' ? 'অফিসিয়াল রকেট অ্যাকাউন্ট নম্বর (ক্লিক করুন সরাসরি পেমেন্ট করতে):' : 'Official Rocket Account (Click to Pay Directly):'}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {shopConfig.rocketNumbers.map((num: string) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => handleCopyPaymentNumber(num)}
                                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                    targetPaymentNumber === num
                                      ? 'bg-purple-700 text-white border-purple-800 shadow-sm scale-[1.02]'
                                      : 'bg-purple-50/40 hover:bg-purple-50 text-purple-700 border-purple-100'
                                  }`}
                                >
                                  <span>{num}</span>
                                  {copiedNotification === num ? (
                                    <span className="text-[9px] bg-white text-purple-700 px-1.2 py-0.1 rounded font-sans uppercase font-bold">Copied!</span>
                                  ) : (
                                    <span className="text-[10px] text-purple-400">📋</span>
                                  )}
                                </button>
                              ))}
                            </div>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">*{lang === 'bn' ? 'ক্লিক করলেই নম্বরটি কপি হবে এবং সরাসরি পেমেন্ট অ্যাপ/ডায়ালারে নিয়ে যাবে।' : 'Clicking will copy the number and attempt to initiate the payment app.'}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <label className="block text-[10px] text-stone-555 font-black uppercase tracking-widest mb-1.5 flex items-center justify-between px-1">
                          <span>{lang === 'bn' ? 'ট্রানজেকশন আইডি (Transaction ID)' : 'Transaction ID Reference'}</span>
                          <span className="text-[9px] text-brand-gold italic">Required*</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-stone-300" />
                          <input
                            type="text"
                            placeholder={lang === 'bn' ? 'উদা: 8N7A6D5C' : 'e.g. 8N7A6D5C'}
                            required
                            value={paymentForm.transactionId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                            className="bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 w-full font-mono text-xs font-bold focus:ring-4 focus:ring-brand-gold/10 focus:outline-none focus:border-brand-gold uppercase transition-all shadow-sm"
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-stone-400 font-bold leading-relaxed uppercase">
                          {lang === 'bn' 
                            ? 'পেমেন্ট সম্পন্ন হওয়ার পর ট্রানজেকশন আইডিটি এখানে দিন।' 
                            : 'After payment, enter the transaction ID here.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bank / Card Transfer */}
                  {paymentForm.method === 'bank' && (
                    <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 space-y-2.5 animate-fade-in text-stone-850">
                      <div>
                        <label className="block text-[10px] text-stone-555 font-bold mb-1">{lang === 'bn' ? 'ব্যাংক নির্বাচন করুন' : 'Select Authorized Bangladesh Bank'}</label>
                        <select
                          value={paymentForm.selectedBank}
                          onChange={(e) => setPaymentForm({ ...paymentForm, selectedBank: e.target.value })}
                          className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 w-full text-xs font-semibold focus:ring-2 focus:ring-rose-500/10 focus:outline-none focus:border-rose-500"
                        >
                          <option value="Dutch-Bangla Bank (DBBL)">Dutch-Bangla Bank (DBBL)</option>
                          <option value="The City Bank">The City Bank Ltd</option>
                          <option value="BRAC Bank">BRAC Bank PLC</option>
                          <option value="Eastern Bank (EBL)">Eastern Bank PLC (EBL)</option>
                          <option value="Mutual Trust Bank (MTB)">Mutual Trust Bank (MTB)</option>
                          <option value="Sonali Bank">Sonali Bank PLC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-555 font-bold mb-1">Holder Name</label>
                        <input
                          type="text"
                          required
                          value={paymentForm.cardName}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                          className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 w-full font-bold uppercase text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-555 font-bold mb-1">Card / Account Number</label>
                        <input
                          type="text"
                          required
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                          className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 w-full font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-555 font-bold mb-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={paymentForm.cardExpiry}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                            className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 w-full text-center font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-555 font-bold mb-1">CVV/CVN</label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            value={paymentForm.cardCvv}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardCvv: e.target.value })}
                            className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 w-full text-center font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on delivery notice */}
                  {paymentForm.method === 'cod' && (
                    <p className="bg-emerald-50/50 border border-emerald-150 rounded-lg p-3 text-[11px] text-emerald-800 italic leading-relaxed animate-fade-in">
                      {lang === 'bn'
                        ? '✓ ক্যাশ অন ডেলিভারি মোড কার্যকর করা হয়েছে। পণ্য হাতে পেয়ে কুরিয়ারের কাছে পেমেন্ট করতে হবে। কোনো প্রকার অগ্রিম পেমেন্টের ঝুঁকি নেই!'
                        : '✓ Cash on Delivery mode active! Safely settle payment in cash directly to delivery executive after receiving products.'}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-150 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('shipping')}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs uppercase py-2.5 rounded cursor-pointer"
                  >
                    {lang === 'bn' ? 'পূর্ববর্তী' : 'Go Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-navy hover:bg-brand-navy/90 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-md cursor-pointer shadow shadow-brand-navy/15 transition-all text-center"
                  >
                    {lang === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order'} — {formatPrice(finalTotalAmount)}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS INVOICE RECEIPT */}
            {checkoutStep === 'receipt' && activeReceipt && (
              <div className="p-6 space-y-4.5 max-h-[82vh] overflow-y-auto animate-fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center mx-auto text-emerald-500 mb-2">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                    {lang === 'bn' ? 'অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!' : 'Payment & Order Authorized!'}
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1 pb-1 flex justify-center">
                    {lang === 'bn' ? `অর্ডার আইডি: ${activeReceipt.orderId}` : `System Track ID: ${activeReceipt.orderId}`}
                  </p>
                </div>

                {/* Sub-table summary */}
                <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 text-xs">
                  <div className="bg-stone-900 text-stone-300 p-2.5 font-bold uppercase tracking-wider text-[10px] flex justify-between">
                    <span>{lang === 'bn' ? 'প্রোডাক্ট বিবরণ' : 'Item Description'}</span>
                    <span>{lang === 'bn' ? 'মোট মূল্য' : 'Amount'}</span>
                  </div>
                  <div className="p-3 space-y-2.5">
                    {activeReceipt.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-stone-700 font-sans">
                        <div className="flex flex-col max-w-[220px]">
                          <span className="font-bold">
                            {lang === 'bn' ? item.product.bnName : item.product.name}
                          </span>
                          <span className="text-[10px] text-stone-450">
                            {lang === 'bn' ? 'পরিমাণ' : 'Qty'}: {item.quantity} | {lang === 'bn' ? 'সাইজ' : 'Size'}: {item.selectedSize || 'N/A'} | {lang === 'bn' ? 'কালার' : 'Color'}: {item.selectedColor ? item.selectedColor.name : 'N/A'}
                          </span>
                        </div>
                        <span className="font-mono text-stone-900 font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    
                    <div className="pt-2.5 border-t border-stone-200 space-y-1.5 text-stone-550">
                      <div className="flex justify-between items-center text-[11px]">
                        <span>{t.subtotal}</span>
                        <span className="font-mono">{formatPrice(activeReceipt.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span>{t.shipping}</span>
                        <span className="font-mono">{activeReceipt.shipping === 0 ? 'FREE' : formatPrice(activeReceipt.shipping)}</span>
                      </div>
                      <div className="flex justify-between items-center font-black text-brand-navy text-sm pt-2 border-t border-stone-200">
                        <span>{lang === 'bn' ? 'সর্বমোট আদায়কৃত' : 'Settled Total'}</span>
                        <span className="font-mono">{formatPrice(activeReceipt.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping summary coordinates details */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-stone-700 text-[11px] sm:text-xs space-y-2">
                  <p className="font-extrabold text-stone-905 uppercase text-[10px] tracking-wider border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    {lang === 'bn' ? 'অर्डर ও কাস্টমার কোর্ডিনেটস' : 'Invoice Shipment Protocol'}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-1.5">
                    <div>
                      <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'কাস্টমারের নাম:' : 'Customer Full Name:'}</strong>{' '}
                      <span className="font-semibold text-stone-900">{activeReceipt.fullName}</span>
                    </div>
                    <div>
                      <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number Phone:'}</strong>{' '}
                      <span className="font-semibold text-stone-900 font-mono">{activeReceipt.phone}</span>
                    </div>
                    {activeReceipt.email && (
                      <div>
                        <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}</strong>{' '}
                        <span className="font-semibold text-stone-900">{activeReceipt.email}</span>
                      </div>
                    )}
                    <div>
                      <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Ship To Address:'}</strong>{' '}
                      <span className="font-semibold text-stone-700 leading-relaxed block bg-white border border-stone-200 p-2 rounded mt-1">{activeReceipt.deliveryAddress}</span>
                    </div>
                    <div>
                      <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'বর্তমান ঠিকানা:' : 'Contact Address:'}</strong>{' '}
                      <span className="font-medium text-stone-800">{activeReceipt.address}</span>
                    </div>
                    <div>
                      <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}</strong>{' '}
                      <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{activeReceipt.deliveryAddress}</span>
                    </div>
                    
                    {activeReceipt.note && (
                      <div className="bg-amber-50/50 p-2 rounded border border-amber-100 text-amber-955 italic text-[11px]">
                        <strong className="text-amber-900 not-italic font-bold">{lang === 'bn' ? 'বিশেষ দ্রষ্টব্য / মন্তব্য:' : 'Special Note / Comments:'}</strong>{' '}
                        {activeReceipt.note}
                      </div>
                    )}
                    
                    <div className="pt-1.5 border-t border-stone-150 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Settlement Method:'}</strong>{' '}
                          <span className="uppercase font-extrabold text-emerald-700">{activeReceipt.paymentMethod}</span>
                        </div>
                        {activeReceipt.txId && activeReceipt.txId !== 'PAID_PROTOCOL' && (
                          <div className="text-right">
                            <strong className="text-stone-500 font-bold">TrxID:</strong>{' '}
                            <span className="font-mono text-brand-gold font-bold bg-brand-gold/5 px-1.5 py-0.5 rounded border border-brand-gold/10 uppercase text-[10px]">{activeReceipt.txId}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-stone-100/50">
                        <div>
                          <strong className="text-stone-500 font-bold">{lang === 'bn' ? 'তারিখ:' : 'Shipment Date:'}</strong>{' '}
                          <span className="font-mono text-stone-600 font-medium">{activeReceipt.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setCheckoutStep('none');
                      setIsWalletOpen(true);
                    }}
                    className="flex-1 bg-brand-gold text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-yellow-600 transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {lang === 'bn' ? 'আমার ওয়ালেটে দেখুন' : 'View in My Wallet'}
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutStep('none');
                      setActiveReceipt(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 bg-stone-100 text-stone-700 font-bold py-4 rounded-xl hover:bg-stone-200 transition-all text-sm uppercase tracking-wide cursor-pointer"
                  >
                    {lang === 'bn' ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN MASTER CONTROL CENTER
          ========================================== */}
      {isProcurementLogsOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/60 transition-all duration-500">
          <div className="bg-white w-full max-w-7xl max-h-[92vh] rounded-[48px] shadow-3xl overflow-hidden flex flex-col relative animate-fade-in-up border border-stone-200">
            
            {/* Header: Identity & Tabs */}
            <div className="bg-stone-900 p-8 sm:p-10 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12">
                <Database className="w-56 h-56" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-brand-gold rounded-3xl shadow-2xl shadow-brand-gold/20 transform rotate-3">
                    <SlidersHorizontal className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">{lang === 'bn' ? 'অ্যাডমিন মাস্টার প্যানেল' : 'Admin Master Control'}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-[0.2em]">{lang === 'bn' ? 'সিস্টেম ভার্সন ৪.০' : 'System Build V4.0'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest leading-none">Security Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0">
                  {[
                    { id: 'logs', label: lang === 'bn' ? 'অর্ডার লগস' : 'Order Logs', icon: ClipboardList },
                    { id: 'users', label: lang === 'bn' ? 'ইউজার ডাটাবেস' : 'User Database', icon: UserCircle },
                    { id: 'inventory', label: lang === 'bn' ? 'ইনভেন্টরি' : 'Inventory', icon: Package }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAdminTab(tab.id as any)}
                      className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        activeAdminTab === tab.id ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20' : 'text-stone-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setIsProcurementLogsOpen(false)}
                className="absolute top-8 right-8 p-2 bg-white/5 hover:bg-white/10 text-stone-500 hover:text-white rounded-full transition-all z-20 cursor-pointer border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-10 bg-stone-50/10">
              
              {/* Tab: Logs */}
              {activeAdminTab === 'logs' && (
                <div className="bg-white rounded-[40px] border border-stone-200 overflow-hidden shadow-2xl">
                  <table className="w-full border-collapse text-left min-w-[1000px]">
                    <thead>
                      <tr className="bg-stone-900 text-stone-400 uppercase text-[9px] font-black tracking-[0.2em] border-b border-stone-800">
                        <th className="p-6">Order ID & Status</th>
                        <th className="p-6">Client Identity</th>
                        <th className="p-6">Fulfillment Manifest</th>
                        <th className="p-6">Revenue & Protocol</th>
                        <th className="p-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-24 text-center text-stone-300 font-bold uppercase tracking-widest text-xs italic">{lang === 'bn' ? 'কোনো লগ ডাটা পাওয়া যায়নি' : 'No Procurement Records Available'}</td>
                        </tr>
                      ) : (
                        orders.map((log, i) => (
                          <tr key={log.orderId || i} className="hover:bg-brand-gold/[0.02] transition-colors group">
                            <td className="p-6 align-top">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-brand-navy font-mono tracking-tighter uppercase">{log.orderId}</span>
                                <span className="text-[9px] font-bold text-stone-400 uppercase mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {log.date}</span>
                                <span className={`mt-3 text-[8px] font-black uppercase px-2.5 py-1 rounded-full border self-start shadow-sm ${
                                  log.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                                  log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  'bg-brand-navy/5 text-brand-navy border-brand-navy/10'
                                }`}>
                                  {log.status === 'Pending' ? (lang === 'bn' ? 'পেন্ডিং' : 'Pending') : (lang === 'bn' ? 'ডেলিভারড' : 'Delivered')}
                                </span>
                              </div>
                            </td>
                            <td className="p-6 align-top">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 border border-stone-200">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-black text-stone-850 uppercase">{log.fullName}</span>
                                </div>
                                <div className="flex items-center gap-3 pl-1">
                                  <Mail className="w-3.5 h-3.5 text-stone-300" />
                                  <span className="text-[10px] font-bold text-stone-500 break-all">{log.email}</span>
                                </div>
                                <div className="flex items-center gap-3 pl-1">
                                  <Smartphone className="w-3.5 h-3.5 text-stone-300" />
                                  <span className="text-[11px] font-bold text-stone-600 font-mono italic">{log.phone}</span>
                                </div>
                                <div className="flex items-start gap-3 pl-1">
                                  <MapPin className="w-3.5 h-3.5 text-stone-300 shrink-0 mt-0.5" />
                                  <span className="text-[10px] text-stone-400 break-all max-w-[180px] leading-relaxed italic">{log.address}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-6 align-top">
                              <div className="grid grid-cols-1 gap-2">
                                {log.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-100 hover:border-brand-gold/30 transition-colors">
                                    <img src={item.product?.image} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shadow-sm" alt="" />
                                    <div className="truncate flex-1">
                                       <p className="text-[10px] font-black text-stone-750 uppercase truncate leading-none mb-1">{lang === 'bn' ? item.product?.bnName : item.product?.name}</p>
                                       <p className="text-[9px] font-bold text-brand-gold uppercase tracking-tighter">Protocol: {formatPrice(item.product?.price)} x {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-6 align-top">
                              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase text-stone-400 tracking-widest leading-none">{lang === 'bn' ? ' can- gateway' : 'Gateway'}</span>
                                  <span className={`text-[10px] font-black uppercase ${
                                    log.paymentMethod === 'bkash' ? 'text-pink-600' : 
                                    log.paymentMethod === 'nagad' ? 'text-orange-500' : 'text-stone-500'
                                  }`}>{log.paymentMethod}</span>
                                </div>
                                {log.txId && (
                                  <div className="bg-white p-2.5 rounded-xl border border-stone-200 mt-2">
                                    <p className="text-[8px] font-black text-stone-400 uppercase mb-1 tracking-widest">Auth TXN</p>
                                    <p className="text-[10px] font-mono font-bold text-emerald-600 break-all select-all leading-tight">{log.txId}</p>
                                  </div>
                                )}
                                <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                                  <span className="text-[9px] font-black uppercase text-stone-400 tracking-widest leading-none">{lang === 'bn' ? 'টোটাল' : 'Revenue'}</span>
                                  <span className="text-sm font-black text-brand-navy">{formatPrice(log.total)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-6 align-top">
                               <div className="flex flex-col gap-2">
                                 <button 
                                   onClick={() => { setActiveReceipt(log); setCheckoutStep('receipt'); setIsProcurementLogsOpen(false); }}
                                   className="w-full py-2 flex items-center justify-center bg-stone-50 hover:bg-brand-navy hover:text-white text-stone-600 rounded-xl border border-stone-200 transition-all text-[9px] font-black uppercase tracking-widest cursor-pointer gap-2"
                                 >
                                   <FileText className="w-3.5 h-3.5" />
                                   {lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}
                                 </button>
                                 
                                 {log.status === 'Pending' && (
                                   <div className="flex gap-2">
                                     <button 
                                       onClick={() => {
                                         setOrders(prev => prev.map(o => o.orderId === log.orderId ? { ...o, status: 'Delivered', paymentStatus: 'Paid' } : o));
                                       }}
                                       className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
                                     >
                                       <CheckCircle className="w-3 h-3" />
                                       {lang === 'bn' ? 'অ্যাপ্রুভ' : 'OK'}
                                     </button>
                                     <button 
                                       onClick={() => {
                                         setOrders(prev => prev.map(o => o.orderId === log.orderId ? { ...o, status: 'Cancelled' } : o));
                                       }}
                                       className="flex-1 py-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                                     >
                                       <X className="w-3 h-3" />
                                       {lang === 'bn' ? 'বাতিল' : 'X'}
                                     </button>
                                   </div>
                                 )}
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: User Database */}
              {activeAdminTab === 'users' && (
                <div className="animate-fade-in space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[40px] border border-stone-200 shadow-sm flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4">
                        <UserCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-black text-stone-850 leading-none mb-1">{[...new Set(orders.map(o => o.phone))].length + 1}</h4>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'bn' ? 'মোট নিবন্ধিত গ্রাহক' : 'Verified Accounts'}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-stone-200 shadow-sm flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-4">
                        <MapPinned className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-black text-stone-850 leading-none mb-1">{[...new Set(orders.map(o => o.city))].length}</h4>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'bn' ? 'সক্রিয় ডেলিভারি সিটি' : 'Active Terminals'}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-stone-200 shadow-sm flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl font-black text-stone-850 leading-none mb-1">{orders.filter(o => o.total > 5000).length}</h4>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'bn' ? 'ভিআইপি গ্রাহক' : 'Elite Class Tier'}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] border border-stone-200 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                      <h3 className="text-xl font-black text-stone-850 tracking-tight">{lang === 'bn' ? 'গ্রাহক তথ্য ও ডাটাবেস' : 'User Identity Master List'}</h3>
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-navy transition-all cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        Export
                      </button>
                    </div>
                    <table className="w-full text-left min-w-[1000px]">
                      <thead>
                        <tr className="bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-widest border-b border-stone-200">
                          <th className="p-6">Profile</th>
                          <th className="p-6">Communication</th>
                          <th className="p-6">Logistics Hub</th>
                          <th className="p-6">Purchase Matrix</th>
                          <th className="p-6 text-center">Protocol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {/* Admin Display */}
                        <tr className="hover:bg-brand-gold/[0.05] transition-colors border-l-4 border-l-brand-gold">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-black text-lg">NA</div>
                              <div>
                                <p className="text-xs font-black text-stone-850 uppercase leading-none mb-1.5">Nusrah Admin</p>
                                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100 whitespace-nowrap">Master Access</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-stone-600 italic leading-none">nusrah.apparel@gmail.com</p>
                              <p className="text-[11px] font-black text-stone-400 font-mono leading-none">+880 1XXXXXXXXX</p>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2 text-stone-500">
                              <Building className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-tight">Main HQ Hub</span>
                            </div>
                          </td>
                          <td className="p-6">
                             <span className="text-[10px] font-black text-stone-850 uppercase tracking-widest">Architect Suite</span>
                          </td>
                          <td className="p-6 text-center">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mx-auto shadow-lg shadow-emerald-500/20" />
                          </td>
                        </tr>
                        {/* Users from existing orders */}
                        {[...new Map(orders.map(o => [o.phone, o])).values()].map((user, i) => (
                           <tr key={i} className="hover:bg-stone-50 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-stone-950 border border-orange-600 flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/10">
                                  {String((user as any).fullName || '').split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-stone-950 uppercase leading-none mb-1.5">{(user as any).fullName}</p>
                                  <span className="bg-emerald-500 text-stone-950 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-600">Verified Member</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="space-y-1 text-[11px] font-medium text-stone-600">
                                <p className="italic leading-none">{(user as any).email || 'no-email-sync'}</p>
                                <p className="font-mono text-stone-400 leading-none">{(user as any).phone}</p>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-2 text-stone-500">
                                <MapPin className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{(user as any).city || 'Local'} Port</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex flex-col gap-1">
                                <p className="text-[11px] font-black text-brand-navy leading-none">{formatPrice(orders.filter(o => o.phone === (user as any).phone).reduce((s, o) => s + o.total, 0))}</p>
                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none">Units: {orders.filter(o => o.phone === (user as any).phone).length}</p>
                              </div>
                            </td>
                            <td className="p-6 text-center">
                               <button className="w-10 h-10 bg-stone-50 hover:bg-stone-200 text-stone-400 rounded-xl border border-stone-100 transition-all cursor-pointer flex items-center justify-center mx-auto">
                                 <Info className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Inventory Placeholder */}
              {activeAdminTab === 'inventory' && (
                <div className="animate-fade-in py-24 text-center bg-white rounded-[48px] border border-stone-150 shadow-sm">
                   <Package className="w-24 h-24 text-stone-100 mx-auto mb-8 animate-bounce transition-all duration-1000" />
                   <h3 className="text-3xl font-black text-stone-850 tracking-tight mb-3 uppercase">{lang === 'bn' ? 'ইনভেন্টরি লজিস্টিকস' : 'Stock Provisioning'}</h3>
                   <p className="text-stone-400 text-xs font-black uppercase tracking-[0.3em]">{lang === 'bn' ? 'মডিউলটি এনক্রিপ্ট করা অবস্থায় আছে নুসরাহ ভল্টে।' : 'Security Decryption Protocol Required for Stock Matrices.'}</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-stone-50 p-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center px-12 gap-5 shrink-0">
              <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full bg-stone-900 border-2 border-white shadow-xl flex items-center justify-center text-[10px] font-black text-brand-gold ring-1 ring-stone-800">S{i}</div>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {lang === 'bn' ? 'সিস্টেম লজ ১০:০০ AM এ আপডেট হয়েছে' : 'High-Speed Logs Synced 0.02ms ago'}
                </p>
              </div>
              <button 
                onClick={() => setIsProcurementLogsOpen(false)}
                className="bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-12 py-4 rounded-2xl hover:bg-stone-800 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xl shadow-stone-900/20"
              >
                {lang === 'bn' ? 'টার্মিনাল উইন্ডো বন্ধ করুন' : 'Exit Secure Terminal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CUSTOMER PROFILE & DASHBOARD MODAL
          ========================================== */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-sm bg-stone-900/60 transition-all duration-300">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative animate-fade-in-up md:min-h-[600px]">
            
            {/* Exit/Back button to return to main page with all items */}
            <button 
              onClick={() => {
                setIsWalletOpen(false);
                setSelectedCategory('All');
              }}
              className="absolute top-8 right-8 p-2.5 bg-orange-500 hover:bg-orange-600 text-stone-950 rounded-full transition-all z-20 cursor-pointer shadow-lg shadow-orange-500/20 border-2 border-orange-400 group"
              title={lang === 'bn' ? 'মেইন পেইজে ফিরুন' : 'Back to Main Page'}
            >
              <X className="w-5 h-5 font-black group-hover:rotate-90 transition-transform" />
            </button>

            <div className="bg-stone-950 text-white p-8 md:p-12 h-24 md:h-auto flex flex-row lg:flex-col items-center justify-between lg:justify-start lg:w-80 border-r border-white/5 shrink-0 relative">
              
              <button 
                onClick={() => {
                  setIsWalletOpen(false);
                  setSelectedCategory('All');
                }}
                className="absolute top-4 right-4 lg:hidden p-2 bg-orange-500 hover:bg-orange-600 text-stone-950 rounded-full transition-all z-20 cursor-pointer shadow-lg shadow-orange-500/20"
              >
                <X className="w-5 h-5 font-black" />
              </button>

              <div className="flex items-center gap-4 lg:mb-10 lg:w-full">
                <div className="relative group">
                  <label className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-stone-950 overflow-hidden border-2 border-orange-400 shadow-xl shadow-orange-500/10 relative cursor-pointer block">
                    {currentUser?.profilePic || profileEditForm.profilePic ? (
                      <img src={currentUser?.profilePic || profileEditForm.profilePic} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <UserCircle className="w-10 h-10" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <input 
                       type="file" 
                       className="hidden" 
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const reader = new FileReader();
                           reader.onloadend = () => {
                             const base64 = reader.result as string;
                             setProfileEditForm(prev => ({...prev, profilePic: base64}));
                             // Auto-save on selection for convenience as requested
                             setCurrentUser(prev => prev ? {...prev, profilePic: base64} : null);
                           };
                           reader.readAsDataURL(file);
                         }
                       }} 
                     />
                  </label>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-stone-950 rounded-full" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg tracking-tight leading-none mb-1.5">{currentUser?.name || (lang === 'bn' ? 'সম্মানিত কাস্টমার' : 'Guest Member')}</h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest leading-none">VIP Level 1</span>
                      <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                    </div>
                    {/* Dynamic Role Badge in Sidebar */}
                    <div className="mt-1">
                      {currentUser?.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">
                          <Shield className="w-2.5 h-2.5 text-indigo-400" />
                          <span>ROLE: ADMIN</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">
                          <User className="w-2.5 h-2.5 text-amber-400" />
                          <span>ROLE: STUDENT</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 space-y-1.5 hidden lg:block w-full">
                {/* Back to Home Option for Everyone with All Items Reset */}
                <button
                  onClick={() => {
                    setIsWalletOpen(false);
                    setSelectedCategory('All');
                  }}
                  className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border-2 border-orange-500/30 bg-orange-500 text-stone-950 shadow-lg shadow-orange-500/10 mb-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-stone-950" />
                  {lang === 'bn' ? 'শপে ফিরে যান (Back)' : 'Back to Store'}
                </button>

                {/* Exclusive Direct Admin Dashboard Access Button for logged-in Administrators */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsWalletOpen(false);
                      setIsAdminView(true);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border bg-indigo-650 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/10 mb-3 group animate-pulse border-indigo-500/40"
                  >
                    <Shield className="w-5 h-5 text-indigo-200 group-hover:scale-115 transition-transform" />
                    <strong>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Control'}</strong>
                  </button>
                )}

                {/* Explicit Log In Button for Customer Portal Sidebar */}
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-stone-950 mb-4 group"
                >
                  <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {currentUser 
                    ? (lang === 'bn' ? 'অন্য অ্যাকাউন্ট লগইন' : 'Log In (Switch)') 
                    : (lang === 'bn' ? 'কাস্টমার লগইন' : 'Customer Log In')
                  }
                </button>

                {[
                  { id: 'overview', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Account Overview', icon: LayoutGrid },
                  { id: 'orders', label: lang === 'bn' ? 'অর্ডার হিস্ট্রি' : 'Order History', icon: Package },
                  { id: 'wishlist', label: lang === 'bn' ? 'পছন্দের তালিকা' : 'My Wishlist', icon: Heart, hideForAdmin: true },
                  { id: 'addresses', label: lang === 'bn' ? 'ঠিকানা ও লোকেশন' : 'Saved Addresses', icon: MapPinned, hideForAdmin: true },
                  { id: 'settings', label: lang === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Profile Settings', icon: Settings },
                  { id: 'register', label: lang === 'bn' ? 'নতুন কাস্টমার নিবন্ধন' : 'Register New Customer', icon: UserPlus }
                ]
                .filter(item => !(item.hideForAdmin && currentUser?.role === 'admin'))
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveProfileTab(item.id as any)}
                    className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                      activeProfileTab === item.id 
                        ? 'bg-orange-500 text-stone-950 border-orange-500 shadow-lg shadow-orange-500/20' 
                        : 'text-stone-300 border-transparent hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeProfileTab === item.id ? 'text-stone-950' : 'text-stone-500'}`} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-8 space-y-4">
                {currentUser ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/10 border border-rose-500/20 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {lang === 'bn' ? 'লগ-আউট করুন' : 'Sign Out'}
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer bg-emerald-500 text-stone-950 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 border border-emerald-600 group"
                  >
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    {lang === 'bn' ? 'লগইন করুন (Log In)' : 'Sign In Now'}
                  </button>
                )}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-1.5 opacity-50">Support Pulse</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-stone-300 font-bold uppercase tracking-tight">Active (24/7)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-stone-50/50 overflow-y-auto p-6 lg:p-12">
              

              {activeProfileTab === 'overview' && (
                <div className="animate-fade-in space-y-8">
                  {/* Quick Control Bar (Back, Log In, Log Out) for high visibility on all devices */}
                  <div className="bg-white border border-stone-200 rounded-[30px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                        <UserCircle className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-stone-900 uppercase tracking-widest leading-none mb-1">
                          {lang === 'bn' ? 'কাস্টমার নেভিগেশন কন্ট্রোল' : 'Customer Navigation Control'}
                        </p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">
                          {lang === 'bn' ? 'লগইন ও শপিং পেইজে দ্রুত যাতায়াত' : 'Manage account logins or return to the storefront grids'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Back Option */}
                      <button
                        onClick={() => {
                          setIsWalletOpen(false);
                          setSelectedCategory('All');
                        }}
                        className="flex items-center gap-2 px-5 py-3.5 bg-stone-900 hover:bg-stone-850 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-stone-900/20 active:scale-[0.98]"
                      >
                        <ArrowLeft className="w-4 h-4 text-orange-500" />
                        <span>{lang === 'bn' ? 'শপে ফিরে যান (Back)' : 'Back to Store'}</span>
                      </button>

                      {/* Log In Option */}
                      <button
                        onClick={() => {
                          setAuthMode('login');
                          setIsLoginModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>
                          {currentUser 
                            ? (lang === 'bn' ? 'অন্য অ্যাকাউন্ট লগইন' : 'Change/Log In') 
                            : (lang === 'bn' ? 'লগইন করুন (Log In)' : 'Log In Now')
                          }
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-stone-900 tracking-tight">{lang === 'bn' ? 'স্বাগতম প্রোফাইলে' : 'Welcome Back'}</h2>
                      <p className="text-stone-950 text-sm font-black mt-1 italic">{lang === 'bn' ? 'আপনার ব্যক্তিগত ড্যাশবোর্ড ও শপিং সামারি।' : 'Manage your orders, profile, and security preferences.'}</p>
                    </div>
                    <div className="bg-orange-500 p-4 px-6 rounded-3xl border border-orange-600 shadow-xl shadow-orange-500/20 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white text-stone-950 rounded-full flex items-center justify-center font-black text-lg">
                        {orders.length}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-stone-950 uppercase tracking-widest leading-none mb-1">{lang === 'bn' ? 'মোট শপিং' : 'Total Items'}</p>
                        <p className="text-base font-black text-stone-950 leading-none">{formatPrice(orders.reduce((s, o) => s + o.total, 0))}</p>
                      </div>
                    </div>
                  </div>

                  {/* RBAC Role-Based Access Control Banner */}
                  <div className={`p-6 rounded-[32px] border ${currentUser?.role === 'admin' ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50/50 border-amber-200'} shadow-sm`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${currentUser?.role === 'admin' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'} shrink-0`}>
                          {currentUser?.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">Security Access Protocol</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              currentUser?.role === 'admin' 
                                ? 'bg-indigo-150 text-indigo-900 border-indigo-300' 
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              {currentUser?.role === 'admin' ? (lang === 'bn' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'Role: Administrator') : (lang === 'bn' ? 'স্টুডেন্ট অ্যাকাউন্ট' : 'Role: Student / User')}
                            </span>
                          </div>
                          
                          <p className="text-xs font-black text-stone-905 uppercase tracking-wide leading-normal">
                            {currentUser?.role === 'admin' ? (
                              lang === 'bn' 
                                ? 'আপনার অ্যাডমিন প্রিভিলেজ সক্রিয় রয়েছে। আপনি ওয়েবসাইট টোটাল কন্ট্রোল ড্যাশবোর্ডে প্রবেশ করতে পারবেন।' 
                                : 'Master Administrative access confirmed. You hold permissions to execute CRUD and shop configs.'
                            ) : (
                              lang === 'bn' 
                                ? 'নিরাপত্তা বার্তা: আপনি স্টুডেন্ট রোল-এ আছেন। আপনি কোড জানলেও অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে পারবেন না।' 
                                : 'Security alert: You have standard Student clearance. Accessing the backend system files is strictly disabled.'
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        {currentUser?.role === 'admin' ? (
                          <button
                            onClick={() => {
                              setIsWalletOpen(false);
                              setIsAdminView(true);
                              window.scrollTo(0, 0);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-indigo-700 shadow-xl shadow-indigo-505/20 scale-100 hover:scale-102 transition-all cursor-pointer inline-block"
                          >
                            <Shield className="w-4 h-4 text-indigo-200" />
                            <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেলে যান' : 'Access Admin Master'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-700 bg-amber-100/60 p-3 rounded-2xl border border-amber-200/80">
                            <Lock className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'bn' ? 'প্যানেল লকড' : 'Backend Locked'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-stone-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-stone-950 uppercase tracking-widest">{lang === 'bn' ? 'মৌলিক তথ্য' : 'Personal Profile'}</h4>
                      <button 
                        onClick={() => setActiveProfileTab('settings')}
                        className="bg-orange-500 text-stone-950 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-600 shadow-lg shadow-orange-500/20 cursor-pointer hover:scale-105 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {lang === 'bn' ? 'এডিট' : 'Update'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: lang === 'bn' ? 'পূর্ণ নাম' : 'Full Identity', value: currentUser?.name || 'N/A', icon: User },
                        { label: lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Protocol', value: currentUser?.email || 'N/A', icon: Mail },
                        { label: lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Network', value: currentUser?.phone || 'N/A', icon: Smartphone }
                      ].map((field, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 group hover:border-orange-500 transition-colors shadow-sm">
                          <div className="p-2.5 bg-white text-orange-500 rounded-xl border border-stone-200 group-hover:bg-orange-500 group-hover:text-stone-950 transition-all shadow-xs">
                            <field.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] font-black text-stone-950 uppercase tracking-widest mb-0.5">{field.label}</p>
                            <p className="text-xs font-black text-stone-850 uppercase truncate">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-stone-200 shadow-sm">
                    <h4 className="text-xs font-black text-stone-850 uppercase tracking-widest mb-6">{lang === 'bn' ? 'সাম্প্রতিক অর্ডার ট্র্যাকিং' : 'Real-time Order Watch'}</h4>
                    {orders.length > 0 ? (
                      <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
                        {orders.slice(0, 3).map((order, i) => (
                           <div key={i} className="min-w-[280px] p-5 bg-stone-50 rounded-[28px] border border-stone-150 space-y-4 hover:shadow-lg transition-all cursor-pointer group" onClick={() => setActiveProfileTab('orders')}>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black font-mono text-stone-850 tracking-tighter uppercase">#{order.orderId.slice(-8)}</span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                  order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-500 border-amber-100'
                                }`}>{order.status}</span>
                              </div>
                              <div className="flex -space-x-3">
                                {order.items.map((item: any, j: number) => (
                                  <img key={j} src={item.product?.image} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm object-cover" alt="" />
                                ))}
                              </div>
                              <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                <p className="text-[9px] text-stone-400 font-bold uppercase">{order.date}</p>
                                <ArrowRight className="w-4 h-4 text-brand-gold group-hover:translate-x-1 transition-transform" />
                              </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-stone-400 italic py-4">{lang === 'bn' ? 'কোনো সাম্প্রতিক অর্ডার রেকর্ড নেই।' : 'No active purchase protocols found.'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Orders */}
              {activeProfileTab === 'orders' && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-8">{lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'Purchase History'}</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
                      <Package className="w-16 h-16 text-stone-100 mx-auto mb-4" />
                      <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">{lang === 'bn' ? 'কোনো অর্ডার ইতিহাস নেই' : 'No records found'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                      {orders.map((order, idx) => (
                        <div key={idx} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group border-l-4 border-l-brand-gold">
                          <div className="p-8">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                              <div className="flex gap-5">
                                <div className="w-14 h-14 bg-stone-900 rounded-2xl flex flex-col items-center justify-center border border-stone-800 shadow-lg shrink-0">
                                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-tighter">ID</span>
                                  <span className="text-sm font-black text-white font-mono">#{order.orderId.slice(-4)}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-black text-stone-850 tracking-tighter uppercase">{order.orderId}</span>
                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                                      order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                      'bg-brand-navy/5 text-brand-navy border-brand-navy/10'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.date}</span>
                                    <span className="w-1 h-1 bg-stone-300 rounded-full" />
                                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {order.paymentMethod}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between lg:justify-end gap-10 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100">
                                 <div className="flex flex-col items-start lg:items-end">
                                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">{lang === 'bn' ? 'সর্বমোট' : 'Authorized Amount'}</span>
                                  <span className="text-xl font-black text-brand-navy">{formatPrice(order.total)}</span>
                                </div>
                                <button onClick={() => { setActiveReceipt(order); setCheckoutStep('receipt'); setIsWalletOpen(false); }} className="flex items-center gap-2 px-5 py-3 bg-stone-50 text-stone-700 hover:text-white hover:bg-brand-navy rounded-2xl border border-stone-200 transition-all font-black text-[9px] uppercase tracking-widest cursor-pointer">
                                  <FileText className="w-4 h-4" />
                                  {lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}
                                </button>
                              </div>
                            </div>

                            {/* Tracking Line */}
                            <div className="mt-8 pt-8 border-t border-stone-100">
                              <div className="flex items-start justify-between relative px-2 sm:px-10 overflow-hidden">
                                <div className="absolute top-5 left-10 right-10 h-1 bg-stone-100 rounded-full z-0" />
                                <div className="absolute top-5 left-10 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-1000 origin-left" style={{ width: order.status === 'Delivered' ? 'calc(100% - 80px)' : (order.status === 'Shipped' ? 'calc(66% - 40px)' : 'calc(33% - 20px)') }} />
                                {[lang === 'bn' ? 'অর্ডার' : 'Placed', lang === 'bn' ? 'প্রসেসিং' : 'Process', lang === 'bn' ? 'শিফটিং' : 'Ship', lang === 'bn' ? 'সম্পন্ন' : 'Success'].map((s, i) => (
                                  <div key={i} className="flex flex-col items-center gap-2 relative z-10 w-16">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 ${i <= (order.status === 'Delivered' ? 3 : (order.status === 'Shipped' ? 2 : 1)) ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-300'}`}>
                                      <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-stone-400 text-center leading-tight">{s}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                              {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-stone-50/50 p-3 rounded-2xl border border-stone-100 min-w-[220px]">
                                  <img src={item.product?.image} alt="" className="w-10 h-10 object-cover rounded-xl border border-stone-200" />
                                  <div className="truncate">
                                    <p className="text-[10px] font-black text-stone-850 uppercase truncate">{lang === 'bn' ? item.product?.bnName : item.product?.name}</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Qty: {item.quantity} • {formatPrice(item.product?.price)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Wishlist */}
              {activeProfileTab === 'wishlist' && (
                <div className="animate-fade-in space-y-8">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">{lang === 'bn' ? 'পছন্দের তালিকা' : 'Curation Wishlist'}</h2>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-stone-200 shadow-sm">
                      <Heart className="w-16 h-16 text-stone-100 mx-auto mb-4" />
                      <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">{lang === 'bn' ? 'আপনার উইশলিস্ট খালি' : 'No items saved'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((productId) => {
                        const product = products.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <div key={product.id} className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <img src={product.images?.[0]} className="w-full aspect-[4/5] object-cover rounded-[24px] mb-4 group-hover:scale-105 transition-transform duration-500" alt="" />
                            <div className="px-2">
                               <h4 className="text-[11px] font-black text-stone-850 uppercase tracking-tighter mb-1 truncate">{lang === 'bn' ? product.bnName : product.name}</h4>
                               <p className="text-sm font-black text-brand-navy">{formatPrice(product.price)}</p>
                            </div>
                            <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                               <button onClick={() => { handleAddToCart(product); toggleWishlist(product.id); }} className="flex-1 bg-brand-navy text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg cursor-pointer">Move to Cart</button>
                               <button onClick={() => toggleWishlist(product.id)} className="w-12 bg-rose-50 text-rose-500 flex items-center justify-center rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Addresses */}
              {activeProfileTab === 'addresses' && (
                <div className="animate-fade-in space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">{lang === 'bn' ? 'সংরক্ষিত ঠিকানাসমূহ' : 'Delivery Ports'}</h2>
                    <button className="bg-brand-navy text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all cursor-pointer shadow-lg lg:shadow-none">
                      <Plus className="w-4 h-4" />
                      {lang === 'bn' ? 'নতুন ঠিকানা' : 'New Address'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { type: lang === 'bn' ? 'হোম অ্যাড্রেস' : 'Primary Residence', address: shippingForm.address || 'N/A', city: shippingForm.city || 'N/A', zip: shippingForm.zipCode || 'N/A', phone: shippingForm.phone || 'N/A', isDefault: true },
                      { type: lang === 'bn' ? 'অফিস অ্যাড্রেস' : 'Operating Hub', address: (lang === 'bn' ? 'গুলশান ২, ঢাকা' : 'Gulshan 2, Dhaka'), city: 'Dhaka', zip: '1212', phone: '01XXXXXXXXX', isDefault: false }
                    ].map((addr, i) => (
                      <div key={i} className="bg-white p-8 rounded-[36px] border border-stone-200 shadow-sm relative group hover:border-brand-gold/30 transition-all cursor-pointer">
                        {addr.isDefault && (
                          <div className="absolute top-6 right-8 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            Default
                          </div>
                        )}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="p-3 bg-stone-50 text-stone-400 rounded-2xl group-hover:text-brand-gold transition-colors shadow-xs">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-stone-850 uppercase tracking-widest mb-1">{addr.type}</h4>
                            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-tight leading-none mb-1">Nusrah Apparel Logistics Point</p>
                          </div>
                        </div>
                        <div className="space-y-3 text-stone-600 font-medium text-sm">
                          <p className="leading-relaxed">{addr.address}</p>
                          <p>{addr.city} {addr.zip && `- ${addr.zip}`}</p>
                          <div className="flex items-center gap-2 text-stone-400 text-xs font-bold pt-3 border-t border-stone-100">
                            <Smartphone className="w-3.5 h-3.5" />
                            {addr.phone}
                          </div>
                        </div>
                        <div className="mt-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex-1 py-3 rounded-2xl bg-stone-50 text-stone-700 font-black text-[9px] uppercase tracking-widest hover:bg-stone-100 transition-colors">Edit</button>
                          <button className="flex-1 py-3 rounded-2xl bg-rose-50 text-rose-600 font-black text-[9px] uppercase tracking-widest hover:bg-rose-100 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Settings */}
              {activeProfileTab === 'settings' && (
                <div className="animate-fade-in space-y-8 pb-10">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight">{lang === 'bn' ? 'প্রোফাইল কাস্টমাইজেশন' : 'Profile Orchestration'}</h2>
                      <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1 opacity-60">Manage your identity & digital touchpoints</p>
                    </div>
                    <button 
                      onClick={handleSaveProfileChanges}
                      className="bg-brand-navy text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-navy/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Commit Changes'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Avatar & Identity Card */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white border border-stone-200 p-8 rounded-[40px] shadow-sm flex flex-col items-center text-center relative group">
                        <div className="relative w-32 h-32 mb-6">
                          <div className="w-full h-full rounded-full border-4 border-brand-gold/10 p-1">
                            <img 
                              src={profileEditForm.profilePic || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600'} 
                              className="w-full h-full rounded-full object-cover shadow-lg"
                              alt="Profile"
                            />
                          </div>
                          <label className="absolute bottom-1 right-1 bg-brand-gold text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-all">
                             <Camera className="w-4 h-4" />
                             <input 
                               type="file" 
                               className="hidden" 
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                   const reader = new FileReader();
                                   reader.onloadend = () => setProfileEditForm({...profileEditForm, profilePic: reader.result as string});
                                   reader.readAsDataURL(file);
                                 }
                               }} 
                             />
                          </label>
                        </div>
                        <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">{currentUser?.name}</h3>
                        <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">{lang === 'bn' ? 'সদস্য হয়েছেন:' : 'Established since:'} {currentUser?.joinedDate}</p>
                        
                        <div className="mt-8 w-full pt-8 border-t border-stone-100 flex items-center justify-between">
                           <div className="text-center flex-1">
                              <p className="text-[9px] font-black text-stone-400 uppercase mb-1">Orders</p>
                              <p className="text-sm font-black text-stone-900">{orders.length}</p>
                           </div>
                           <div className="w-px h-8 bg-stone-100" />
                           <div className="text-center flex-1">
                              <p className="text-[9px] font-black text-stone-400 uppercase mb-1">Reviews</p>
                              <p className="text-sm font-black text-stone-900">12</p>
                           </div>
                        </div>
                      </div>

                      <div className="bg-stone-950 text-white p-8 rounded-[40px] shadow-xl overflow-hidden relative">
                         <ShieldCheck className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
                         <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Security Shield</p>
                         <h4 className="text-sm font-black uppercase tracking-tight mb-4 leading-tight">Your account is fortified with encryption</h4>
                         <button className="text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer">Verify ID Protocol</button>
                      </div>
                    </div>

                    {/* Right: Detailed Form */}
                    <div className="lg:col-span-2 space-y-6">
                       <div className="bg-white border border-stone-200 p-8 rounded-[40px] shadow-sm space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{lang === 'bn' ? 'পুরো নাম' : 'Verified Handle'}</label>
                                <div className="relative group">
                                   <input 
                                     type="text" 
                                     value={profileEditForm.name}
                                     onChange={(e) => setProfileEditForm({...profileEditForm, name: e.target.value})}
                                     className="w-full bg-stone-50 border border-stone-200 px-5 py-4 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                   />
                                   <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{lang === 'bn' ? 'ফোন নম্বর' : 'Primary Terminal'}</label>
                                <div className="relative group">
                                   <input 
                                     type="text" 
                                     value={profileEditForm.phone}
                                     onChange={(e) => setProfileEditForm({...profileEditForm, phone: e.target.value})}
                                     className="w-full bg-stone-50 border border-stone-200 px-5 py-4 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                   />
                                   <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{lang === 'bn' ? 'ইমেইল এড্রেস' : 'Digital Authentication'}</label>
                                <div className="relative group">
                                   <input 
                                     type="email" 
                                     value={profileEditForm.email}
                                     onChange={(e) => setProfileEditForm({...profileEditForm, email: e.target.value})}
                                     className="w-full bg-stone-50 border border-stone-200 px-5 py-4 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                   />
                                   <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{lang === 'bn' ? 'জন্ম তারিখ' : 'Origin Date'}</label>
                                <div className="relative group">
                                   <input 
                                     type="date" 
                                     value={profileEditForm.dob}
                                     onChange={(e) => setProfileEditForm({...profileEditForm, dob: e.target.value})}
                                     className="w-full bg-stone-50 border border-stone-200 px-5 py-4 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                   />
                                   <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{lang === 'bn' ? 'লিঙ্গ' : 'Gender Identity'}</label>
                             <div className="flex gap-4">
                                {['Female', 'Male', 'Other'].map((g) => (
                                   <button 
                                     key={g} 
                                     onClick={() => setProfileEditForm({...profileEditForm, gender: g})}
                                     className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${profileEditForm.gender === g ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-stone-50 text-stone-400 border-stone-200 hover:border-brand-gold/40 cursor-pointer'}`}
                                   >
                                      {g}
                                   </button>
                                ))}
                             </div>
                          </div>

                          <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-stone-100 rounded-xl text-stone-400">
                                   <Key className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none mb-1">Access Protocol</p>
                                   <p className="text-xs font-bold text-stone-800">Change Private Key / Password</p>
                                </div>
                             </div>
                             <button className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] hover:underline cursor-pointer">Launch Gateway</button>
                          </div>
                       </div>

                       <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] flex items-center justify-between gap-6 shadow-sm">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                                <ShieldCheck className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Privacy Consent</p>
                                <p className="text-xs font-bold text-stone-800 leading-tight">Your data is governed by our strict encryption guidelines.</p>
                             </div>
                          </div>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Register */}
              {activeProfileTab === 'register' && (
                <div className="animate-fade-in space-y-8 pb-10">
                  <div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                      {lang === 'bn' ? 'নতুন কাস্টমার নিবন্ধন করুন' : 'Register New Customer Account'}
                    </h2>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1 opacity-60">
                      {lang === 'bn' ? 'সরাসরি একটি নতুন সাধারণ কাস্টমার অ্যাকাউন্ট প্রোফাইল তৈরি করুন' : 'Spawn a brand new authenticated profile instantly'}
                    </p>
                  </div>

                  <div className="bg-white border border-stone-200 p-8 md:p-12 rounded-[40px] shadow-sm max-w-3xl">
                    <form onSubmit={handleDashSignup} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                            {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                          </label>
                          <div className="relative group">
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Adnan Rahman"
                              value={dashSignupForm.name}
                              onChange={(e) => setDashSignupForm({...dashSignupForm, name: e.target.value})}
                              className="w-full bg-stone-50 border border-stone-200 px-5 py-4 pl-12 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-sm"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                            {lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                          </label>
                          <div className="relative group">
                            <input 
                              type="tel" 
                              required
                              placeholder="e.g. 01712345678"
                              value={dashSignupForm.phone}
                              onChange={(e) => setDashSignupForm({...dashSignupForm, phone: e.target.value})}
                              className="w-full bg-stone-50 border border-stone-200 px-5 py-4 pl-12 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-sm"
                            />
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                          {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                        </label>
                        <div className="relative group">
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. custom@nusrah.com"
                            value={dashSignupForm.email}
                            onChange={(e) => setDashSignupForm({...dashSignupForm, email: e.target.value})}
                            className="w-full bg-stone-50 border border-stone-200 px-5 py-4 pl-12 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-sm"
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                            {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                          </label>
                          <div className="relative group">
                            <input 
                              type="password" 
                              required
                              placeholder="••••••••"
                              value={dashSignupForm.password}
                              onChange={(e) => setDashSignupForm({...dashSignupForm, password: e.target.value})}
                              className="w-full bg-stone-50 border border-stone-200 px-5 py-4 pl-12 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-sm"
                            />
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
                            {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                          </label>
                          <div className="relative group">
                            <input 
                              type="password" 
                              required
                              placeholder="••••••••"
                              value={dashSignupForm.confirmPassword}
                              onChange={(e) => setDashSignupForm({...dashSignupForm, confirmPassword: e.target.value})}
                              className="w-full bg-stone-50 border border-stone-200 px-5 py-4 pl-12 rounded-2xl text-[12px] font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all shadow-sm"
                            />
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-300" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit"
                          disabled={dashSignupLoading}
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 text-stone-950 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-98"
                        >
                          {dashSignupLoading ? (
                            <span>{lang === 'bn' ? 'রেজিস্ট্রেশন হচ্ছে...' : 'Registering Client...'}</span>
                          ) : (
                            <>
                              <span>{lang === 'bn' ? 'অ্যাকাউন্ট রেজিস্টার ও লগইন করুন' : 'Register New Member & Sign In'}</span>
                              <UserPlus className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}


      {/* 9. EXECUTIVE LEADERSHIP TEAM SECTION */}
      {/* "website er ekdum nice, funder and CEO er jonnu oicture and detailse likhar sujug thakbe, pasapasi managing director er o" */}
      <section id="leadership-section" className="bg-gradient-to-b from-stone-50 to-stone-100 border-t border-b border-stone-250/70 py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-stone-250 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-6 bg-brand-navy rounded"></span>
                <span className="text-brand-navy font-extrabold text-xs uppercase tracking-wider block">
                  {lang === 'bn' ? 'নুসরাহ ফ্যাশনের মূল কান্ডারি' : 'MANAGEMENT INTUITION'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                {lang === 'bn' ? 'আমাদের দূরদর্শী নেতৃত্বমণ্ডলী' : 'Meet Our Visionary Leaders'}
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xl">
                {lang === 'bn' 
                  ? 'গ্রাহক সন্তুষ্টি ও বিশ্বমানের মান নিশ্চিতকরণে আমাদের পরিচালনা পর্ষদের বার্তা।'
                  : 'Empowered statements regarding customer delight, material standards, and logistics excellence.'}
              </p>
            </div>

            {/* Editing Trigger Button */}
            <button
              onClick={() => {
                setEditLeaderForm({ ...leadership });
                setIsEditingLeadership(!isEditingLeadership);
              }}
              className="flex items-center gap-2 bg-white hover:bg-brand-gold/10 text-stone-700 hover:text-brand-navy border border-stone-250 hover:border-brand-gold/30 px-3.5 py-1.8 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5 text-brand-gold" />
              {isEditingLeadership 
                ? (lang === 'bn' ? 'সম্পাদনা প্যানেল বন্ধ করুন' : 'Close Editor Panel') 
                : (lang === 'bn' ? 'নেতৃত্ব তথ্য পরিবর্তন করুন' : 'Edit Leadership Info')
              }
            </button>
          </div>

          {/* EDITING INTERACTIVE FORM PANEL */}
          {isEditingLeadership && (
            <div className="mb-10 bg-white border border-brand-gold/20 rounded-2xl p-6 shadow-xl animate-fade-in">
              <h3 className="text-stone-900 font-black text-sm uppercase tracking-wider border-b border-stone-150 pb-2 mb-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                {lang === 'bn' ? 'নেতৃত্ব বিবরণ ও ছবি এডিট ড্যাশবোর্ড' : 'Live Executive Copywriter Console'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                {/* CEO inputs */}
                <div className="space-y-3.5 pb-6 md:pb-0">
                  <span className="bg-brand-gold/10 text-brand-navy text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider block w-fit">
                    {lang === 'bn' ? 'ফাউন্ডার ও সিইও ফিল্ডস' : 'FOUNDER & CEO COPY'}
                  </span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Full Name (English)</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full font-bold focus:bg-white focus:outline-none"
                      value={editLeaderForm.ceo.nameEn}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'nameEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">নাম (বাংলা)</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full font-bold focus:bg-white focus:outline-none"
                      value={editLeaderForm.ceo.nameBn}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'nameBn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Executive Title En</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full focus:bg-white focus:outline-none"
                      value={editLeaderForm.ceo.titleEn}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'titleEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">পদবী (বাংলা)</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full focus:bg-white focus:outline-none"
                      value={editLeaderForm.ceo.titleBn}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'titleBn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Portrait Image Photo URL</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full font-mono focus:bg-white focus:outline-none text-stone-605"
                      value={editLeaderForm.ceo.pic}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'pic', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Executive Statement Message (English)</label>
                    <textarea
                      rows={3}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full text-stone-700 focus:bg-white focus:outline-none"
                      value={editLeaderForm.ceo.textEn}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'textEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">নেতৃত্বের বার্তা (বাংলা)</label>
                    <textarea
                      rows={3}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full text-stone-700 focus:bg-white focus:outline-none"
                      value={editLeaderForm.ceo.textBn}
                      onChange={(e) => handleUpdateLeaderField('ceo', 'textBn', e.target.value)}
                    />
                  </div>
                </div>

                {/* MD inputs */}
                <div className="space-y-3.5 pt-6 md:pt-0 md:pl-8">
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider block w-fit">
                    {lang === 'bn' ? 'ম্যানেজিং ডিরেক্টর ফিল্ডস' : 'MANAGING DIRECTOR COPY'}
                  </span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Full Name (English)</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full font-bold focus:bg-white focus:outline-none"
                      value={editLeaderForm.md.nameEn}
                      onChange={(e) => handleUpdateLeaderField('md', 'nameEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">নাম (বাংলা)</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full font-bold focus:bg-white focus:outline-none"
                      value={editLeaderForm.md.nameBn}
                      onChange={(e) => handleUpdateLeaderField('md', 'nameBn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Executive Title En</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full focus:bg-white focus:outline-none"
                      value={editLeaderForm.md.titleEn}
                      onChange={(e) => handleUpdateLeaderField('md', 'titleEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">পদবী (বাংলা)</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full focus:bg-white focus:outline-none"
                      value={editLeaderForm.md.titleBn}
                      onChange={(e) => handleUpdateLeaderField('md', 'titleBn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Portrait Image Photo URL</label>
                    <input
                      type="text"
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full font-mono focus:bg-white focus:outline-none text-stone-605"
                      value={editLeaderForm.md.pic}
                      onChange={(e) => handleUpdateLeaderField('md', 'pic', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Executive Statement Message (English)</label>
                    <textarea
                      rows={3}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full text-stone-700 focus:bg-white focus:outline-none"
                      value={editLeaderForm.md.textEn}
                      onChange={(e) => handleUpdateLeaderField('md', 'textEn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">নেতৃত্বের বার্তা (বাংলা)</label>
                    <textarea
                      rows={3}
                      className="bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs w-full text-stone-700 focus:bg-white focus:outline-none"
                      value={editLeaderForm.md.textBn}
                      onChange={(e) => handleUpdateLeaderField('md', 'textBn', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 pt-5 border-t border-stone-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingLeadership(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase transition hover:scale-[1.01]"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveLeadership}
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow transition hover:scale-[1.01]"
                >
                  {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Apply Live Copy'}
                </button>
              </div>
            </div>
          )}

          {/* TWO EXECUTIVE PORTRAITS SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card 1: Founder & CEO */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
              {/* Portrait container image */}
              <div className="md:w-3/7 h-64 md:h-auto relative overflow-hidden bg-stone-100 flex-shrink-0">
                <img
                  src={leadership.ceo.pic}
                  alt={leadership.ceo.nameEn}
                  className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-amber-600 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm block w-fit mb-1">
                    {lang === 'bn' ? leadership.ceo.titleBn : leadership.ceo.titleEn}
                  </span>
                  <h4 className="font-extrabold text-sm tracking-tight">{lang === 'bn' ? leadership.ceo.nameBn : leadership.ceo.nameEn}</h4>
                </div>
              </div>

              {/* Text metadata quote */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Quote className="w-8 h-8 text-rose-500/15" />
                  <p className="text-stone-700 text-xs sm:text-[13px] leading-relaxed italic font-serif">
                    "{lang === 'bn' ? leadership.ceo.textBn : leadership.ceo.textEn}"
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                      {lang === 'bn' ? leadership.ceo.titleBn : leadership.ceo.titleEn}
                    </p>
                    <h5 className="font-black text-xs text-stone-900 truncate">
                      {lang === 'bn' ? leadership.ceo.nameBn : leadership.ceo.nameEn}
                    </h5>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-navy flex-shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Managing Director */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
              {/* Portrait container image */}
              <div className="md:w-3/7 h-64 md:h-auto relative overflow-hidden bg-stone-100 flex-shrink-0">
                <img
                  src={leadership.md.pic}
                  alt={leadership.md.nameEn}
                  className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-brand-navy/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-brand-gold text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm block w-fit mb-1">
                    {lang === 'bn' ? leadership.md.titleBn : leadership.md.titleEn}
                  </span>
                  <h4 className="font-extrabold text-sm tracking-tight">{lang === 'bn' ? leadership.md.nameBn : leadership.md.nameEn}</h4>
                </div>
              </div>

              {/* Text metadata quote */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Quote className="w-8 h-8 text-stone-400/15" />
                  <p className="text-stone-700 text-xs sm:text-[13px] leading-relaxed italic font-serif">
                    "{lang === 'bn' ? leadership.md.textBn : leadership.md.textEn}"
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                      {lang === 'bn' ? leadership.md.titleBn : leadership.md.titleEn}
                    </p>
                    <h5 className="font-black text-xs text-stone-900 truncate">
                      {lang === 'bn' ? leadership.md.nameBn : leadership.md.nameEn}
                    </h5>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 11. FOOTER BRAND STATEMENT */}
      <footer id="retail-footer" className="bg-stone-900 border-t border-stone-800 text-stone-400 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white content-center border border-stone-800 overflow-hidden flex items-center justify-center">
                <img
                  src={nusrahLogo}
                  alt="Nusrah Apparel Footer Logo"
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-white font-black uppercase text-sm sm:text-base tracking-widest leading-none">
                {lang === 'bn' ? 'নুসরাহ অ্যাপারেলস' : 'NUSRAH APPAREL'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed max-w-xs">
              {lang === 'bn' ? shopConfig.footerBioBn : shopConfig.footerBioEn}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold uppercase text-stone-200 tracking-wider text-[11px] sm:text-xs">
              {lang === 'bn' ? 'অফিসিয়াল অবস্থান' : 'Official Address'}
            </h4>
            <div className="space-y-1.5 text-[11px] sm:text-xs">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-gold mt-0.5 flex-shrink-0" /> 
                <span>
                  {lang === 'bn' ? shopConfig.addressBn : shopConfig.addressEn}
                </span>
              </p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-brand-gold" /> <a href={`mailto:${shopConfig.email}`} className="hover:underline hover:text-white">{shopConfig.email}</a></p>
              <p className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-brand-gold" /> {lang === 'bn' ? shopConfig.phoneBn : shopConfig.phoneEn}</p>
              <div className="flex gap-3 pt-2">
                <a href={shopConfig.facebookLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold transition-colors">Facebook Page</a>
                <a href={shopConfig.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold transition-colors">YouTube Channel</a>
                <a href={shopConfig.instagramLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-gold transition-colors">Instagram</a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-stone-200 tracking-wider text-[11px] sm:text-xs">
              {lang === 'bn' ? 'পার্টনারশিপ ও সিকিউরিটি' : 'Partnership & Security'}
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs">
              {lang === 'bn' 
                ? 'বিকাশ, নগদ, ভিসা সহ সকল বিশ্বমানের ও স্থানীয় ট্রাস্ট এগ্রিমেন্ট পার্টনার দ্বারা সিকিউরড।' 
                : 'Encrypted with SSL, partner certifications with high safety, direct COD capability, or Instant mobile settlement chains.'}
            </p>
            {/* Visual logos */}
            <div className="flex flex-wrap gap-2.5 items-center bg-stone-905 p-3 rounded-lg border border-stone-800/80 w-fit">
              <div className="group relative">
                <span className="text-[9px] font-black tracking-widest text-[#d946ef] bg-[#d946ef]/10 px-2 py-1 rounded cursor-help">bKash</span>
                <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible bg-stone-800 text-white p-2 rounded shadow-xl border border-stone-700 min-w-[120px] z-50">
                  <p className="text-[8px] font-bold text-stone-400 mb-1 uppercase tracking-tighter">bKash Numbers:</p>
                  {shopConfig.bkashNumbers.map((num: string) => (num && <p key={num} className="font-mono text-[9px]">{num}</p>))}
                </div>
              </div>
              <div className="group relative">
                <span className="text-[9px] font-black tracking-widest text-[#f97316] bg-[#f97316]/10 px-2 py-1 rounded cursor-help">Nagad</span>
                <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible bg-stone-800 text-white p-2 rounded shadow-xl border border-stone-700 min-w-[120px] z-50">
                  <p className="text-[8px] font-bold text-stone-400 mb-1 uppercase tracking-tighter">Nagad Numbers:</p>
                  {shopConfig.nagadNumbers.map((num: string) => (num && <p key={num} className="font-mono text-[9px]">{num}</p>))}
                </div>
              </div>
              <div className="group relative">
                <span className="text-[9px] font-black tracking-widest text-purple-400 bg-purple-400/10 px-2 py-1 rounded cursor-help">Rocket</span>
                <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible bg-stone-800 text-white p-2 rounded shadow-xl border border-stone-700 min-w-[120px] z-50">
                  <p className="text-[8px] font-bold text-stone-400 mb-1 uppercase tracking-tighter">Rocket Numbers:</p>
                  {shopConfig.rocketNumbers.map((num: string) => (num && <p key={num} className="font-mono text-[9px]">{num}</p>))}
                </div>
              </div>
              <span className="text-[9px] font-black tracking-widest text-stone-200 bg-stone-100/10 px-2.5 py-1 rounded">COD</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-800/85 mt-8 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-stone-500 gap-2.5">
          <p>© {new Date().getFullYear()} Nusrah Apparel. All Rights Reserved. Engineered with precision.</p>
          <div className="flex items-center gap-4">
            <a href="#nusrah-system-gate" className="hover:text-amber-500 transition-all cursor-pointer">Admin</a>
            <p className="flex items-center gap-2">
              <span>Powered by</span>
              <span className="text-white font-black text-rose-500">VELOCITYTECH</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
