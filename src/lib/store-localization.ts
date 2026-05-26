import type { AppLocale } from "@/lib/i18n/config";
import type { CartItem, Order, StoreData, StoreSettings } from "@/types/store";

const ZH_TO_EN_TEXT_MAP: Record<string, string> = {
  "品质好物，一站购齐": "Quality picks, all in one place",
  "在同一个 Next 项目里同时提供商城前台、购物车和后台配置能力，适合继续扩展订单、支付和会员模块。":
    "A single Next project with storefront, cart, and admin tools, ready for orders, payments, and membership features.",
  "移动端优先的潮流鞋商城": "Mobile-first sneaker storefront",
  "前台支持邮箱注册登录，后台支持管理员账号管理、过滤条件配置与商品 CRUD。":
    "Customer sign-in, admin accounts, filter configuration, and product CRUD are all built into one project.",
  "支持后台灵活配置过滤条件，用户在下单页可直接通过订单链接和联系方式联系商家完成购买。":
    "Flexible filter configuration is supported in admin, and customers can contact the merchant from checkout with the order link and support info.",
  "提交订单后，请截图当前订单页，并通过页面展示的联系方式发送给商家确认购买。商家会根据截图或订单链接与你确认尺码、库存和发货信息。":
    "After placing an order, send the merchant a screenshot of the order page using the contact details shown on the site. The merchant will confirm size, stock, and shipping details with you.",
  "鞋子": "Shoes",
  "衣服": "Apparel",
  "数码设备": "Digital Devices",
  "家居好物": "Home Essentials",
  "运动出行": "Sports & Travel",
  "篮球鞋、跑鞋与复古鞋都在这里。": "Basketball shoes, running shoes, and retro styles in one place.",
  "球衣、卫衣与运动短袖等搭配商品。": "Jerseys, hoodies, and easy everyday apparel pairings.",
  "办公和生活常用的高-frequency电子产品。": "High-use electronics for work and daily life.",
  "办公和生活常用的高频电子产品。": "High-use electronics for work and daily life.",
  "提升居家幸福感的实用商品。": "Practical products that make home life more comfortable.",
  "适合通勤和日常锻炼的装备。": "Gear that fits commuting and daily workouts.",
  "鞋子价格": "Shoe Price",
  "衣服价格": "Apparel Price",
  "后台可配置的鞋子价格过滤条件。": "Admin-configurable price filters for shoes.",
  "后台可配置的衣服价格过滤条件。": "Admin-configurable price filters for apparel.",
  "热卖": "Hot",
  "新品": "New",
  "搭配款": "Styling Pick",
  "卫衣": "Hoodie",
  "精选": "Featured",
  "人气": "Popular",
  "推荐": "Recommended",
  "爆款": "Best Seller",
  "白红黑": "White / Red / Black",
  "湖蓝橙": "Lake Blue / Orange",
  "纯白": "Pure White",
  "深灰": "Dark Gray",
  "经典低帮轮廓，适合移动端商城展示与日常街头穿搭。":
    "A classic low-top silhouette, ideal for mobile storefront presentation and everyday street styling.",
  "适合实战的篮球鞋款，支持后台配置过滤条件后前台快速筛选。":
    "A performance-ready basketball shoe that works well with admin-configured storefront filters.",
  "适合搭配球鞋的一体式宽松短袖，上身轻松。":
    "A relaxed-fit tee that pairs easily with sneakers for an effortless look.",
  "适合秋冬与球鞋搭配的经典街头卫衣。":
    "A classic street hoodie for autumn and winter sneaker pairings.",
  "主动降噪耳机 Pro": "Noise Cancelling Headphones Pro",
  "轻薄机械键盘": "Slim Mechanical Keyboard",
  "智能护眼台灯": "Smart Eye-Care Desk Lamp",
  "模块化收纳箱": "Modular Storage Box",
  "轻量保温运动杯": "Lightweight Thermal Sports Bottle",
  "城市通勤双肩包": "Urban Commuter Backpack",
  "支持长续航和多设备切换，适合办公、通勤和视频会议。":
    "Long battery life and seamless device switching for work, commuting, and video calls.",
  "84 键配列，兼顾手感和桌面空间，适合程序员与设计师。":
    "An 84-key layout that balances typing feel and desk space for developers and designers.",
  "支持多档亮度和色温调节，夜间阅读更舒适。":
    "Multiple brightness and color temperature levels for more comfortable night reading.",
  "透明可叠放设计，适合衣物、书籍和小件分区整理。":
    "A transparent stackable design that helps organize clothes, books, and small items.",
  "便携防漏，适合健身、骑行和通勤随身携带。":
    "Portable and leak-resistant, ideal for training, cycling, and commuting.",
  "多层分区，可放置笔记本和随身设备，兼顾轻便与防泼水。":
    "Multi-compartment storage for laptops and daily gear, with a lightweight splash-resistant build.",
  "待补充分类描述。": "Category description coming soon.",
  "待补充商品描述。": "Product description coming soon.",
  "默认配色": "Default Colorway",
};

