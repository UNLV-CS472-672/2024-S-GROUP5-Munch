export type UserType = {
  bio: string;
  bookmarks: string[];
  followers: string[];
  following: { timestamp: string; user: string }[];
  likes: { timestamp: string; user: string }[];
  posts: string[];
  username: string;
  clerk_user_id: string;
};

export type YelpRecommendation = {
  coordinates: `${number}, ${number}`;
  description: string;
  image_url: string;
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    country: string;
    display_address: string[];
  };
  name: string;
  price: string;
  rating: number;
};
