import { getMetadataForRoute } from "@/lib/metadata";
import { LivePage } from "@/components/pages/LivePage";

export const metadata = getMetadataForRoute("/live");

export default function Live() {
  return <LivePage />;
}
