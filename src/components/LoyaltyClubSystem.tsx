import React, { useState, useEffect } from 'react';
import {
  Award,
  Users,
  UserPlus,
  LogIn,
  LogOut,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Check,
  AlertCircle,
  Lock,
  Sparkles
} from 'lucide-react';
import { LoyaltyCustomer, PurchaseRecord, RedemptionRequest } from '../types';

interface LoyaltyClubSystemProps {
  lang: 'bn' | 'en';
}

const INITIAL_CUSTOMERS: LoyaltyCustomer[] = [
  {
    slNo: 1,
    clientId: 'NA-CL-1001',
    userName: 'rahim_bd',
    clientName: 'Md. Rahim Uddin',
    address: 'House 12, Road 5, Uttara, Dhaka',
    mobileNumber: '01712345678',
    pin: '1234',
    totalShopping: 12500,
    totalAwardPoint: 625, // 12500 * 5% = 625
    redeemedAwardPoint: 100,
    availableAwardPoint: 525,
    registrationDate: '2026-06-15',
    status: 'VIP',
    purchases: [
      { id: 'p-1', date: '2026-06-20', orderId: 'ORD-8801', amount: 7500, itemsSummary: 'Premium Cotton Punjabi (2x)' },
      { id: 'p-2', date: '2026-07-10', orderId: 'ORD-9104', amount: 5000, itemsSummary: 'Soft-Silk Jamdani Saree (1x)' }
    ],
    redemptionRequests: [
      { id: 'r-1', points: 100, requestDate: '2026-07-12', status: 'Approved' }
    ]
  },
  {
    slNo: 2,
    clientId: 'NA-CL-1002',
    userName: 'nusrat_jahan',
    clientName: 'Nusrat Jahan',
    address: 'Moricha Bazar, Ukhiya, Cox\'s Bazar',
    mobileNumber: '01851282847',
    pin: '1234',
    totalShopping: 24000,
    totalAwardPoint: 1200, // 24000 * 5% = 1200
    redeemedAwardPoint: 500,
    availableAwardPoint: 700,
    registrationDate: '2026-06-18',
    status: 'VIP',
    purchases: [
      { id: 'p-3', date: '2026-06-25', orderId: 'ORD-8899', amount: 14000, itemsSummary: 'Bridal Saree & Cosmetics Set' },
      { id: 'p-4', date: '2026-07-02', orderId: 'ORD-9021', amount: 10000, itemsSummary: 'Smart Polos & Gadgets' }
    ],
    redemptionRequests: [
      { id: 'r-2', points: 500, requestDate: '2026-07-05', status: 'Approved' }
    ]
  },
  {
    slNo: 3,
    clientId: 'NA-CL-1003',
    userName: 'kamal_hossain',
    clientName: 'Kamal Hossain',
    address: 'GEC Circle, Chattogram',
    mobileNumber: '01911998877',
    pin: '1234',
    totalShopping: 3500,
    totalAwardPoint: 175, // 3500 * 5% = 175
    redeemedAwardPoint: 0,
    availableAwardPoint: 175,
    registrationDate: '2026-07-28',
    status: 'Active',
    purchases: [
      { id: 'p-5', date: '2026-07-28', orderId: 'ORD-9512', amount: 3500, itemsSummary: 'Honeycomb Polo Shirt' }
    ],
    redemptionRequests: []
  }
];

