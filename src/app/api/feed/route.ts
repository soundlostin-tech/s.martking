import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface FeedItem {
  id: string;
  type: "post" | "video";
  title: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  video_url?: string | null;
  game: string | null;
  mode: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  watch_time_seconds?: number;
  duration_seconds?: number;
  created_at: string;
  user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  is_liked?: boolean;
  is_following?: boolean;
  ranking_score: number;
}

function calculateRankingScore(item: {
  view_count: number;
  like_count: number;
  comment_count: number;
  watch_time_seconds?: number;
  created_at: string;
  is_following?: boolean;
  same_game_preference?: boolean;
}): number {
  const ageInHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
  const decayFactor = Math.exp(-ageInHours / 48);

  const engagementScore =
    (item.view_count * 1) +
    (item.like_count * 5) +
    (item.comment_count * 10) +
    ((item.watch_time_seconds || 0) * 0.1);

  let relationshipBoost = 1;
  if (item.is_following) relationshipBoost += 0.5;
  if (item.same_game_preference) relationshipBoost += 0.3;

  return engagementScore * decayFactor * relationshipBoost;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const userId = searchParams.get("user_id");
    const page = parseInt(searchParams.get("page") || "1");
    const paginated = searchParams.get("paginated") === "true";

    let followedUserIds: string[] = [];
    let userGamePreferences: string[] = [];

    if (userId) {
      const [followsResult, profileResult] = await Promise.all([
        supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId),
        supabase
          .from("profiles")
          .select("game_preferences")
          .eq("id", userId)
          .single(),
      ]);

      followedUserIds = (followsResult.data || []).map((f) => f.following_id);
      userGamePreferences = profileResult.data?.game_preferences || [];
    }

    const [postsResult, videosResult] = await Promise.all([
      supabase
        .from("posts")
        .select(`
          id, title, description, slug, thumbnail_url, game, mode,
          view_count, like_count, comment_count, created_at, user_id,
          user:profiles!posts_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("videos")
        .select(`
          id, title, description, slug, thumbnail_url, video_url, game, mode,
          view_count, like_count, comment_count, watch_time_seconds, duration_seconds, created_at, user_id,
          user:profiles!videos_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    let likedPostIds: string[] = [];
    let likedVideoIds: string[] = [];

    if (userId) {
      const postIds = (postsResult.data || []).map((p) => p.id);
      const videoIds = (videosResult.data || []).map((v) => v.id);

      const [postLikes, videoLikes] = await Promise.all([
        postIds.length > 0
          ? supabase
              .from("post_likes")
              .select("post_id")
              .eq("user_id", userId)
              .in("post_id", postIds)
          : { data: [] },
        videoIds.length > 0
          ? supabase
              .from("video_likes")
              .select("video_id")
              .eq("user_id", userId)
              .in("video_id", videoIds)
          : { data: [] },
      ]);

      likedPostIds = (postLikes.data || []).map((l) => l.post_id);
      likedVideoIds = (videoLikes.data || []).map((l) => l.video_id);
    }

    const posts: FeedItem[] = (postsResult.data || []).map((post) => {
      const user = Array.isArray(post.user) ? post.user[0] : post.user;
      const isFollowing = followedUserIds.includes(post.user_id);
      const sameGamePreference = post.game && userGamePreferences.includes(post.game);

      return {
        id: post.id,
        type: "post" as const,
        title: post.title,
        description: post.description,
        slug: post.slug,
        thumbnail_url: post.thumbnail_url,
        game: post.game,
        mode: post.mode,
        view_count: post.view_count || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        created_at: post.created_at,
        user: {
          id: user?.id || post.user_id,
          username: user?.username || null,
          full_name: user?.full_name || null,
          avatar_url: user?.avatar_url || null,
        },
        is_liked: likedPostIds.includes(post.id),
        is_following: isFollowing,
        ranking_score: calculateRankingScore({
          view_count: post.view_count || 0,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          created_at: post.created_at,
          is_following: isFollowing,
          same_game_preference: sameGamePreference,
        }),
      };
    });

    const videos: FeedItem[] = (videosResult.data || []).map((video) => {
      const user = Array.isArray(video.user) ? video.user[0] : video.user;
      const isFollowing = followedUserIds.includes(video.user_id);
      const sameGamePreference = video.game && userGamePreferences.includes(video.game);

      return {
        id: video.id,
        type: "video" as const,
        title: video.title,
        description: video.description,
        slug: video.slug,
        thumbnail_url: video.thumbnail_url,
        video_url: video.video_url,
        game: video.game,
        mode: video.mode,
        view_count: video.view_count || 0,
        like_count: video.like_count || 0,
        comment_count: video.comment_count || 0,
        watch_time_seconds: video.watch_time_seconds || 0,
        duration_seconds: video.duration_seconds,
        created_at: video.created_at,
        user: {
          id: user?.id || video.user_id,
          username: user?.username || null,
          full_name: user?.full_name || null,
          avatar_url: user?.avatar_url || null,
        },
        is_liked: likedVideoIds.includes(video.id),
        is_following: isFollowing,
        ranking_score: calculateRankingScore({
          view_count: video.view_count || 0,
          like_count: video.like_count || 0,
          comment_count: video.comment_count || 0,
          watch_time_seconds: video.watch_time_seconds || 0,
          created_at: video.created_at,
          is_following: isFollowing,
          same_game_preference: sameGamePreference,
        }),
      };
    });

    let allItems = [...posts, ...videos].sort(
      (a, b) => b.ranking_score - a.ranking_score
    );

    if (paginated) {
      const offset = (page - 1) * limit;
      const paginatedItems = allItems.slice(offset, offset + limit);
      const totalPages = Math.ceil(allItems.length / limit);

      return NextResponse.json({
        items: paginatedItems,
        page,
        totalPages,
        total: allItems.length,
      });
    }

    if (cursor) {
      const cursorIndex = allItems.findIndex((item) => item.id === cursor);
      if (cursorIndex !== -1) {
        allItems = allItems.slice(cursorIndex + 1);
      }
    }

    const items = allItems.slice(0, limit);
    const nextCursor = items.length === limit ? items[items.length - 1].id : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasMore: nextCursor !== null,
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
