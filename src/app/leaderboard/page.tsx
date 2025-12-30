import { getMetadataForRoute } from "@/lib/metadata";
import { LeaderboardPage } from "@/components/pages/LeaderboardPage";

export const metadata = getMetadataForRoute("/leaderboard");

export default function Leaderboard() {
  return <LeaderboardPage />;
}
