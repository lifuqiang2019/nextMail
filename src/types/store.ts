export type StoreSettings = {
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  inventory: number;
  description: string;
};

export type StoreData = {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  categoryId: string;
  quantity: number;
};
