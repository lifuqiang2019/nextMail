export type StoreSettings = {
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroNotice: string;
  supportEmail: string;
  supportPhone: string;
  purchaseGuide: string;
  orderLink: string;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type FilterOption = {
  id: string;
  groupId: string;
  label: string;
  value: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type FilterGroup = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
  options: FilterOption[];
};

export type Product = {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  brand: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  inventory: number;
  description: string;
  imageUrl: string;
  sizes: string[];
  colorway: string;
  featured?: boolean;
  status?: string;
  filterOptionIds: string[];
};

export type StoreData = {
  settings: StoreSettings;
  categories: Category[];
  filterGroups: FilterGroup[];
  products: Product[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  categoryId: string;
  imageUrl?: string;
  quantity: number;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
};

export type AdminProfile = {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
};
