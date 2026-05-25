import { StoreShell } from "@/components/shop/store-shell";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage(props: Props) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams?.query === "string" ? searchParams.query : "";
  const [store, isMobile] = await Promise.all([readStoreData(), detectIsMobile()]);

  return (
    <div className={isMobile ? "pb-2 pt-2" : "home-page--desktop"}>
      <StoreShell initialData={store} isMobile={isMobile} searchQuery={query} />
    </div>
  );
}