function localizeText(text: string, locale: AppLocale) {
  if (locale !== "en-US") {
    return text;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return text;
  }

  const mappedText = ZH_TO_EN_TEXT_MAP[trimmed];
  if (mappedText) {
    return mappedText;
  }

  const usdMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*美元$/);
  if (usdMatch) {
    return `$${usdMatch[1]}`;
  }

  const categoryMatch = trimmed.match(/^分类\s+(\d+)$/);
  if (categoryMatch) {
    return `Category ${categoryMatch[1]}`;
  }

  const groupMatch = trimmed.match(/^筛选组\s+(\d+)$/);
  if (groupMatch) {
    return `Filter Group ${groupMatch[1]}`;
  }

  const optionMatch = trimmed.match(/^选项\s+(\d+)$/);
  if (optionMatch) {
    return `Option ${optionMatch[1]}`;
  }

  return text;
}

export function localizeStoreSettings(settings: StoreSettings, locale: AppLocale): StoreSettings {
  if (locale !== "en-US") {
    return settings;
  }

  return {
    ...settings,
    heroTitle: localizeText(settings.heroTitle, locale),
    heroSubtitle: localizeText(settings.heroSubtitle, locale),
    heroNotice: localizeText(settings.heroNotice, locale),
    purchaseGuide: localizeText(settings.purchaseGuide, locale),
  };
}

export function localizeStoreData(store: StoreData, locale: AppLocale): StoreData {
  if (locale !== "en-US") {
    return store;
  }

  return {
    settings: localizeStoreSettings(store.settings, locale),
    categories: store.categories.map((category) => ({
      ...category,
      name: localizeText(category.name, locale),
      description: localizeText(category.description, locale),
    })),
    filterGroups: store.filterGroups.map((group) => ({
      ...group,
      name: localizeText(group.name, locale),
      description: localizeText(group.description, locale),
      options: group.options.map((option) => ({
        ...option,
        label: localizeText(option.label, locale),
      })),
    })),
    products: store.products.map((product) => ({
      ...product,
      name: localizeText(product.name, locale),
      badge: product.badge ? localizeText(product.badge, locale) : product.badge,
      description: localizeText(product.description, locale),
      colorway: localizeText(product.colorway, locale),
    })),
  };
}

export function localizeCartItems(items: CartItem[], locale: AppLocale): CartItem[] {
  if (locale !== "en-US") {
    return items;
  }

  return items.map((item) => ({
    ...item,
    name: localizeText(item.name, locale),
    badge: item.badge ? localizeText(item.badge, locale) : item.badge,
  }));
}

export function localizeOrders(orders: Order[], locale: AppLocale): Order[] {
  if (locale !== "en-US") {
    return orders;
  }

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productName: localizeText(item.productName, locale),
    })),
  }));
}
