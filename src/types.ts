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
