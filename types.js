// Product types
export const PRODUCT_CATEGORIES = {
  HOODIES: 'hoodies',
  TSHIRTS: 't-shirts',
  OVERSIZED: 'oversized-t-shirts'
};

export const PRODUCT_TAGS = {
  NEW: 'new',
  SALE: 'sale',
  POPULAR: 'popular'
};

// Product structure
export const Product = {
  id: 'number',
  name: 'string',
  category: 'T-Shirts | Hoodies | Oversized T-Shirts | Luxury',
  price: 'number',
  originalPrice: 'number',
  images: 'string[]',
  sizes: 'string[]',
  colors: 'string[]',
  description: 'string',
  fabricDetails: 'string',
};

export const Page = 'home | shop | product | about | contact | checkout | login | dashboard | admin | orders | downloads | addresses | account-details';