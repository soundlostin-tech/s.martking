export const SITE_CONFIG = {
  name: "Smartking's Arena",
  description: "Join the ultimate gaming arena. Participate in elite tournaments, track your stats, and win big prizes.",
  url: "https://smartkingarena.com", // Placeholder, replace with actual production URL
  ogImage: "https://smartkingarena.com/og-image.jpg",
  links: {
    twitter: "https://twitter.com/smartkingarena",
  },
};

export const seoConfig = {
  "/": {
    title: "Smartking's Arena - Ultimate Gaming & Tournaments",
    description: "Compete in pro-level gaming tournaments, join live matches, and rise through the ranks at Smartking's Arena.",
    keywords: ["gaming tournaments", "pro league", "esports arena", "live matches", "gaming prizes"],
  },
  "/live": {
    title: "Live Matches | Smartking's Arena",
    description: "Watch live gaming tournaments and professional matches in real-time.",
    keywords: ["live esports", "gaming streams", "live tournaments", "smartking arena live"],
  },
  "/matches": {
    title: "Tournament Matches | Smartking's Arena",
    description: "Browse and join upcoming gaming matches and tournaments. Solo, Duo, and Squad formats available.",
    keywords: ["join tournaments", "gaming matches", "esports competition", "tournament bracket"],
  },
  "/wallet": {
    title: "My Wallet | Smartking's Arena",
    description: "Manage your gaming earnings, deposits, and withdrawals securely.",
  },
  "/profile": {
    title: "Your Profile | Smartking's Arena",
    description: "View your gaming stats, rank, and tournament history.",
  },
  "/leaderboard": {
    title: "Leaderboard | Smartking's Arena",
    description: "See the top players and rankings in the Smartking's Arena community.",
  },
  "/signup": {
    title: "Join the Arena | Sign Up",
    description: "Create your account at Smartking's Arena and start competing today.",
  },
  "/signin": {
    title: "Sign In | Smartking's Arena",
    description: "Log in to your account to access tournaments and your wallet.",
  },
  "/admin": {
    title: "Admin Dashboard | Smartking's Arena",
    description: "Manage the arena operations, users, and tournaments.",
    noIndex: true,
  },
  "/admin/live": {
    title: "Live Management | Admin",
    noIndex: true,
  },
  "/admin/tournaments": {
    title: "Tournament Management | Admin",
    noIndex: true,
  },
  "/admin/leaderboard": {
    title: "Leaderboard Management | Admin",
    noIndex: true,
  },
  "/admin/transactions": {
    title: "Transaction Management | Admin",
    noIndex: true,
  },
  "/admin/stories": {
    title: "Story Management | Admin",
    noIndex: true,
  },
};
