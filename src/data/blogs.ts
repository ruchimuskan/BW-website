export type BlogCategory =
  | "Company"
  | "Safety"
  | "Captains"
  | "Product"
  | "Community";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  /** CSS object-position so faces and vehicles stay in frame */
  imagePosition?: string;
  author: string;
  paragraphs: string[];
}

export const BLOG_COVERS = {
  "wavego-ambulance-sos-launch": "/images/blogs/ambulance.jpg",
  "50-cities-and-counting": "/images/blogs/cities.jpg",
  "captain-earnings-transparency": "/images/blogs/captain-earnings.jpg",
  "monsoon-ride-safety-tips": "/images/blogs/monsoon.jpg",
  "parcel-delivery-milestone": "/images/blogs/parcel.jpg",
  "women-safety-commitment": "/images/blogs/women-safety.jpg",
} as const;

const CATEGORY_COVERS: Record<BlogCategory, string> = {
  Product: "/images/bwride.png",
  Company: BLOG_COVERS["50-cities-and-counting"],
  Captains: BLOG_COVERS["captain-earnings-transparency"],
  Safety: BLOG_COVERS["monsoon-ride-safety-tips"],
  Community: BLOG_COVERS["women-safety-commitment"],
};

const PLACEHOLDER_IMAGE =
  /pic-8|pic-best-fare|quick.?fare|lime-cab\.png|landing\/brand/i;

export function resolveBlogCover(post: {
  slug: string;
  image?: string;
  category?: string;
}): string {
  const bySlug = BLOG_COVERS[post.slug as keyof typeof BLOG_COVERS];
  if (bySlug) return bySlug;
  const src = (post.image ?? "").trim();
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/images/") && !PLACEHOLDER_IMAGE.test(src)) {
    if (/ambulance/i.test(src)) return "/images/bwride.png";
    return src;
  }
  const category = post.category as BlogCategory | undefined;
  if (category && CATEGORY_COVERS[category]) return CATEGORY_COVERS[category];
  return "/images/bwride.png";
}

