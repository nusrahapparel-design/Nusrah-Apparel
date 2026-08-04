export interface ColorOption {
  name: string;
  class: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  tags: string[];
  sizes?: string[];
  colors: ColorOption[];
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  stock: number;
  subCategory?: string;
  bnName?: string;
  bnDescription?: string;
  specifications?: string;
  costPrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: ColorOption | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  orderId: string;
  amount: number;
  itemsSummary: string;
}

export interface RedemptionRequest {
  id: string;
  points: number;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface LoyaltyCustomer {
  slNo: number;
  clientId: string;
  userName: string;
  clientName: string;
  address: string;
  mobileNumber: string;
  pin: string;
  totalShopping: number;
  totalAwardPoint: number;
  redeemedAwardPoint: number;
  availableAwardPoint: number;
  registrationDate: string;
  status: 'Active' | 'VIP' | 'Inactive';
  purchases: PurchaseRecord[];
  redemptionRequests: RedemptionRequest[];
}
