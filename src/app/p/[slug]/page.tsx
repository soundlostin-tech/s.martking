import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { generatePostMetadata, PostData, extractSlugId } from "@/lib/content-seo";
import { PostPageClient } from "./PostPageClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getPost(slug: string): Promise<PostData | null> {
  const slugId = extractSlugId(slug);
  
  let query = supabase
    .from("posts")
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
  } as PostData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }
  
  return generatePostMetadata(post);
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post || (!post.is_public && !post.allow_indexing)) {
    notFound();
  }
  
  return <PostPageClient post={post} />;
}
