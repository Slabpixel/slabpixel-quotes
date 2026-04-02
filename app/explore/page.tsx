import { Suspense } from "react";
import ExploreClient from "@/components/pages/ExploreClient";
import { QuotesLoadingFallback } from "@/components/QuotesLoadingFallback";
import { getPublishedQuotesForFeed } from "@/lib/queries/quote";

async function ExploreFeed() {
  const quotes = await getPublishedQuotesForFeed(24);
  return <ExploreClient quotes={quotes} />;
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={<QuotesLoadingFallback label="Loading explore" />}
    >
      <ExploreFeed />
    </Suspense>
  );
}