export default function LoyaltyClubSystem({ lang }: LoyaltyClubSystemProps) {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>(() => {
    const saved = localStorage.getItem('nusrah_loyalty_customers_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CUSTOMERS;
  });

  useEffect(() => {
    localStorage.setItem('nusrah_loyalty_customers_v1', JSON.stringify(customers));
  }, [customers]);

  const [activeTab, setActiveTab] = useState<'portal' | 'register' | 'admin' | 'guide'>('portal');

  const [loginId, setLoginId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loggedInCustomer, setLoggedInCustomer] = useState<LoyaltyCustomer | null>(null);

  const [regUserName, setRegUserName] = useState('');
  const [regClientName, setRegClientName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPin, setRegPin] = useState('');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddShoppingModalOpen, setIsAddShoppingModalOpen] = useState(false);
  const [shoppingAmountToAdd, setShoppingAmountToAdd] = useState('');
  const [shoppingItemsDesc, setShoppingItemsDesc] = useState('');
  const [targetCustomerIdForShopping, setTargetCustomerIdForShopping] = useState('');
  
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [pointActionType, setPointActionType] = useState<'add' | 'deduct'>('add');
  const [pointAmountValue, setPointAmountValue] = useState('');
  const [pointReason, setPointReason] = useState('');
  const [targetCustomerForPoints, setTargetCustomerForPoints] = useState<LoyaltyCustomer | null>(null);

  const [redeemPointsAmount, setRedeemPointsAmount] = useState('');

  const generateNewClientId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `NA-CL-${randomNum}`;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regClientName.trim() || !regMobile.trim() || !regPin.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে নাম, মোবাইল নম্বর এবং পিন পূরণ করুন।' : 'Please fill in Name, Mobile Number, and PIN.');
      return;
    }

    const newClientId = generateNewClientId();
    const newCustomer: LoyaltyCustomer = {
      slNo: customers.length + 1,
      clientId: newClientId,
      userName: regUserName.trim() || regClientName.toLowerCase().replace(/\s+/g, '_'),
      clientName: regClientName,
      address: regAddress || 'Bangladesh',
      mobileNumber: regMobile,
      pin: regPin,
      totalShopping: 0,
      totalAwardPoint: 0,
      redeemedAwardPoint: 0,
      availableAwardPoint: 0,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      purchases: [],
      redemptionRequests: []
    };

    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    setLoggedInCustomer(newCustomer);
    setActiveTab('portal');
    alert(lang === 'bn' 
      ? `সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে! আপনার ক্লায়েন্ট আইডি: ${newClientId}` 
      : `Registration successful! Your Client ID is: ${newClientId}`);
    
    setRegUserName('');
    setRegClientName('');
    setRegAddress('');
    setRegMobile('');
    setRegPin('');
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = customers.find(
      c => (c.clientId.toLowerCase() === loginId.trim().toLowerCase() || c.mobileNumber === loginId.trim()) && c.pin === loginPin.trim()
    );
    if (found) {
      setLoggedInCustomer(found);
      setLoginId('');
      setLoginPin('');
    } else {
      alert(lang === 'bn' ? 'ভুল ক্লায়েন্ট আইডি / মোবাইল নম্বর অথবা পিন!' : 'Invalid Client ID / Mobile Number or PIN!');
    }
  };

  const handleRequestRedemption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInCustomer) return;
    const pts = parseInt(redeemPointsAmount, 10);
    if (isNaN(pts) || pts <= 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে সঠিক পয়েন্ট পরিমাণ লিখুন।' : 'Please enter a valid point amount.');
      return;
    }
    if (pts > loggedInCustomer.availableAwardPoint) {
      alert(lang === 'bn' ? 'আপনার উপলব্ধ পয়েন্টের চেয়ে বেশি পয়েন্ট রিডিম করতে পারবেন না।' : 'You cannot redeem more than your available point balance.');
      return;
    }

    const newReq: RedemptionRequest = {
      id: `req-${Date.now()}`,
      points: pts,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    const updatedCustomer: LoyaltyCustomer = {
      ...loggedInCustomer,
      redemptionRequests: [newReq, ...loggedInCustomer.redemptionRequests]
    };

    const updatedList = customers.map(c => c.clientId === updatedCustomer.clientId ? updatedCustomer : c);
    setCustomers(updatedList);
    setLoggedInCustomer(updatedCustomer);
    setRedeemPointsAmount('');
    alert(lang === 'bn' ? 'পয়েন্ট রিডেম্পশন অনুরোধ সফলভাবে জমা দেওয়া হয়েছে!' : 'Redemption request submitted successfully!');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === 'Nascox123@1' || adminPinInput === '1234') {
      setIsAdminLoggedIn(true);
      setAdminPinInput('');
    } else {
      alert(lang === 'bn' ? 'ভুল অ্যাডমিন সিকিউরিটি কোড।' : 'Incorrect Admin Security Code.');
    }
  };

  const handleAdminAddShopping = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(shoppingAmountToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে সঠিক কেনাকাটার পরিমাণ লিখুন।' : 'Please enter a valid shopping amount.');
      return;
    }

    const targetCust = customers.find(c => c.clientId === targetCustomerIdForShopping);
    if (!targetCust) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে একজন গ্রাহক নির্বাচন করুন।' : 'Please select a customer.');
      return;
    }

    const earnedPoints = Math.floor(amount * 0.05); // 5% points formula
    const newPurchase: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amount,
      itemsSummary: shoppingItemsDesc.trim() || 'Retail Purchase / Custom Order'
    };

    const updatedShopping = targetCust.totalShopping + amount;
    const updatedTotalPoints = targetCust.totalAwardPoint + earnedPoints;
    const updatedAvailable = updatedTotalPoints - targetCust.redeemedAwardPoint;

    const updatedCust: LoyaltyCustomer = {
      ...targetCust,
      totalShopping: updatedShopping,
      totalAwardPoint: updatedTotalPoints,
      availableAwardPoint: Math.max(0, updatedAvailable),
      purchases: [newPurchase, ...targetCust.purchases]
    };

    const updatedList = customers.map(c => c.clientId === updatedCust.clientId ? updatedCust : c);
    setCustomers(updatedList);
    if (loggedInCustomer && loggedInCustomer.clientId === updatedCust.clientId) {
      setLoggedInCustomer(updatedCust);
    }

    setIsAddShoppingModalOpen(false);
    setShoppingAmountToAdd('');
    setShoppingItemsDesc('');
    setTargetCustomerIdForShopping('');
    alert(lang === 'bn' 
      ? `সফলভাবে ৳${amount} কেনাকাটা যোগ করা হয়েছে এবং স্বয়ংক্রিয়ভাবে ${earnedPoints} লয়্যালটি পয়েন্ট যোগ করা হয়েছে!` 
      : `Successfully added ৳${amount} purchase and automatically credited ${earnedPoints} loyalty points!`);
  };

  const handleAdminPointAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomerForPoints) return;
    const pts = parseInt(pointAmountValue, 10);
    if (isNaN(pts) || pts <= 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে সঠিক পয়েন্ট লিখুন।' : 'Please enter valid points.');
      return;
    }

    let newTotalAward = targetCustomerForPoints.totalAwardPoint;
    let newRedeemed = targetCustomerForPoints.redeemedAwardPoint;

    if (pointActionType === 'add') {
      newTotalAward += pts;
    } else {
      newRedeemed += pts;
    }

    const newAvailable = newTotalAward - newRedeemed;

    const updatedCust: LoyaltyCustomer = {
      ...targetCustomerForPoints,
      totalAwardPoint: newTotalAward,
      redeemedAwardPoint: newRedeemed,
      availableAwardPoint: Math.max(0, newAvailable)
    };

    const updatedList = customers.map(c => c.clientId === updatedCust.clientId ? updatedCust : c);
    setCustomers(updatedList);
    if (loggedInCustomer && loggedInCustomer.clientId === updatedCust.clientId) {
      setLoggedInCustomer(updatedCust);
    }

    setIsPointModalOpen(false);
    setPointAmountValue('');
    setPointReason('');
    setTargetCustomerForPoints(null);
    alert(lang === 'bn' ? 'পয়েন্ট সফলভাবে আপডেট করা হয়েছে!' : 'Points updated successfully!');
  };

  const handleReviewRedemption = (custClientId: string, reqId: string, approve: boolean) => {
    const cust = customers.find(c => c.clientId === custClientId);
    if (!cust) return;

    const req = cust.redemptionRequests.find(r => r.id === reqId);
    if (!req || req.status !== 'Pending') return;

    const updatedRequests = cust.redemptionRequests.map(r => r.id === reqId ? { ...r, status: (approve ? 'Approved' : 'Rejected') as ('Approved' | 'Rejected') } : r);
    
    let newRedeemed = cust.redeemedAwardPoint;
    let newAvailable = cust.availableAwardPoint;

    if (approve) {
      newRedeemed += req.points;
      newAvailable = Math.max(0, cust.totalAwardPoint - newRedeemed);
    }

    const updatedCust: LoyaltyCustomer = {
      ...cust,
      redeemedAwardPoint: newRedeemed,
      availableAwardPoint: newAvailable,
      redemptionRequests: updatedRequests
    };

    const updatedList = customers.map(c => c.clientId === updatedCust.clientId ? updatedCust : c);
    setCustomers(updatedList);
    if (loggedInCustomer && loggedInCustomer.clientId === updatedCust.clientId) {
      setLoggedInCustomer(updatedCust);
    }
  };

  const handleDeleteCustomer = (clientId: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই গ্রাহককে ডিলিট করতে চান?' : 'Are you sure you want to delete this customer?')) {
      const updated = customers.filter(c => c.clientId !== clientId);
      setCustomers(updated);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobileNumber.includes(searchTerm)
  );

  const totalSystemShopping = customers.reduce((sum, c) => sum + c.totalShopping, 0);
  const totalSystemPoints = customers.reduce((sum, c) => sum + c.totalAwardPoint, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                {lang === 'bn' ? 'কাস্টমার লয়্যালটি ও রিওয়ার্ড ক্লাব' : 'VIP Loyalty & Reward Club'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Nusrah Apparel Loyalty Portal
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                {lang === 'bn' 
                  ? 'প্রতি ১০০ টাকা কেনাকাটায় ৫% লয়্যালটি পয়েন্ট অর্জন করুন এবং আকর্ষণীয় ডিসকাউন্ট রিডিম করুন।' 
                  : 'Earn 5% loyalty award points on every BDT shopping and redeem exclusive rewards instantly.'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'কাস্টমার পোর্টাল ও লগইন' : 'Customer Portal'}</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন রেজিস্ট্রেশন' : 'Register Now'}</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{lang === 'bn' ? 'গুগল শিট ও নো-কোড গাইড' : 'No-Code Guide'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CUSTOMER PORTAL / DASHBOARD */}
        {activeTab === 'portal' && (
          <div className="space-y-6">
            {!loggedInCustomer ? (
              <div className="max-w-md mx-auto bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 mx-auto border border-amber-500/20">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    {lang === 'bn' ? 'লয়্যালটি অ্যাকাউন্ট লগইন' : 'Customer Loyalty Login'}
                  </h2>
                  <p className="text-xs text-stone-400">
                    {lang === 'bn' ? 'আপনার ক্লায়েন্ট আইডি বা মোবাইল নম্বর এবং পিন দিয়ে প্রবেশ করুন।' : 'Enter your Client ID or Mobile Number and PIN to view your rewards.'}
                  </p>
                </div>

                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      {lang === 'bn' ? 'ক্লায়েন্ট আইডি বা মোবাইল নম্বর' : 'Client ID or Mobile Number'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NA-CL-1001 or 01712345678"
                      value={loginId}
                      onChange={e => setLoginId(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">
                      {lang === 'bn' ? 'পিন (PIN)' : 'Security PIN'}
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={loginPin}
                      onChange={e => setLoginPin(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-stone-800">
                  <p className="text-xs text-stone-400">
                    {lang === 'bn' ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      {lang === 'bn' ? 'ফ্রিতে রেজিস্ট্রেশন করুন' : 'Register for free'}
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* LOGGED IN DASHBOARD */
              <div className="space-y-6">
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 text-stone-950 rounded-2xl font-black text-xl flex items-center justify-center shadow-lg">
                      {loggedInCustomer.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold border border-amber-500/20">
                          {loggedInCustomer.clientId}
                        </span>
                        <span className="text-[10px] font-bold bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                          {loggedInCustomer.status} Member
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white mt-1">{loggedInCustomer.clientName}</h2>
                      <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" /> {loggedInCustomer.mobileNumber} | 
                        <MapPin className="w-3.5 h-3.5 text-amber-500 ml-1" /> {loggedInCustomer.address}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setLoggedInCustomer(null)}
                    className="px-4 py-2 bg-stone-800 hover:bg-red-500/20 hover:text-red-400 text-stone-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-stone-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                  </button>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-amber-500/10"><ShoppingBag className="w-12 h-12" /></div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'মোট কেনাকাটা (Total Shopping)' : 'Total Shopping Amount'}
                    </p>
                    <h3 className="text-2xl font-black text-white mt-2">৳{loggedInCustomer.totalShopping.toLocaleString()}</h3>
                    <p className="text-[10px] text-stone-500 mt-1">
                      {lang === 'bn' ? 'সফল রেজিস্টার্ড পারচেজ' : 'Lifetime completed orders'}
                    </p>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-emerald-500/10"><TrendingUp className="w-12 h-12" /></div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'মোট অর্জিত পয়েন্ট (Total Points)' : 'Total Award Points'}
                    </p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{loggedInCustomer.totalAwardPoint} pts</h3>
                    <p className="text-[10px] text-stone-500 mt-1">
                      {lang === 'bn' ? '৫% লয়্যালটি ক্যালকুলেশন ফর্মুলা অনুযায়ী' : 'Calculated @ 5% of purchases'}
                    </p>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-blue-500/10"><Gift className="w-12 h-12" /></div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'রিডিম করা পয়েন্ট (Redeemed)' : 'Redeemed Points'}
                    </p>
                    <h3 className="text-2xl font-black text-blue-400 mt-2">{loggedInCustomer.redeemedAwardPoint} pts</h3>
                    <p className="text-[10px] text-stone-500 mt-1">
                      {lang === 'bn' ? 'পূর্বে সফলভাবে উত্তোলিত' : 'Successfully withdrawn/redeemed'}
                    </p>
                  </div>

                  <div className="bg-stone-900 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br from-stone-900 to-amber-950/20">
                    <div className="absolute top-0 right-0 p-4 text-amber-500/20"><Award className="w-12 h-12" /></div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'উপলব্ধ ব্যালেন্স (Available Points)' : 'Available Point Balance'}
                    </p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{loggedInCustomer.availableAwardPoint} pts</h3>
                    <p className="text-[10px] text-amber-300/80 mt-1">
                      {lang === 'bn' ? 'রিডিম করার জন্য প্রস্তুত' : 'Ready for instant reward redemption'}
                    </p>
                  </div>
                </div>

                {/* Redemption Request Section & Purchase History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Redeem points card */}
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-sm">
                          {lang === 'bn' ? 'পয়েন্ট রিডেম্পশন অনুরোধ' : 'Request Point Redemption'}
                        </h3>
                        <p className="text-[11px] text-stone-400">
                          {lang === 'bn' ? 'পয়েন্ট ক্যাশব্যাক বা ডিসকাউন্টে রূপান্তর করুন' : 'Convert points to cashback or discount'}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleRequestRedemption} className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">
                          {lang === 'bn' ? 'রিডিম করার জন্য পয়েন্ট সংখ্যা' : 'Points to Redeem'}
                        </label>
                        <input
                          type="number"
                          max={loggedInCustomer.availableAwardPoint}
                          min={10}
                          required
                          placeholder="e.g. 100"
                          value={redeemPointsAmount}
                          onChange={e => setRedeemPointsAmount(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">
                          {lang === 'bn' ? `সর্বোচ্চ উপলব্ধ: ${loggedInCustomer.availableAwardPoint} পয়েন্ট` : `Max available: ${loggedInCustomer.availableAwardPoint} pts`}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loggedInCustomer.availableAwardPoint <= 0}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-lg"
                      >
                        {lang === 'bn' ? 'রিডেম্পশন অনুরোধ পাঠান' : 'Submit Redemption Request'}
                      </button>
                    </form>

                    {/* Pending Requests List */}
                    {loggedInCustomer.redemptionRequests.length > 0 && (
                      <div className="border-t border-stone-800 pt-4 space-y-2">
                        <h4 className="text-[11px] font-bold uppercase text-stone-400 tracking-wider">
                          {lang === 'bn' ? 'রিডেম্পশন ইতিহাস ও স্ট্যাটাস' : 'Redemption History'}
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {loggedInCustomer.redemptionRequests.map(req => (
                            <div key={req.id} className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white">{req.points} Points</span>
                                <span className="text-[10px] text-stone-500 block">{req.requestDate}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                req.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purchase History */}
                  <div className="lg:col-span-2 bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-sm">
                            {lang === 'bn' ? 'কেনাকাটার ইতিহাস (Purchase History)' : 'Purchase History & Point Earnings'}
                          </h3>
                          <p className="text-[11px] text-stone-400">
                            {lang === 'bn' ? 'প্রতিটি অর্ডারে ৫% লয়্যালটি পয়েন্ট অর্জিত হয়েছে' : 'Earned 5% reward points on every transaction'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {loggedInCustomer.purchases.length === 0 ? (
                      <div className="text-center py-10 text-stone-500 text-xs">
                        {lang === 'bn' ? 'কোনো কেনাকাটার রেকর্ড পাওয়া যায়নি।' : 'No purchase records found yet.'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[10px]">
                            <tr>
                              <th className="p-3">Order ID</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Items</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3 text-right">Points Earned (5%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800 font-medium">
                            {loggedInCustomer.purchases.map(pur => (
                              <tr key={pur.id} className="hover:bg-stone-850/50">
                                <td className="p-3 font-mono font-bold text-amber-400">{pur.orderId}</td>
                                <td className="p-3 text-stone-400">{pur.date}</td>
                                <td className="p-3 text-stone-200">{pur.itemsSummary}</td>
                                <td className="p-3 font-bold text-white">৳{pur.amount.toLocaleString()}</td>
                                <td className="p-3 text-right font-bold text-emerald-400">+{Math.floor(pur.amount * 0.05)} pts</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOMER REGISTRATION FORM */}
        {activeTab === 'register' && (
          <div className="max-w-xl mx-auto bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 mx-auto border border-amber-500/20">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {lang === 'bn' ? 'নতুন কাস্টমার লয়্যালটি রেজিস্ট্রেশন ফর্ম' : 'Customer Registration Form'}
              </h2>
              <p className="text-xs text-stone-400">
                {lang === 'bn' ? 'রেজিস্ট্রেশনের সাথে সাথেই আপনার জন্য ইউনিক ক্লায়েন্ট আইডি স্বয়ংক্রিয়ভাবে তৈরি হবে।' : 'Register to get your auto-generated Client ID and start earning 5% loyalty award points.'}
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  {lang === 'bn' ? 'পূর্ণ নাম (Client Name) *' : 'Client Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asma Ul Hosna"
                  value={regClientName}
                  onChange={e => setRegClientName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    {lang === 'bn' ? 'ইউজার নাম (User Name)' : 'User Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. asma_apparel"
                    value={regUserName}
                    onChange={e => setRegUserName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর (Mobile Number) *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01851282847"
                    value={regMobile}
                    onChange={e => setRegMobile(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  {lang === 'bn' ? 'ঠিকানা (Address)' : 'Complete Address'}
                </label>
                <textarea
                  rows={2}
                  placeholder="House, Road, Area, City"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  {lang === 'bn' ? 'লগইন পিন (4 Digit PIN) *' : 'Security PIN (4 Digits) *'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="1234"
                  value={regPin}
                  onChange={e => setRegPin(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <p className="font-bold text-amber-400">💡 Loyalty Rule Notice:</p>
                <p>{lang === 'bn' ? 'প্রতি ১০০ টাকা কেনাকাটায় ৫% (৳১০০ = ৫ পয়েন্ট) স্বয়ংক্রিয়ভাবে আপনার অ্যাকাউন্টে জমা হবে।' : 'Every 100 BDT shopping automatically calculates and credits 5 Award Points (Total Shopping × 5%).'}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-xl cursor-pointer"
              >
                {lang === 'bn' ? 'রেজিস্ট্রেশন সম্পূর্ণ করুন' : 'Complete Registration'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 mx-auto border border-amber-500/20">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি গেট' : 'Admin Authorization'}
                  </h2>
                  <p className="text-xs text-stone-400">
                    {lang === 'bn' ? 'গ্রাহক ব্যবস্থাপনা ও পয়েন্ট কন্ট্রোলের জন্য অ্যাডমিন পিন লিখুন (পিন: 1234 বা Nascox123@1)' : 'Enter admin security code to access customer records and point controls.'}
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Admin Security Code"
                      value={adminPinInput}
                      onChange={e => setAdminPinInput(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড খুলুন' : 'Access Admin Dashboard'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Top Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-stone-400 uppercase">
                      {lang === 'bn' ? 'মোট গ্রাহক সংখ্যা' : 'Total Registered Customers'}
                    </p>
                    <h3 className="text-2xl font-black text-white mt-2">{customers.length}</h3>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-stone-400 uppercase">
                      {lang === 'bn' ? 'মোট বিজনেস কেনাকাটা' : 'Total Business Revenue'}
                    </p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">৳{totalSystemShopping.toLocaleString()}</h3>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-stone-400 uppercase">
                      {lang === 'bn' ? 'মোট ইস্যুকৃত পয়েন্ট' : 'Total Award Points Issued'}
                    </p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{totalSystemPoints} pts</h3>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase">
                        {lang === 'bn' ? 'অ্যাকশন কন্ট্রোল' : 'Quick Actions'}
                      </p>
                      <button
                        onClick={() => {
                          setTargetCustomerIdForShopping(customers[0]?.clientId || '');
                          setIsAddShoppingModalOpen(true);
                        }}
                        className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'কেনাকাটা ও পয়েন্ট যোগ করুন' : 'Add Shopping & Points'}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setIsAdminLoggedIn(false)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-red-500/20 text-stone-300 rounded-lg text-xs font-bold transition-all"
                    >
                      Lock Admin
                    </button>
                  </div>
                </div>

                {/* Customer Records Database Table */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-white text-base">
                        {lang === 'bn' ? 'গ্রাহক ডাটাবেস ও লয়্যালটি টেবিল' : 'Customer Database Table'}
                      </h3>
                      <p className="text-xs text-stone-400">
                        {lang === 'bn' ? 'সকল রেজিস্টার্ড কাস্টমার ও তাদের পয়েন্ট হিস্ট্রি' : 'Full records matching database schema requirements'}
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        placeholder="Search by name, ID, phone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">SL</th>
                          <th className="p-3">Client ID</th>
                          <th className="p-3">Client Name</th>
                          <th className="p-3">Mobile</th>
                          <th className="p-3">Address</th>
                          <th className="p-3">Total Shopping</th>
                          <th className="p-3">Award Pts</th>
                          <th className="p-3">Redeemed</th>
                          <th className="p-3">Available</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800 font-medium">
                        {filteredCustomers.map((c, index) => (
                          <tr key={c.clientId} className="hover:bg-stone-850/50">
                            <td className="p-3 font-mono text-stone-500">{index + 1}</td>
                            <td className="p-3 font-mono font-bold text-amber-400">{c.clientId}</td>
                            <td className="p-3 font-bold text-white">{c.clientName}</td>
                            <td className="p-3 font-mono text-stone-300">{c.mobileNumber}</td>
                            <td className="p-3 text-stone-400 truncate max-w-xs">{c.address}</td>
                            <td className="p-3 font-bold text-white">৳{c.totalShopping.toLocaleString()}</td>
                            <td className="p-3 font-bold text-emerald-400">{c.totalAwardPoint}</td>
                            <td className="p-3 text-blue-400">{c.redeemedAwardPoint}</td>
                            <td className="p-3 font-extrabold text-amber-400">{c.availableAwardPoint}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === 'VIP' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-stone-800 text-stone-300'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setTargetCustomerForPoints(c);
                                  setPointActionType('add');
                                  setIsPointModalOpen(true);
                                }}
                                title="Add Bonus Points"
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold cursor-pointer"
                              >
                                +Pts
                              </button>
                              <button
                                onClick={() => {
                                  setTargetCustomerIdForShopping(c.clientId);
                                  setIsAddShoppingModalOpen(true);
                                }}
                                title="Add Shopping Amount"
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold cursor-pointer"
                              >
                                +Shop
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(c.clientId)}
                                title="Delete Customer"
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[10px] font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pending Redemption Approvals Section */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
                  <h3 className="font-extrabold text-white text-base">
                    {lang === 'bn' ? 'পেন্ডিং রিডেম্পশন অনুরোধ ও অনুমোদন' : 'Pending Point Redemption Requests'}
                  </h3>

                  {customers.flatMap(c => c.redemptionRequests.filter(r => r.status === 'Pending').map(r => ({ ...r, customerName: c.clientName, customerId: c.clientId }))).length === 0 ? (
                    <p className="text-xs text-stone-500">
                      {lang === 'bn' ? 'কোনো পেন্ডিং রিডেম্পশন অনুরোধ নেই।' : 'No pending redemption requests at the moment.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customers.flatMap(c => c.redemptionRequests.filter(r => r.status === 'Pending').map(r => ({ ...r, customerName: c.clientName, customerId: c.clientId }))).map(req => (
                        <div key={req.id} className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{req.customerName}</span>
                              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{req.customerId}</span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1">
                              Wants to redeem <span className="font-bold text-emerald-400">{req.points} Points</span> on {req.requestDate}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewRedemption(req.customerId, req.id, true)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReviewRedemption(req.customerId, req.id, false)}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GOOGLE SHEETS & APPSHEET / GLIDE NO-CODE GUIDE */}
        {activeTab === 'guide' && (
          <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Free No-Code Blueprint
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Google Sheets + AppSheet / Glide Integration Guide
                </h2>
                <p className="text-xs text-stone-400">
                  {lang === 'bn' ? 'সম্পূর্ণ ফ্রিতে গুগল শিট ব্যাকএন্ড এবং মোবাইল অ্যাপ তৈরি করার সহজ নির্দেশিকা।' : 'Step-by-step instructions to deploy this exact loyalty system using Google Sheets and AppSheet or Glide.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">1</div>
                <h3 className="font-bold text-white text-sm">Google Sheets Setup</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Create a Google Sheet with columns: <span className="font-mono text-amber-400">SL No, Client ID, Client Name, Address, Mobile Number, Total Shopping, Total Award Point, Redeemed Award Point, Available Award Point, Registration Date, Status</span>.
                </p>
              </div>

              <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">2</div>
                <h3 className="font-bold text-white text-sm">AppSheet / Glide Connection</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Log in to <a href="https://www.appsheet.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">AppSheet.com</a> or <a href="https://www.glideapps.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">GlideApps.com</a> for free. Connect your Google Sheet as the primary database source.
                </p>
              </div>

              <div className="bg-stone-950 p-6 rounded-xl border border-stone-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">3</div>
                <h3 className="font-bold text-white text-sm">Automate 5% Points Formula</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  In your Google Sheet formula cell for Total Award Point, use: <code className="text-emerald-400 font-mono text-[10px] bg-stone-900 px-1 py-0.5 rounded block mt-1">=F2*0.05</code> (where F is Total Shopping).
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-900 p-5 rounded-xl border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Need Immediate Web Deployment?</h4>
                <p className="text-xs text-stone-300">
                  {lang === 'bn' ? 'আমাদের এই প্ল্যাটফর্মেই আপনি ফুল-স্ট্যাক ও ক্লাউড ডাটাবেস সুবিধা উপভোগ করছেন।' : 'This web application is fully ready and operational with instant client state and persistent browser storage.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('portal')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-lg cursor-pointer"
              >
                Launch Portal
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD SHOPPING & AUTOMATIC POINTS */}
      {isAddShoppingModalOpen && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 max-w-md w-full p-6 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base">
              {lang === 'bn' ? 'কেনাকাটা যোগ করুন ও ৫% লয়্যালটি পয়েন্ট ক্রেডিট করুন' : 'Add Shopping & Credit 5% Points'}
            </h3>

            <form onSubmit={handleAdminAddShopping} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Select Customer</label>
                <select
                  value={targetCustomerIdForShopping}
                  onChange={e => setTargetCustomerIdForShopping(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white"
                >
                  {customers.map(c => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.clientName} ({c.clientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Shopping Amount (BDT)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={shoppingAmountToAdd}
                  onChange={e => setShoppingAmountToAdd(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white font-mono"
                />
                <p className="text-[10px] text-emerald-400 mt-1">
                  ✨ Automatic Award Points: {shoppingAmountToAdd ? Math.floor(parseFloat(shoppingAmountToAdd || '0') * 0.05) : 0} pts (5% formula)
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Items / Order Description</label>
                <input
                  type="text"
                  placeholder="e.g. Jamdani Saree & Punjabi"
                  value={shoppingItemsDesc}
                  onChange={e => setShoppingItemsDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddShoppingModalOpen(false)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Save & Credit Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POINT BONUS / DEDUCTION */}
      {isPointModalOpen && targetCustomerForPoints && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 max-w-md w-full p-6 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base">
              {lang === 'bn' ? `পয়েন্ট ম্যানেজ করুন: ${targetCustomerForPoints.clientName}` : `Manage Points for ${targetCustomerForPoints.clientName}`}
            </h3>

            <form onSubmit={handleAdminPointAdjustment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Action Type</label>
                <select
                  value={pointActionType}
                  onChange={e => setPointActionType(e.target.value as 'add' | 'deduct')}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white"
                >
                  <option value="add">Add Bonus Points (+)</option>
                  <option value="deduct">Deduct / Redeem Points (-)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Points Value</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50"
                  value={pointAmountValue}
                  onChange={e => setPointAmountValue(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Eid Festival Bonus"
                  value={pointReason}
                  onChange={e => setPointReason(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPointModalOpen(false)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Apply Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
