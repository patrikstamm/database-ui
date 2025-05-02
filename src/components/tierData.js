export const tiers = [
  {
    name: "Free",
    id: "tier-free",
    priceMonthly: "Free",
    description: "A standard access of our platform.",
    features: ["Can watch on 720p.", "10 free movie access per month"],
    featured: false,
  },
  {
    name: "Basic",
    id: "tier-basic",
    priceMonthly: "$49",
    description: "Access to more content in HD.",
    features: [
      "Can watch on 1080p.",
      "30 free movie access per month",
      "No Ads",
    ],
    featured: false,
  },
  {
    name: "Premium",
    id: "tier-premium",
    priceMonthly: "$99",
    description: "Access for every content on our platform.",
    features: ["Can watch on 4k", "Unlimited access to any movies", "No Ads"],
    featured: true,
  },
];
