import { ProductDetailShell } from "@/components/shop/product-detail-shell";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ productId: string }>;
};

export default async function ProductDetailPage(props: Props) {
  const { productId } = await props.params;
  const [store, isMobile] = await Promise.all([readStoreData(), detectIsMobile()]);

  const product =
    store.products.find((item) => item.id === productId) ??
    store.products.find((item) => item.slug && item.slug === productId);

  if (!product) {
    notFound();
  }

  const category = store.categories.find((item) => item.id === product.categoryId);

  return (
    <div className={isMobile ? "product-detail-page" : "product-detail-page product-detail-page--desktop"}>
      <ProductDetailShell category={category} product={product} />
    </div>
  );
}
