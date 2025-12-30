import { getMetadataForRoute } from "@/lib/metadata";
import { MatchesPage } from "@/components/pages/MatchesPage";

export const metadata = getMetadataForRoute("/matches");

export default function Matches() {
  return <MatchesPage />;
}
