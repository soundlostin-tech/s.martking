import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, post_id, video_id, content } = body;

    if (!user_id || !content || (!post_id && !video_id)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        user_id,
        post_id: post_id || null,
        video_id: video_id || null,
        content,
      })
      .select(`
        id, content, created_at,
        user:profiles!comments_user_id_fkey(id, username, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    const contentTable = post_id ? "posts" : "videos";
    const contentId = post_id || video_id;

    await supabase.rpc("increment_comment_count", {
      p_table: contentTable,
      p_id: contentId,
    });

    return NextResponse.json({ success: true, comment: data });
  } catch (error) {
    console.error("Comment API error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get("post_id");
    const video_id = searchParams.get("video_id");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const cursor = searchParams.get("cursor");

    if (!post_id && !video_id) {
      return NextResponse.json({ error: "Missing post_id or video_id" }, { status: 400 });
    }

    let query = supabase
      .from("comments")
      .select(`
        id, content, created_at,
        user:profiles!comments_user_id_fkey(id, username, full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (post_id) {
      query = query.eq("post_id", post_id);
    } else {
      query = query.eq("video_id", video_id);
    }

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) throw error;

    const hasMore = (data?.length || 0) > limit;
    const comments = data?.slice(0, limit) || [];
    const nextCursor = hasMore ? comments[comments.length - 1]?.created_at : null;

    return NextResponse.json({
      comments,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comment_id = searchParams.get("id");
    const user_id = searchParams.get("user_id");

    if (!comment_id || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: comment } = await supabase
      .from("comments")
      .select("post_id, video_id")
      .eq("id", comment_id)
      .eq("user_id", user_id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 });
    }

    await supabase.from("comments").delete().eq("id", comment_id);

    const contentTable = comment.post_id ? "posts" : "videos";
    const contentId = comment.post_id || comment.video_id;

    await supabase.rpc("decrement_comment_count", {
      p_table: contentTable,
      p_id: contentId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
