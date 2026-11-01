export type LanguageCode = "tr" | "en";
export type RegionCode = "TR" | "US" | "GB" | "DE";

export interface LanguageConfig {
  code: LanguageCode;
  label: string;
  tmdb: string;
  dayjs: string;
}

export interface RegionConfig {
  code: RegionCode;
  label: string;
}

export interface CastMember {
  name: string;
  character: string;
  profilePath: string | null;
}

export interface ProviderItem {
  id: number;
  name: string;
  logoPath: string | null;
  priority: number | null;
}

export interface ProvidersData {
  region: string;
  link: string | null;
  flatrate?: ProviderItem[];
  free?: ProviderItem[];
  ads?: ProviderItem[];
  rent?: ProviderItem[];
  buy?: ProviderItem[];
}

export interface WatchHistoryEntry {
  ts: number | null;
}

export interface Movie {
  id: string | number;
  title?: string;
  originalTitle?: string | null;
  originalLanguage?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  voteAverage?: number | null;
  voteCount?: number;
  overview?: string;
  tagline?: string;
  genres?: string[];
  trailer?: string | null;
  cast?: CastMember[];
  status?: "wishlist" | "watched" | string | null;
  isWatched?: boolean;
  rating?: number;
  review?: string;
  watchedAt?: number | null;
  addedAt?: number;
  watchHistory?: WatchHistoryEntry[];
  contentLanguage?: string;
  contentRegion?: string;
  [key: string]: any;
}

export interface UserMovieState {
  id: string;
  title?: string;
  posterPath?: string | null;
  status: "wishlist" | "watched" | string | null;
  isWatched: boolean;
  rating?: number;
  review?: string;
  watchedAt?: number | null;
  addedAt?: number;
  watchHistory?: WatchHistoryEntry[];
  [key: string]: any;
}

export interface UserList {
  id: string;
  name: string;
  type: "default" | "custom" | string;
  visibility: "public" | "private" | string;
  showOnHome?: boolean;
  createdAt?: number;
  moviesCount?: number;
  [key: string]: any;
}

export interface Friend {
  id: string;
  uid?: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  status?: string;
  addedAt?: any;
  [key: string]: any;
}

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  language?: LanguageCode;
  region?: RegionCode;
  lastSeen?: any;
  [key: string]: any;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  type?: string;
  movieId?: string | number;
  movieTitle?: string;
  moviePoster?: string | null;
  createdAt?: any;
}

export interface ChatItem {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  lastMessageSenderId?: string;
  unreadBy?: string[];
  otherUser?: UserProfile;
}

export interface AuthContextType {
  user: {
    id: string;
    uid: string;
    name: string;
    displayName: string;
    email: string;
    image?: string | null;
    photoURL?: string | null;
  } | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  language: LanguageCode;
  region: RegionCode;
  updatePreferences: (preferences: { language?: string; region?: string }) => Promise<void>;
}

export interface AppDataContextType {
  movies: Movie[] | undefined;
  friends: Friend[];
  moviesLoading: boolean;
  friendsLoading: boolean;
  lists: UserList[];
  listMovies: Record<string, Movie[]>;
  watchedMovieIds: (string | number)[];
}

export interface NavigationContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}
