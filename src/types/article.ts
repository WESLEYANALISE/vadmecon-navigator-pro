
export interface Article {
  number: string;
  content: string;
  isTitle?: boolean;
  sheetName?: string;
  tags?: string[];
  lastRead?: number; // timestamp
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
  summary?: string; // Added for article summarization
}

export interface ArticleCrossReference {
  fromArticle: string;
  toArticle: string;
  type: 'related' | 'complementary' | 'revoked' | 'amended';
  description?: string;
  sheetName?: string; // Added to support cross-sheet references
}

// Nova interface para representar um banco de dados de referências cruzadas
export interface CrossReferencesDB {
  [articleNumber: string]: ArticleCrossReference[];
}
