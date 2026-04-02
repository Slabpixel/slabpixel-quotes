import { Suspense } from "react";
import HomeClient from "@/components/pages/HomeClient";
import { QuotesLoadingFallback } from "@/components/QuotesLoadingFallback";
import { getPublishedQuotesForFeed } from "@/lib/queries/quote";

async function HomeFeed() {
  const quotes = await getPublishedQuotesForFeed(24);
  return <HomeClient quotes={quotes} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<QuotesLoadingFallback />}>
      <HomeFeed />
    </Suspense>
  );
}
