import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: expiredStories, error: fetchError } = await supabaseAdmin
      .from('stories')
      .select('id, media_url, user_id')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired stories:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredStories || expiredStories.length === 0) {
      return NextResponse.json({ 
        message: 'No expired stories to clean up',
        deleted: 0 
      });
    }

    const filesToDelete: string[] = [];
    for (const story of expiredStories) {
      try {
        const url = new URL(story.media_url);
        const pathParts = url.pathname.split('/storage/v1/object/public/stories/');
        if (pathParts[1]) {
          filesToDelete.push(pathParts[1]);
        }
      } catch (e) {
        console.error('Error parsing URL:', story.media_url, e);
      }
    }

    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('stories')
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting storage files:', storageError);
      }
    }

    const storyIds = expiredStories.map(s => s.id);
    const { error: deleteError } = await supabaseAdmin
      .from('stories')
      .delete()
      .in('id', storyIds);

    if (deleteError) {
      console.error('Error deleting stories from database:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Cleanup completed successfully',
      deleted: expiredStories.length,
      filesDeleted: filesToDelete.length
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
