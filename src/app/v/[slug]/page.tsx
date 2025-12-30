import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateVideoMetadata, VideoData, extractSlugId } from "@/lib/content-seo";
import { VideoPageClient } from "./VideoPageClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getVideo(slug: string): Promise<VideoData | null> {
  const slugId = extractSlugId(slug);
  
  let query = supabase
    .from("videos")
    .select(`
      *,
      user:profiles(id, username, full_name, avatar_url)
    `);
  
  if (slugId) {
    query = query.ilike("id", `${slugId}%`);
  } else {
    query = query.eq("slug", slug);
  }
  
  const { data, error } = await query.single();
  
  if (error || !data) return null;
  
  return {
    ...data,
    user: data.user,
  } as VideoData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);
  
  if (!video) {
    return {
      title: "Video Not Found",
      robots: { index: false, follow: false },
    };
  }
  
  return generateVideoMetadata(video);
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getVideo(slug);
  
  if (!video || (!video.is_public && !video.allow_indexing)) {
    notFound();
  }
  
  return <VideoPageClient video={video} />;
}
