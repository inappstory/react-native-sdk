export type AppearanceCommonOptions = {
  hasFavorite?: boolean;
  hasLike?: boolean;
    hasLikeButton?: boolean;
    hasDislikeButton?: boolean;

  hasShare?: boolean;
};

const AppearanceCommonOptionsDefault: AppearanceCommonOptions = {
  hasFavorite: false,
  hasLike: false,
  hasLikeButton: true,
  hasDislikeButton: true,
  hasShare: false
};

export {AppearanceCommonOptionsDefault};


