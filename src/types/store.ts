export type StoreSettings = {
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
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

export type CheckoutFormData = {
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  note?: string;
};

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  badge?: string;
  categoryId: string;
  inventory: number;
  quantity: number;
};
