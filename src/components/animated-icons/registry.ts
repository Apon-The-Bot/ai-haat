export const iconNames = [
  "search",
  "shopping-bag",
  "shopping-cart",
  "home",
  "settings",
  "download",
] as const;

export type AnimatedIconName = (typeof iconNames)[number];

export type AnimatedIconAsset = {
  source: `https://www.flaticon.com/${"free" | "premium"}-animated-icon/${string}`;
  author: string;
  license: "free-with-attribution" | "premium";
  video: `/animations/flaticon/${string}.${"webm" | "mp4"}`;
  poster: `/animations/flaticon/${string}.webp`;
};

// Register an asset after acquisition and attribution have been verified.
export const animatedIconAssets: Partial<Record<AnimatedIconName, AnimatedIconAsset>> = {};
