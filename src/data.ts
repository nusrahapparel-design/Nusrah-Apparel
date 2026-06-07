import { Product, Review } from './types';

export interface CategoryData {
  id: string;
  name: string;      // English
  bnName: string;    // Bangla
  slug: string;
  image: string;
  description: string;
  bnDescription: string;
  subCategories: { name: string; bnName: string }[];
}

export const CATEGORIES: CategoryData[] = [
  {
    id: 'c1',
    name: "Men's Wear",
    bnName: "মেনস ওয়্যার",
    slug: "mens-fashion",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    description: "Premium shirts, trousers, traditional Panjabis, and comfortable essentials.",
    bnDescription: "টপ-গ্রেড শার্ট, প্যান্ট, রাজকীয় পাঞ্জাবি এবং সেরা মানের অন্তর্বাস সংগ্রহ।",
    subCategories: [
      { name: "T-Shirt", bnName: "টি-শার্ট" },
      { name: "Shirt", bnName: "শার্ট" },
      { name: "Pant", bnName: "প্যান্ট" },
      { name: "Panjabi", bnName: "পাঞ্জাবি" },
      { name: "Undergarments", bnName: "অন্তর্বাস" }
    ]
  },
  {
    id: 'c2',
    name: "Women's Wear",
    bnName: "উইমেনস ওয়্যার",
    slug: "womens-fashion",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
    description: "Elegant silk Jamdani Sarees, designer three-pieces, trendy Kurtis, and innerwears.",
    bnDescription: "এক্সক্লুসিভ সিল্ক জামদানি শাড়ি, জর্জেট থ্রি-পিস, কটন কুর্তি এবং আরামদায়ক ইনার ট্রাউজার্স।",
    subCategories: [
      { name: "Saree", bnName: "শাড়ি" },
      { name: "Three-Piece", bnName: "থ্রি-পিস" },
      { name: "Kurti", bnName: "কুর্তি" },
      { name: "Ladies Pant", bnName: "লেডিস প্যান্ট" },
      { name: "Lingerie", bnName: "অন্তর্বাস" }
    ]
  },
  {
    id: 'c3',
    name: "Cosmetics & Beauty",
    bnName: "কসমেটিকস ও বিউটি",
    slug: "cosmetics-beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600",
    description: "High-stay lipsticks, revitalizing serums, facial creams, and imported fragrances.",
    bnDescription: "ম্যাট লিপস্টিক, স্কিনকেয়ার সিরাম, ফেস ক্রিম এবং চমৎকার সুগন্ধি পারফিউম।",
    subCategories: [
      { name: "Makeup", bnName: "মেকআপ" },
      { name: "Skincare", bnName: "স্কিনকেয়ার" },
      { name: "Haircare", bnName: "হেয়ারকেয়ার" },
      { name: "Perfume", bnName: "পারফিউম" }
    ]
  },
  {
    id: 'c4',
    name: "Electronics & Gadgets",
    bnName: "ইলেকট্রনিক্স ও গ্যাজেট",
    slug: "electronics-gadgets",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600",
    description: "Sleek smartwatches, active noise-cancelling earphones, powerbanks, and modern lifestyle gadgets.",
    bnDescription: "অত্যাধুনিক ব্লুটুথ স্মার্টওয়াচ, ক্রিস্টাল ক্লিয়ার ইয়ারফোন, ব্যাকআপ পাওয়ার ব্যাংক এবং অসাধারণ সব গ্যাজেট কালেকশন।",
    subCategories: [
      { name: "Smartwatch", bnName: "স্মার্টওয়াচ" },
      { name: "Earphones", bnName: "ইয়ারফোন" },
      { name: "Gadgets", bnName: "গ্যাজেট" }
    ]
  },
  {
    id: 'c5',
    name: "Baby collection",
    bnName: "শিশুদের পণ্য",
    slug: "baby-items",
    image: "https://images.unsplash.com/photo-1515488764276-be507de6c921?auto=format&fit=crop&q=80&w=600",
    description: "Essential baby care products, clothing, and comfort items.",
    bnDescription: "শিশুদের আরামদায়ক পোশাক, খেলনা এবং নিত্যপ্রয়োজনীয় সব পণ্য।",
    subCategories: [
      { name: "Clothing", bnName: "পোশাক" },
      { name: "Toys", bnName: "খেলনা" },
      { name: "Essentials", bnName: "প্রয়োজনীয় পণ্য" }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // ==================== MEN'S WEAR ====================
  {
    id: 'p1',
    name: 'Premium Cotton Indigo Polo T-Shirt',
    bnName: 'প্রিমিয়াম কম্বড কটন ব্রিদেল পোলো টি-শার্ট',
    description: 'Immaculately tailored with 100% combed cotton, providing breathable comfort, premium classic double-knit cuffs, and high resistance to fading.',
    bnDescription: 'শতভাগ প্রিমিয়াম কম্বড কটন সুতোয় তৈরি, অত্যন্ত আরামদায়ক ও ঘাম শোষণকারী কাপড়ের আধুনিক ডিজাইনের ওরিজিনাল পোলো শার্ট।',
    price: 1250,
    originalPrice: 1590,
    rating: 4.8,
    reviewCount: 34,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'টি-শার্ট',
    tags: ['Premium Cotton', 'Regular Fit', 'Casual Wear'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Indigo Blue', class: 'bg-indigo-900', hex: '#312e81' },
      { name: 'Crimson Red', class: 'bg-red-700', hex: '#b91c1c' },
      { name: 'Slate Gray', class: 'bg-slate-600', hex: '#475569' }
    ],
    isFeatured: true,
    isNew: true,
    stock: 25
  },
  {
    id: 'p2',
    name: 'Sovereign Royal Linen Casual Shirt',
    bnName: 'রয়্যাল পিউর লিনেন ক্যাজুয়াল শার্ট',
    description: 'Expertly woven from fine imported flax seeds linen, offering supreme breathability, classic spread collar design, and durable tailoring for summer.',
    bnDescription: 'আমদানিকৃত হাই-কোয়ালিটি লিনেন ফেব্রিক দিয়ে নিখুঁত ফিনিশিংয়ে তৈরি গর্জিয়াস ট্র্যাডিশনাল ক্যাজুয়াল ফুল হাতা শার্ট।',
    price: 2450,
    originalPrice: 2990,
    rating: 4.7,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'শার্ট',
    tags: ['100% Linen', 'Spread Collar', 'Smart Casual'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Pure Orchid White', class: 'bg-white border border-slate-300', hex: '#ffffff' },
      { name: 'Soft Turquoise', class: 'bg-teal-500', hex: '#14b8a6' },
      { name: 'Navy Midnight', class: 'bg-blue-900', hex: '#1e3a8a' }
    ],
    isTrending: true,
    stock: 18
  },
  {
    id: 'p3',
    name: 'Modern Flex Slim-Fit Stretch Denim',
    bnName: 'আল্ট্রা-ফ্লেক্স ফিট স্ট্রেচ ডেনিম প্যান্ট',
    description: 'Durable cotton-spandex denim blend crafted to provide continuous ergonomic stretch, deep secure pockets, and robust clean heavy stitch threads.',
    bnDescription: 'আরামদায়ক কটন ও ডেনিম স্ট্রেচ ফেব্রিকের নিখুঁত মেলবন্ধন। প্রতিদিনের ব্যবহারে সর্বোচ্চ কমফোর্ট এবং দীর্ঘস্থায়িত্ব নিশ্চিত করে।',
    price: 1850,
    originalPrice: 2200,
    rating: 4.6,
    reviewCount: 56,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'প্যান্ট',
    tags: ['Stretch Denim', 'Slim Fit', 'Heavy Wash'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Intense Indigo', class: 'bg-blue-950', hex: '#091d36' },
      { name: 'Vintage Blue', class: 'bg-blue-800', hex: '#1e3a8a' },
      { name: 'Matte Black', class: 'bg-stone-900', hex: '#1c1917' }
    ],
    stock: 40
  },
  {
    id: 'p4',
    name: 'Imperial Jamdani Motif Embroidered Panjabi',
    bnName: 'হ্যান্ডক্রাফটেড রাজকীয় এমব্রয়ডারি পাঞ্জাবি',
    description: 'A masterpiece of heritage design featuring rich, intricate neckline hand embroidered threads and superior premium soft cotton linen fabrics.',
    bnDescription: 'ঐতিহ্যবাহী জামদানি মোটিফের সূক্ষ্ম হাতাল ও কলার কারুকাজ সম্বলিত গর্জিয়াস উৎসবধর্মী আরামদায়ক কটন পাঞ্জাবি।',
    price: 3850,
    originalPrice: 4500,
    rating: 4.9,
    reviewCount: 51,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624378440847-4a64ef1a889d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'পাঞ্জাবি',
    tags: ['Handcrafted', 'Festive Edit', 'Soft Cotton'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Royal Ivory', class: 'bg-amber-50', hex: '#fef3c7' },
      { name: 'Aristocratic Maroon', class: 'bg-rose-950', hex: '#4c0519' },
      { name: 'Golden Mustard', class: 'bg-amber-500', hex: '#f59e0b' }
    ],
    isFeatured: true,
    stock: 12
  },
  {
    id: 'p5',
    name: 'Bamboo Comfort Boxer Briefs (3-Pack)',
    bnName: 'বডি-ফিট নরম ব্যাম্বু ফাইবার বক্সার ব্রিফ (৩ পিস প্যাক)',
    description: 'Engineered from eco-friendly organic bamboo fiber. Thermoregulating, naturally antibacterial, and with an anti-chafe seamless elastic waistband.',
    bnDescription: 'আরামদায়ক ও জীবাণুমুক্ত ব্যাম্বু ফাইবার লুপ দিয়ে তৈরি ইলাস্টিক সমৃদ্ধ খুবই আরামদায়ক ৩টি প্যান্টের প্রিমিয়াম কম্বো প্যাক।',
    price: 950,
    originalPrice: 1200,
    rating: 4.5,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'অন্তর্বাস',
    tags: ['Organic Bamboo', 'Anti-Bacterial', 'Super Soft'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Multi-Color Black/Navy/Gray', class: 'bg-slate-705', hex: '#64748b' }
    ],
    stock: 35
  },
  {
    id: 'p19',
    name: 'Formal Elite Double-Ply Cotton Shirt',
    bnName: 'ফরমাল এলিট ডাবল-প্লাই কটন শার্ট',
    description: 'A crisp, premium formal shirt tailored from 100% Giza double-ply cotton cotton yarn, offering crease resistance, sturdy premium collar, and neat cuffs.',
    bnDescription: '১০০% গিজা কটন ডাবল সুতোয় বোনা অত্যন্ত পরিপাটি ও চকচকে প্রিমিয়াম ক্লাসিক ক্যাজুয়াল ও ফরমাল পরার কলার শার্ট।',
    price: 2850,
    originalPrice: 3500,
    rating: 4.8,
    reviewCount: 16,
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'শার্ট',
    tags: ['Corporate Ready', 'Double Ply', 'Crease Free'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Sky Blue', class: 'bg-sky-200', hex: '#bae6fd' },
      { name: 'Classic Pure White', class: 'bg-white border text-stone-900 border-stone-200', hex: '#ffffff' }
    ],
    stock: 20
  },
  {
    id: 'p20',
    name: 'Exquisite Heritage Mulberry Silk Panjabi',
    bnName: 'এক্সক্লুসিভ ঐতিহ্যবাহী মালবেরি সিল্ক পাঞ্জাবি',
    description: 'A master creation from pure mulberry silk threads, adorned with minimal luxury button lines and tailored cuffs. Excellent drape for wedding sessions.',
    bnDescription: 'খাঁটি রাজশাহী মালবেরি সিল্কের সুতোয় বোনা নমনীয় ও জমকালো ফেস্টিভ স্পেশাল গর্জিয়াস আভিজাত্যের পাঞ্জাবি।',
    price: 4950,
    originalPrice: 5800,
    rating: 4.9,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1624378440847-4a64ef1a889d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'mens-fashion',
    subCategory: 'পাঞ্জাবি',
    tags: ['Pure Silk', 'Mulberry', 'Luxury Fit'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Champagne Gold', class: 'bg-yellow-100', hex: '#fef08a' },
      { name: 'Royal Prussian Navy', class: 'bg-neutral-900', hex: '#0f172a' }
    ],
    isNew: true,
    stock: 10
  },

  // ==================== WOMEN'S WEAR ====================
  {
    id: 'p6',
    name: 'Pure Soft-Silk Handloom Jamdani Saree',
    bnName: 'শতভাগ খাঁটি সিল্ক লাল গীতি জামদানি শাড়ি',
    description: 'An premium, stunning masterwork woven over 4 weeks using traditional hand looms. Elegant golden zari outline panels and vivid crimson hues.',
    bnDescription: 'বিশেষ তাঁতশিল্পীদের দিয়ে বোনা দৃষ্টিনন্দন রেশম সুতা ও জরি মোটিফের অসম্ভব গর্জিয়াস সোনালী জরি পাড় ঐতিহ্যবাহী লাল জামদানি শাড়ি।',
    price: 8500,
    originalPrice: 9800,
    rating: 4.9,
    reviewCount: 27,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'শাড়ি',
    tags: ['HandcraftedSari', 'Premium Silk', 'Traditional Zari'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Ruby Crimson Gold', class: 'bg-rose-600', hex: '#e11d48' },
      { name: 'Midnight Onyx Gold', class: 'bg-slate-900', hex: '#0f172a' },
      { name: 'Emerald Green Gold', class: 'bg-emerald-800', hex: '#064e3b' }
    ],
    isFeatured: true,
    stock: 6
  },
  {
    id: 'p7',
    name: 'Designer Georgette Heavy Embroidery Three-Piece',
    bnName: 'রাজকীয় উৎসব স্পেশাল জর্জেট সুতি থ্রি-পিস',
    description: 'Dazzle at any festival with lush intricate embroidery patterns, a matching heavily worked chiffon dupatta drape and premium comfort inner linings.',
    bnDescription: 'পছন্দনীয় ও ট্র্যান্ডি নিখুঁত সুতো এবং জরি এম্ব্রয়ডারি কাজের জমকালো প্রিমিয়াম সফট জর্জেট থ্রি-পিস কালেকশন। সাথে আছে শিফন দোপাট্টা।',
    price: 4500,
    originalPrice: 5200,
    rating: 4.8,
    reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'থ্রি-পিস',
    tags: ['Heavy Worked', 'Georgette Collection', 'Semi-Stitched'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Festive Magenta', class: 'bg-pink-700', hex: '#be185d' },
      { name: 'Royal Emerald Green', class: 'bg-emerald-900', hex: '#064e3b' },
      { name: 'Sunset Orange', class: 'bg-orange-650', hex: '#ea580c' }
    ],
    isTrending: true,
    stock: 14
  },
  {
    id: 'p8',
    name: 'Elegant Handblock Floral Print Cotton Kurti',
    bnName: 'ডিজাইনার হ্যান্ডব্লক কটন প্রিন্ট সিঙ্গেল কুর্তি',
    description: 'Crafted with premium high-thread count long cotton fibers, showcasing charming handblock design outputs and comfortable everyday round silhouettes.',
    bnDescription: 'সূক্ষ্ম প্রিন্ট ও চমৎকার হ্যান্ডব্লকের আরামদায়ক সিল্কি ফিনিশের সুতি সিঙ্গেল কুর্তি, যা প্রতিদিন পরার জন্য অত্যন্ত ট্রেন্ডি ও অভিজাত।',
    price: 1650,
    originalPrice: 1950,
    rating: 4.7,
    reviewCount: 49,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'কুর্তি',
    tags: ['Pure Cotton', 'Handblock Style', 'Highly Breathable'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Peach Velvet Blossom', class: 'bg-orange-200', hex: '#fed7aa' },
      { name: 'Turquoise Breeze', class: 'bg-cyan-600', hex: '#0891b2' },
      { name: 'Soft Olive Green', class: 'bg-lime-800', hex: '#3f6212' }
    ],
    stock: 20
  },
  {
    id: 'p9',
    name: 'High-Waist Comfort Tailored Ladies Pants',
    bnName: 'স্টাইলিশ হাই-ওয়েস্ট আরামদায়ক লেডিস প্যান্ট',
    description: 'Sleek professional ankle-grazing stretch ankle trousers, featuring functional side zipper arrays and elegant supportive tailored waistlines.',
    bnDescription: 'প্রিমিয়াম স্ট্রেচ গ্যাবার্ডিন কাপড়ে বোনা ট্র্যান্ডি অ্যাঙ্কেল লেন্থ ফিটিং হাই-ওয়েস্ট অফিস ও উৎসব ক্যাজুয়াল আরামদায়ক প্যান্ট।',
    price: 1450,
    originalPrice: 1800,
    rating: 4.5,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'লেডিস প্যান্ট',
    tags: ['Premium Elastic', 'Ankle length', 'Corporate Ready'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Classic Jet Black', class: 'bg-stone-900', hex: '#1c1917' },
      { name: 'Soft Almond Nude', class: 'bg-amber-100', hex: '#fef3c7' }
    ],
    stock: 22
  },
  {
    id: 'p10',
    name: 'Luxurious Comfort Soft-Lace Lingerie Set',
    bnName: 'সিমলেস লাক্সারি লেস কমফোর্ট ইনার সেট',
    description: 'Designed focus with sensory soft lace. Offers breathable support pads, high coverage elastic mesh structures, and zero-skin irritation textures.',
    bnDescription: 'শতভাগ আরামদায়ক প্রিমিয়াম লেস ফ্যাব্রিকের কাপ ব্রাস্ট-সাপোর্টার ইনারওয়্যার সেট, যা সারাদিনের ব্যবহারের জন্য উপযোগী ও হালকা।',
    price: 1600,
    originalPrice: 2100,
    rating: 4.6,
    reviewCount: 19,
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'অন্তর্বাস',
    tags: ['Seamless', 'Breathe Lace', 'Premium Fit'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Blossom Pink', class: 'bg-pink-300', hex: '#f9a8d4' },
      { name: 'Classic Midnight Black', class: 'bg-slate-950', hex: '#020617' }
    ],
    stock: 15
  },
  {
    id: 'p21',
    name: 'Premium Chiffon Georgette Traditional Saree',
    bnName: 'প্রিমিয়ার শিফন জর্জেট এমব্রয়ডারি শাড়ি',
    description: 'A light-weight flowing Chiffon Georgette Saree, embellished with heavy floral embroidery border layouts and delicate stone works.',
    bnDescription: 'নরম প্রিমিয়ার শিফন জর্জেট শাড়ি যাতে নিখুঁত ফুলো ও স্টোনের এমব্রয়ডারি কলার জরি পাড়ের ডিজাইন করা হয়েছে।',
    price: 6500,
    originalPrice: 7900,
    rating: 4.8,
    reviewCount: 14,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'শাড়ি',
    tags: ['Chiffon Saree', 'Party Wear', 'Stone Work'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Plum Purple', class: 'bg-purple-900', hex: '#581c87' },
      { name: 'Crimson Wine', class: 'bg-red-950', hex: '#450a0a' }
    ],
    isNew: true,
    stock: 8
  },
  {
    id: 'p22',
    name: 'Dazzling Designer Anarkali Kurti & Dupatta Set',
    bnName: 'ডিজাইনার জর্জেট আনারকলি কুর্তি ও দোপাট্টা সেট',
    description: 'An elegant long flared floor-touch Anarkali kameez made of soft touch rayon Giza fabric. Stitched with subtle gold thread motifs and matches with printed Chiffon.',
    bnDescription: 'লং ফ্লেয়ার আনাকলি স্টাইল থ্রি-পিস সেট। সুতি ইনার যুক্ত রয়েছে এবং কলার ও পেছনের চাবিতে আধুনিক জরি কাজ আছে।',
    price: 3450,
    originalPrice: 4200,
    rating: 4.7,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'womens-fashion',
    subCategory: 'থ্রি-পিস',
    tags: ['Anarkali', 'Floral Gown', 'Premium Dupatta'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [
      { name: 'Floral Rose Pink', class: 'bg-rose-455', hex: '#fb7185' },
      { name: 'Soft Sage Teal', class: 'bg-teal-700', hex: '#0f766e' }
    ],
    stock: 12
  },

  // ==================== COSMETICS & BEAUTY ====================
  {
    id: 'p11',
    name: 'Velvet Matte Long-Stay Hydrating Lipstick',
    bnName: 'ভেলভেট ম্যাট ১২-ঘণ্টা লং-স্টে ওয়াটারপ্রুফ লিপস্টিক',
    description: 'Rich highly pigmented color payoff enriched with moisturizing organic argan oil and shea butter, delivering deep 12-hour bold coverage.',
    bnDescription: 'ফরাসি অর্গানিক আরগান অয়েল ও শিয়া বাটার সমৃদ্ধ ঠোঁট ফাটা প্রতিরোধী ওয়াটারপ্রুফ অত্যন্ত আকর্ষণীয় ম্যাট ফিনিশিং লিপস্টিক।',
    price: 1200,
    originalPrice: 1500,
    rating: 4.8,
    reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'cosmetics-beauty',
    subCategory: 'মেকআপ',
    tags: ['Long Stay', 'Waterproof', 'Argan Oil Enriched'],
    sizes: [], // In Cosmetics sizes can be empty or list sizes like standard or small
    colors: [
      { name: 'Sultry Crimson Red', class: 'bg-rose-800', hex: '#9f1239' },
      { name: 'Warm Spicy Nude', class: 'bg-amber-700', hex: '#a16207' }
    ],
    stock: 45
  },
  {
    id: 'p12',
    name: 'Advanced Hyaluronic Glow Serum with Vitamin C & E',
    bnName: 'ডাবল ব্রাইটেনিং স্কিন রিপেয়ার ভিটামিন-সি ফেসিয়াল সিরাম',
    description: 'Targeted spot reduction and deep barrier hydration using premium multi-grade hyaluronic essence. Promotes natural cellular glow and repair.',
    bnDescription: 'ত্বকের উজ্জ্বলতা বৃদ্ধি ও অ্যান্টি-এজিং ফর্মুলার সমৃদ্ধ ডাবল ভিটামিন সি এবং ই সিরাম, যা মুখের কালচে দাগ দূর করতে সাহায্য করে।',
    price: 1800,
    originalPrice: 2200,
    rating: 4.9,
    reviewCount: 78,
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'cosmetics-beauty',
    subCategory: 'স্কিনকেয়ার',
    tags: ['Dermatologist Approved', 'Glowing Texture', 'Anti-Oxidant'],
    colors: [
      { name: 'Transparent Glow Liquid', class: 'bg-slate-100 border border-slate-200', hex: '#f8fafc' }
    ],
    isFeatured: true,
    isNew: true,
    stock: 28
  },
  {
    id: 'p13',
    name: 'Organic Onion & Ginger Oil Anti-Hairfall Treatment Mask',
    bnName: 'অর্গানিক কোকোনাট ফ্রুট ডিপ হেয়ার রিপেয়ার মাস্ক',
    description: 'Deep structural hair cell restoration and root follicle stimulation powered by raw cold-pressed onion extract and bioactive ginger lipids.',
    bnDescription: 'ভেষজ আরগান অয়েল ও পিঁয়াজের রুট স্ট্রেন্থেনার প্যাক, যা চুল পড়া বন্ধ করতে ও নতুন চুল গজাতে অত্যন্ত কার্যকর সাহায্য করে।',
    price: 1450,
    originalPrice: 1750,
    rating: 4.6,
    reviewCount: 23,
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'cosmetics-beauty',
    subCategory: 'হেয়ারকেয়ার',
    tags: ['Anti-Hairfall', 'Root Stimulator', '100% Organic'],
    colors: [
      { name: 'Rich Cream Paste', class: 'bg-yellow-50', hex: '#fefcf0' }
    ],
    stock: 32
  },
  {
    id: 'p14',
    name: 'Sultry Oud Royale Premium Eau de Parfum',
    bnName: 'লাক্সারি রয়্যাল উদ ব্লেন্ড সুগন্ধি পারফিউম',
    description: 'Unbounded longevity featuring rich notes of pure majestic Agarwood oud, dark roasted amber crystals, and warm cardamom oils.',
    bnDescription: 'শতভাগ অ্যালকোহল মুক্ত রয়্যাল অ্যাগারউড ও কস্তুরী ব্লেন্ড অত্যন্ত দীর্ঘস্থায়ী আভিজাত্যময় সুগন্ধি ফ্রেঞ্চ পারফিউম।',
    price: 4800,
    originalPrice: 5500,
    rating: 4.9,
    reviewCount: 55,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'cosmetics-beauty',
    subCategory: 'পারফিউম',
    tags: ['Long Lasting Oud', 'French Essential', 'Premium Box'],
    sizes: ['50 ml Gift Box', '100 ml Royal Decant'],
    colors: [
      { name: 'Liquified Amber Gold', class: 'bg-amber-600', hex: '#d97706' }
    ],
    isTrending: true,
    stock: 10
  },
  {
    id: 'p23',
    name: 'Ultra Glow Hydra Cream with Rosehip Oil',
    bnName: 'লাক্সারি গ্লো হাইড্রেটিং রোজশিপ অয়েল ফেস ক্রিম',
    description: 'A luxurious day cream infused with organic cold-pressed rosehip seed oil, gold essences, and high moisturizing complexes. Softens skin immediately.',
    bnDescription: 'খাঁটি কোল্ড-প্রেসড রোজশিপ বীজ তেল এবং সোনার নির্যাস সমৃদ্ধ স্কিন-ব্যারিয়ার হিলিং হাইড্রেটিং ফেস ক্রিম।',
    price: 2150,
    originalPrice: 2600,
    rating: 4.8,
    reviewCount: 30,
    images: [
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'cosmetics-beauty',
    subCategory: 'স্কিনকেয়ার',
    tags: ['Rosehip Extract', '24h Hydration', 'Barrier Repair'],
    colors: [
      { name: 'Aromatic Milk Pearl Paste', class: 'bg-pink-50', hex: '#fff1f2' }
    ],
    stock: 18
  },
  {
    id: 'p24',
    name: 'Nusrah Velvet Liquid Long Wear Foundation',
    bnName: 'নুসরাহ ভেলভেট ম্যাট লিকুইড ফাউন্ডেশন',
    description: 'A breathable medium-to-full buildable professional coverage fluid, delivering a seamless satin matte look for up to 18 hours. Waterproof.',
    bnDescription: '১৮ ঘণ্টা স্থায়ী স্কিন কমপ্যাক্ট ওয়াটারপ্রুফ ভেলভেটি ম্যাট লিকুইড ফাউন্ডেশন যা ত্বকের ত্রুটি সুন্দরভাবে ঢেকে দেয়।',
    price: 1950,
    originalPrice: 2400,
    rating: 4.7,
    reviewCount: 25,
    images: [
      'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'cosmetics-beauty',
    subCategory: 'মেকআপ',
    tags: ['Full Coverage', '18h Matte', 'Waterproof Base'],
    colors: [
      { name: 'Warm Ivory Sand', class: 'bg-amber-100', hex: '#fef3c7' },
      { name: 'Natural Sand Gold', class: 'bg-amber-200', hex: '#fde68a' }
    ],
    stock: 22
  },
  {
    id: 'p25',
    name: 'Imperium Active Pro Bluetooth calling Smartwatch',
    bnName: 'প্রিমিয়াম ব্লুটুথ কলিং স্পোর্টস স্মার্টওয়াচ',
    description: 'A masterpiece on your wrist with a vivid AMOLED screen, Bluetooth calling, real-time heart active tracker, and sports modes with premium battery life.',
    bnDescription: 'উজ্জ্বল অ্যামোলেড ডিসপ্লে, সরাসরি ব্লুটুথ কলিং, হার্ট রেট ট্র্যাকার এবং দীর্ঘস্থায়ী ব্যাটারি সমৃদ্ধ আকর্ষণীয় স্মার্টওয়াচ।',
    price: 3450,
    originalPrice: 4200,
    rating: 4.8,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'electronics-gadgets',
    subCategory: 'স্মার্টওয়াচ',
    tags: ['Calling Watch', 'AMOLED Screen', 'Waterproof IP68'],
    colors: [
      { name: 'Pitch Black Accent', class: 'bg-stone-900', hex: '#1c1917' },
      { name: 'Steel Silver Gray', class: 'bg-slate-450', hex: '#94a3b8' }
    ],
    stock: 20
  },
  {
    id: 'p26',
    name: 'AeroBuds Pro Active Noise Cancelling Earbuds',
    bnName: 'অ্যারোবাডস আল্ট্রা-নয়েজ ক্যানসেলিং ওয়্যারলেস ইয়ারফোন',
    description: 'Experience professional acoustic sound fields, hybrid active noise cancellation, and waterproof sweat-resistance. Low latency perfect for entertainment.',
    bnDescription: 'হাইব্রিড একটিভ নয়েজ ক্যানসেলেশন ও ঝকঝকে ত্রিমাত্রিক সাউন্ড কোয়ালিটি সমৃদ্ধ ওয়াটারপ্রুফ ব্লুটুথ ইয়ারফোন।',
    price: 1850,
    originalPrice: 2400,
    rating: 4.7,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'electronics-gadgets',
    subCategory: 'ইয়ারফোন',
    tags: ['Active Cancellation', 'Hi-Fi Audio', 'Touch Control'],
    colors: [
      { name: 'Pearl White', class: 'bg-white border text-stone-900 border-stone-150', hex: '#ffffff' },
      { name: 'Matte Grey Night', class: 'bg-zinc-800', hex: '#27272a' }
    ],
    stock: 15
  },
  {
    id: 'p27',
    name: 'Nusrah Volt 20,000mAh Dual Port Powerbank',
    bnName: 'নুসরাহ ভোল্ট ২০০০০ এমএএইচ ডুয়াল পোর্ট চার্জিং পাওয়ার ব্যাংক',
    description: 'High-density lithium polymer battery pack with 22.5W fast-charging system output. Compatible with all devices for seamless and reliable energy.',
    bnDescription: '২২.৫ ওয়াট ফাস্ট চার্জিং আউটপুট ও ২০,০০০ এমএএইচ সমৃদ্ধ নিখুঁত হাই-ডেনসিটি পাওয়ার ব্যাকআপ ব্যাংক।',
    price: 2200,
    originalPrice: 2800,
    rating: 4.6,
    reviewCount: 18,
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&q=80&w=800'
    ],
    category: 'electronics-gadgets',
    subCategory: 'গ্যাজেট',
    tags: ['Fast Charge', 'Large Capacity', 'Safe Circuits'],
    colors: [
      { name: 'Carbon Black', class: 'bg-[#18181b]', hex: '#18181b' }
    ],
    stock: 25
  }
];

export const INITIAL_REVIEWS: Record<string, Review[]> = {
  p1: [
    { id: 'r1', userName: 'Mahmudur Rahman', rating: 5, comment: 'টি-শার্টের ফেব্রিক সত্যি বেশ চমৎকার ও ঘাম শোষণ করে। ফিটিং ১০০% সঠিক।', date: 'May 14, 2026', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
    { id: 'r2', userName: 'Niloy Hasan', rating: 5, comment: 'Pure cotton material. Perfect to wear in this extreme heat. Great branding!', date: 'May 20, 2026' }
  ],
  p6: [
    { id: 'r3', userName: 'Anika Bushra', rating: 5, comment: 'শাড়িটা অনেক বেশি গর্জিয়াস এবং কুরিয়ার খুব দ্রুত ডেলিভারি করেছে। ধন্যবাদ নুসরাহ ফ্যাশন!', date: 'June 01, 2026', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }
  ],
  p12: [
    { id: 'r4', userName: 'Farzana Akter', rating: 5, comment: 'ত্বকে ৪ দিন ব্যবহারের পর পার্থক্য বুজি। সিরামটা খুব লাইট কোনো চ্যাটচ্যাটে ভাব নেই।', date: 'June 03, 2026' }
  ],
  p20: [
    { id: 'r5', userName: 'Naimul Islam', rating: 5, comment: 'বিয়ের জমকালো পাঞ্জাবি হিসেবে সেরা চয়েস। রাজকীয় লুক দেয় শার্টের মতো ফিটিং।', date: 'June 05, 2026' }
  ]
};
