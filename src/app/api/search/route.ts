import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SearchResult {
  type: "profile" | "post" | "video";
  id: string;
  title?: string;
  username?: string;
  full_name?: string;
  description?: string;
  slug?: string;
  thumbnail_url?: string;
  avatar_url?: string;
  game?: string;
  view_count?: number;
  like_count?: number;
  followers_count?: number;
  relevance_score: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    if (!type || type === "profile") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, bio, avatar_url, followers_count, game_preferences")
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .order("followers_count", { ascending: false })
        .limit(type ? limit : Math.ceil(limit / 3));

      (profiles || []).forEach((p) => {
        const nameMatch = p.full_name?.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
        const usernameMatch = p.username?.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
        const bioMatch = p.bio?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const popularityBoost = Math.log10((p.followers_count || 0) + 1) * 0.5;

        results.push({
          type: "profile",
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          description: p.bio,
          avatar_url: p.avatar_url,
          followers_count: p.followers_count || 0,
          relevance_score: nameMatch + usernameMatch + bioMatch + popularityBoost,
        });
      });
    }

    if (!type || type === "post") {
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          id, title, description, slug, thumbnail_url, game, view_count, like_count,
          user:profiles!posts_user_id_fkey(username, full_name)
        `)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},game.ilike.${searchTerm}`)
        .order("view_count", { ascending: false })
        .limit(type ? limit : Math.ceil(limit / 3));

      (posts || []).forEach((p) => {
        const titleMatch = p.title?.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
        const descMatch = p.description?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const gameMatch = p.game?.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
        const popularityBoost = Math.log10((p.view_count || 0) + (p.like_count || 0) * 5 + 1) * 0.5;

        results.push({
          type: "post",
          id: p.id,
          title: p.title,
          description: p.description,
          slug: p.slug,
          thumbnail_url: p.thumbnail_url,
          game: p.game,
          view_count: p.view_count || 0,
          like_count: p.like_count || 0,
          relevance_score: titleMatch + descMatch + gameMatch + popularityBoost,
        });
      });
    }

    if (!type || type === "video") {
      const { data: videos } = await supabase
        .from("videos")
        .select(`
          id, title, description, slug, thumbnail_url, game, view_count, like_count,
          user:profiles!videos_user_id_fkey(username, full_name)
        `)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},game.ilike.${searchTerm}`)
        .order("view_count", { ascending: false })
        .limit(type ? limit : Math.ceil(limit / 3));

      (videos || []).forEach((v) => {
        const titleMatch = v.title?.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
        const descMatch = v.description?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const gameMatch = v.game?.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
        const popularityBoost = Math.log10((v.view_count || 0) + (v.like_count || 0) * 5 + 1) * 0.5;

        results.push({
          type: "video",
          id: v.id,
          title: v.title,
          description: v.description,
          slug: v.slug,
          thumbnail_url: v.thumbnail_url,
          game: v.game,
          view_count: v.view_count || 0,
          like_count: v.like_count || 0,
          relevance_score: titleMatch + descMatch + gameMatch + popularityBoost,
        });
      });
    }

    results.sort((a, b) => b.relevance_score - a.relevance_score);

    const paginatedResults = results.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total: results.length,
      hasMore: offset + limit < results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
