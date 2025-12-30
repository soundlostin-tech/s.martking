import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { follower_id, following_id, action } = body;

    if (!follower_id || !following_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (follower_id === following_id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    if (action === "unfollow") {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", follower_id)
        .eq("following_id", following_id);

      await Promise.all([
        supabase.rpc("decrement_following_count", { p_user_id: follower_id }),
        supabase.rpc("decrement_followers_count", { p_user_id: following_id }),
      ]);

      return NextResponse.json({ success: true, following: false });
    }

    const { error } = await supabase.from("follows").insert({
      follower_id,
      following_id,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, following: true, message: "Already following" });
      }
      throw error;
    }

    await Promise.all([
      supabase.rpc("increment_following_count", { p_user_id: follower_id }),
      supabase.rpc("increment_followers_count", { p_user_id: following_id }),
    ]);

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json({ error: "Failed to process follow" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const follower_id = searchParams.get("follower_id");
    const following_id = searchParams.get("following_id");

    if (!follower_id || !following_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", follower_id)
      .eq("following_id", following_id)
      .single();

    return NextResponse.json({ following: !!data });
  } catch (error) {
    return NextResponse.json({ following: false });
  }
}
