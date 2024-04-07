type PostBase = {
  author: string;
  comments: Comment[];
  creation_date: string;
  description: string;
  likes: number;
  pictures: string[];
};

export type Byte = PostBase & {
  location: `${number},${number}`;
};

export type Recipe = PostBase & {
  steps: string[];
  ingredients: string[];
};

export type Comment = {
  author: string;
  comment: string;
  creation_date: string;
};
