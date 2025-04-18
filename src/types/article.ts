
export interface Article {
  number: string;
  content: string;
  isTitle?: boolean;
}

export interface ArticleComment {
  id: string;
  text: string;
  timestamp: number;
  highlights?: {
    start: number;
    end: number;
    type: 'highlight' | 'underline' | 'color-red' | 'color-green' | 'color-blue';
  }[];
  images?: string[];
  audioNotes?: string[];
}

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

export interface UserNote {
  id: string;
  text: string;
  timestamp: number;
}

export interface ExplanationResponse {
  formal: string;
  technical: string;
  example: string;
}
