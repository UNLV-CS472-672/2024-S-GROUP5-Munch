export type UserType = {
  bio: string;
  bookmarks: string[];
  followers: string[];
  following: string[];
  likes: string[];
  posts: string[];
  username: string;
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
