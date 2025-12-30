import Link from "next/link";
import { Play, FileText, ChevronRight } from "lucide-react";
import { PostData, VideoData } from "@/lib/content-seo";

interface ContentLinksProps {
  posts?: PostData[];
  videos?: VideoData[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  maxItems?: number;
}

export function ContentLinks({
  posts = [],
  videos = [],
  title = "Related Content",
  showViewAll = false,
  viewAllHref,
  maxItems = 4,
}: ContentLinksProps) {
  const allContent = [...posts.slice(0, maxItems), ...videos.slice(0, maxItems)].slice(0, maxItems);

  if (allContent.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3 px-4">
        <h3 className="text-sm font-heading font-black text-[#1A1A1A] tracking-tight">{title}</h3>
        {showViewAll && viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[8px] font-black text-[#6B7280] uppercase tracking-wide flex items-center gap-1"
          >
            View All <ChevronRight size={10} />
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
        {posts.slice(0, maxItems).map((post) => (
          <Link
            key={post.id}
            href={`/p/${post.slug}`}
            className="flex-shrink-0 w-36 bg-white rounded-xl shadow border border-[#E5E7EB] overflow-hidden"
          >
            {post.thumbnail_url ? (
              <div className="w-full h-20 bg-[#F3F4F6]">
                <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-20 bg-[#A8E6CF] flex items-center justify-center">
                <FileText size={24} className="text-[#1A1A1A]/30" />
              </div>
            )}
            <div className="p-2.5">
              <p className="text-[10px] font-black text-[#1A1A1A] line-clamp-2 leading-tight">{post.title}</p>
              {post.game && (
                <span className="text-[7px] font-black text-[#6B7280] uppercase tracking-wide">{post.game}</span>
              )}
            </div>
          </Link>
        ))}
        {videos.slice(0, maxItems).map((video) => (
          <Link
            key={video.id}
            href={`/v/${video.slug}`}
            className="flex-shrink-0 w-36 bg-white rounded-xl shadow border border-[#E5E7EB] overflow-hidden"
          >
            <div className="relative w-full h-20 bg-[#1A1A1A]">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={24} className="text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={12} className="text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                </div>
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-[10px] font-black text-[#1A1A1A] line-clamp-2 leading-tight">{video.title}</p>
              {video.game && (
                <span className="text-[7px] font-black text-[#6B7280] uppercase tracking-wide">{video.game}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface ProfileContentLinksProps {
  userId: string;
  username?: string;
  posts?: PostData[];
  videos?: VideoData[];
}

export function ProfileContentLinks({ userId, username, posts = [], videos = [] }: ProfileContentLinksProps) {
  return (
    <>
      {posts.length > 0 && (
        <ContentLinks
          posts={posts}
          title="Top Posts"
          showViewAll={posts.length > 4}
          viewAllHref={`/u/${username || userId}?tab=posts`}
        />
      )}
      {videos.length > 0 && (
        <ContentLinks
          videos={videos}
          title="Popular Videos"
          showViewAll={videos.length > 4}
          viewAllHref={`/u/${username || userId}?tab=videos`}
        />
      )}
    </>
  );
}

interface TournamentContentLinksProps {
  tournamentId: string;
  posts?: PostData[];
  videos?: VideoData[];
}

export function TournamentContentLinks({ tournamentId, posts = [], videos = [] }: TournamentContentLinksProps) {
  const hasContent = posts.length > 0 || videos.length > 0;
  if (!hasContent) return null;

  return (
    <ContentLinks
      posts={posts}
      videos={videos}
      title="Highlights & Clips"
      showViewAll={posts.length + videos.length > 4}
      viewAllHref={`/tournaments/${tournamentId}/highlights`}
    />
  );
}

interface MatchContentLinksProps {
  matchId: string;
  posts?: PostData[];
  videos?: VideoData[];
}

export function MatchContentLinks({ matchId, posts = [], videos = [] }: MatchContentLinksProps) {
  const hasContent = posts.length > 0 || videos.length > 0;
  if (!hasContent) return null;

  return (
    <ContentLinks
      posts={posts}
      videos={videos}
      title="Match Highlights"
      showViewAll={posts.length + videos.length > 4}
      viewAllHref={`/matches/${matchId}/highlights`}
    />
  );
}
