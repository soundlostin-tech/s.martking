import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, target_type, target_id, action } = body;

    if (!user_id || !target_type || !target_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const table = target_type === "post" ? "post_likes" : "video_likes";
    const column = target_type === "post" ? "post_id" : "video_id";
    const contentTable = target_type === "post" ? "posts" : "videos";

    if (action === "unlike") {
      await supabase
        .from(table)
        .delete()
        .eq("user_id", user_id)
        .eq(column, target_id);

      await supabase.rpc("decrement_like_count", {
        p_table: contentTable,
        p_id: target_id,
      });

      return NextResponse.json({ success: true, liked: false });
    }

    const { error } = await supabase.from(table).insert({
      user_id,
      [column]: target_id,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, liked: true, message: "Already liked" });
      }
      throw error;
    }

    await supabase.rpc("increment_like_count", {
      p_table: contentTable,
      p_id: target_id,
    });

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
  }
}