export const blogPosts: BlogPost[] = [
  {
    slug: "wavego-ambulance-sos-launch",
    title: "BW Rides: Choose & book ambulance for free",
    excerpt:
      "We launched free ambulance booking so riders can choose verified medical transport without leaving the BW Rides app.",
    category: "Product",
    date: "2026-05-12",
    readTime: "4 min read",
    image: BLOG_COVERS["wavego-ambulance-sos-launch"],
    imageAlt: "Lime-green BW Rides ambulance on an Indian city street",
    imagePosition: "center 35%",
    author: "BW Rides Team",
    paragraphs: [
      "Every second counts in a medical emergency. That is why BW Rides lets you choose and book ambulance for free in the same app you use for rides and parcels — no separate downloads, no confusing flows.",
      "When you book ambulance for free, BW Rides matches you with verified medical transport partners, shows live ETA, and shares trip details with your emergency contacts automatically.",
      "Our captains undergo additional training for medical transport routes, hospital coordination, and calm customer communication under pressure.",
      "Book ambulance for free is rolling out across major metros first, with expansion planned for tier-2 cities through 2026. Tap Emergency on the home screen or landing page to get started.",
    ],
  },
  {
    slug: "50-cities-and-counting",
    title: "Growing across India: how BW Rides launches in a new city",
    excerpt:
      "From a single-city pilot to more communities — how we bring reliable rides, parcels, and support to each new launch.",
    category: "Company",
    date: "2026-04-28",
    readTime: "5 min read",
    image: BLOG_COVERS["50-cities-and-counting"],
    imageAlt: "Lime-green BW Rides cab on an Indian city highway",
    imagePosition: "center 40%",
    author: "Priya Sharma",
    paragraphs: [
      "BW Rides started with a simple belief: Indian cities deserve mobility that is fast, fair, and safe. We expand city by city, standing up a network that works on local roads before we talk about growth.",
      "Each new city gets local captain onboarding, regional pricing, airport and hospital route coverage, and a support team that understands peak-hour patterns.",
      "We prioritise neighbourhoods that are underserved by traditional transport — late-night corridors, hospital zones, and industrial hubs where a reliable pickup matters most.",
      "Thank you to our riders, captains, and city partners who make every launch possible.",
    ],
  },
  {
    slug: "captain-earnings-transparency",
    title: "Transparent earnings: What BW Rides captains actually take home",
    excerpt:
      "No hidden cuts, no surprise deductions — a clear look at how captain payouts work on BW Rides.",
    category: "Captains",
    date: "2026-04-10",
    readTime: "6 min read",
    image: BLOG_COVERS["captain-earnings-transparency"],
    imageAlt: "BW Rides captain checking trip earnings in the car",
    imagePosition: "center 28%",
    author: "Rahul Kapoor",
    paragraphs: [
      "Captains are the backbone of BW Rides. We heard loud and clear that unclear earnings were the number-one frustration on other platforms — so we rebuilt payouts from the ground up.",
      "Before you accept a trip, you see an estimated earning breakdown: base fare, distance component, time component, and any active incentives. What you see before the ride is what lands in your wallet after completion.",
      "Weekly settlements hit your bank account with zero platform fees hidden in fine print. Bonuses for peak hours, referral rewards, and safety milestones are listed separately so nothing feels like a mystery.",
      "If you are considering driving with BW Rides, visit the Captains section on our homepage or sign in to explore partner onboarding in your city.",
    ],
  },
  {
    slug: "monsoon-ride-safety-tips",
    title: "Monsoon ride safety tips every BW Rides rider should know",
    excerpt:
      "Heavy rain changes how we move through the city. Here is how to stay safe, dry, and informed during the monsoon season.",
    category: "Safety",
    date: "2026-03-22",
    readTime: "3 min read",
    image: BLOG_COVERS["monsoon-ride-safety-tips"],
    imageAlt: "Lime-green BW Rides cab driving in monsoon rain",
    imagePosition: "center 40%",
    author: "BW Rides Safety Team",
    paragraphs: [
      "Monsoon season brings flooded roads, reduced visibility, and longer trip times. BW Rides adjusts ETAs for weather, but a few habits from you make every ride safer.",
      "Share your live trip with a family member before you leave, especially on late-night or long-distance rides. Use in-app SOS if you ever feel unsafe — our team is available 24×7.",
      "Wait under cover for your captain when possible. Confirm the vehicle number and captain name in the app before boarding.",
      "For ambulance or urgent medical trips during floods, choose book ambulance for free and keep your pickup pin as precise as possible so responders reach you faster.",
      "Read our full Safety page for captain verification, insurance coverage, and community guidelines that protect everyone on the platform.",
    ],
  },
  {
    slug: "parcel-delivery-milestone",
    title: "BW Rides Parcel: same-day delivery across the city",
    excerpt:
      "Send documents, gifts, and small business shipments with verified captains, live tracking, and photo proof at drop-off.",
    category: "Product",
    date: "2026-03-05",
    readTime: "4 min read",
    image: BLOG_COVERS["parcel-delivery-milestone"],
    imageAlt: "BW Rides captain delivering a parcel to a customer",
    imagePosition: "center 45%",
    author: "BW Rides Team",
    paragraphs: [
      "BW Rides Parcel is for the things that need to move fast within the city — documents, gifts, pharmacy runs, and small business shipments.",
      "Parcel trips use the same verified captain network as passenger rides, with photo proof at pickup and drop-off, live tracking for senders, and insured coverage on eligible items.",
      "Businesses can book recurring routes from the app, and families use Parcel for everything from forgotten laptops to birthday cakes across town.",
      "Try Parcel from the booking widget or the home screen — enter pickup and delivery addresses, see upfront pricing, and send in minutes.",
    ],
  },
  {
    slug: "women-safety-commitment",
    title: "Our commitment to women riders and captains",
    excerpt:
      "Dedicated safety features, training, and support channels designed for women on both sides of every BW Rides trip.",
    category: "Community",
    date: "2026-02-14",
    readTime: "5 min read",
    image: BLOG_COVERS["women-safety-commitment"],
    imageAlt: "Women passengers riding safely in a BW Rides cab",
    imagePosition: "center 40%",
    author: "BW Rides Safety Team",
    paragraphs: [
      "Women make up a growing share of BW Rides riders and captains. Their safety is not an add-on feature — it is central to how we design products, policies, and support.",
      "Riders can share trips in one tap, access masked calling, and reach a 24×7 safety team trained on gender-sensitive incident response. Captains receive dedicated helplines and route assistance when they report concerns on the road.",
      "We partner with local NGOs and women's safety groups in each launch city to refine training and community reporting channels.",
      "Have feedback or ideas? Reach us through Help & Support in the app — every report is reviewed by our trust and safety team within 24 hours.",
    ],
  },
];

const DUMMY_CLAIM =
  /50 cities|over 50 cities|one million parcels|million parcels delivered|million completed deliveries|millions of rides/i;

function scrubClaims(text: string) {
  return text
    .replace(/\b50 cities and counting:?\s*/gi, "")
    .replace(/\bover 50 cities\b/gi, "more cities")
    .replace(/\bone million parcels delivered:?\s*/gi, "")
    .replace(/\b(one )?million parcels\b/gi, "parcels")
    .replace(/\b(one )?million (completed )?deliveries\b/gi, "deliveries")
    .replace(/\bmillions of rides\b/gi, "rides")
    .replace(/^[:\s]+/, "")
    .trim();
}

/** Drop unverified milestone claims if a CMS feed still sends them. */
export function withoutDummyClaims(post: BlogPost): BlogPost {
  const blob = `${post.title} ${post.excerpt} ${post.paragraphs.join(" ")}`;
  if (!DUMMY_CLAIM.test(blob)) return post;
  return {
    ...post,
    title: scrubClaims(post.title) || post.title,
    excerpt: scrubClaims(post.excerpt),
    paragraphs: post.paragraphs.map(scrubClaims),
  };
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export const blogCategories: BlogCategory[] = [
  "Company",
  "Product",
  "Safety",
  "Captains",
  "Community",
];
