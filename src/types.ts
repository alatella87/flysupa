import { ReactNode } from "react";

// Common interfaces for FlySupa application

// User related interfaces
export interface User {
  nomeUtente: ReactNode;
  id: string;
  email: string;
  total_hours: number;
}

export interface Profile {
  id?: string;
  nome_utente?: string;
  email?: string;
  total_hours?: number;
  admin?: boolean;
  sensibilizzazione?: boolean;
  soccorritori?: boolean;
  phone?: string;
  licenza_date?: string;
  full_avatar_url?: string;
  avatar_url?: string;
  license_url?: string;
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
  inCurrentLesson: string | number | boolean | null | undefined;
  title: ReactNode;
  id: string;
  name: string;
  completion_degree?: string | null;
  global_completion?: {
    degree: string | null;
    lessonId: string | null;
  };
}

// Component props interfaces
export interface LessonsTableProps {
  id: string;
  profile: Profile | null;
  lessons: Lesson[];
  lessonsCount: number;
  deleteLesson: (id: string, profileId: string) => void;
  refetchLessons?: (profileId: string) => Promise<void>;
}

export interface AvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  editMode?: boolean;
  navbar?: boolean;
  userEditForm?: boolean;
  sourceUrl?: string;
  className?: string;
  lessonsCount?: number;
}

// Context interfaces
export interface UserContextType {
  // Core user data (null-able properties)
  user: User | null;
  email: string | null;
  nomeUtente: string | null;
  avatarUrl: string | null;
  licenseUrl: string | null;
  totalHours: number | null;
  isAdmin: boolean | null;

  // Boolean flags
  loading: boolean;
  isLoadingHours: boolean;
  showConfirmAlert: boolean;
  shouldRedirect: boolean;

  // Data arrays
  profileTotalHours: ProfileTotalHours[];

  // State setters
  setNomeUtente: (name: string) => void;
  setShowConfirmAlert: (show: boolean) => void;
  setShouldRedirect: (redirect: boolean) => void;

  // Async operations
  uploadImage: (
    event: React.ChangeEvent<HTMLInputElement>,
    type?: "avatar" | "license",
  ) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  downloadAndSetUserAvatar: (path: string) => Promise<string | undefined>;
  refetchTotalHours: () => Promise<void>;
}

// Global interfaces
export interface HSStaticMethods {
  autoInit: () => void;
}

// Also add this interface if not already defined
interface ProfileTotalHours {
  profile_id: string;
  total_hours: number;
}
