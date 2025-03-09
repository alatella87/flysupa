// Common interfaces for FlySupa application

// User related interfaces
export interface User {
  id: string;
  email: string;
  total_hours: number;
}

export interface Profile {
  id: string;
  nome_utente: string;
  email: string;
  total_hours: number;
  admin: boolean;
  sensibilizzazione?: boolean;
  soccorritori?: boolean;
  phone?: string;
  licenza_date?: string;
  full_avatar_url?: string;
  avatar_url?: string;
  isAdmin?: boolean | null;
  username?: string | null;
  website?: string | null;
  updated_at?: string;
  days_difference?: number;
}

// Lesson related interfaces
export interface Lesson {
  id: string;
  date: string;
  amount_hours: number;
  created_at: string;
  content: string;
  profile_id: string;
  title: string;
  details?: any[];
}

export interface LessonItem {
  title: ReactNode;
  id: string;
  name: string;
}

// Component props interfaces
export interface LessonsTableProps {
  id: string;
  profile: Profile | null;
  lessons: Lesson[];
  createLesson: (id: string) => void;
  deleteLesson: (id: string, profileId: string) => void;
}

export interface AvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  editMode?: boolean;
  navbar?: boolean;
  sourceUrl?: string;
  className?: string;
}

// Context interfaces
export interface UserContextType {
  loading: boolean;
  user: User | null;
  isAdmin: boolean | null;
  email: string | null;
  nomeUtente: string | null;
  totalHours: number | null;
  avatarUrl: string | null;
  uploadImage: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  showConfirmAlert: boolean;
  shouldRedirect: boolean;
  downloadAndSetUserAvatar: any;
  setNomeUtente: React.Dispatch<React.SetStateAction<string | null>>;
  setShowConfirmAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setShouldRedirect: React.Dispatch<React.SetStateAction<boolean>>;
}

// Global interfaces
export interface HSStaticMethods {
  autoInit: () => void;
}