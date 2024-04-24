type PostBase = {
  author: string;
  comments: Comment[];
  creation_date: string;
  description: string;
  likes: Likes[];
  pictures: string[];
  username: string;
  key: string;
};

export type Byte = PostBase & {
  location: `${number},${number}`;
};

export type Recipe = PostBase & {
  steps: string[];
  ingredients: string[];
};

export type Likes = {
  timestamp: string;
  user: string;
};
export type Comment = {
  author: string;
  comment: string;
  creation_date: string;
  comment_id: string;
  username: string;
};
