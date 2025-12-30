import { getMetadataForRoute } from "@/lib/metadata";
import { HomePage } from "@/components/pages/HomePage";

export const metadata = getMetadataForRoute("/");

export default function Home() {
  return <HomePage />;
}
