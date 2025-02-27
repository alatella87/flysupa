import {createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState} from "react";
import {supabase} from "../services/supabaseClient.tsx";

interface User {
  id: string;
  email: string;
  // Add other user properties if needed
}

interface Profile {
  isAdmin?: boolean | null;
  username?: string | null;
  fullname?: string | null;
  website?: string | null;
  avatar_url?: string | null;
  amount_hours?: number | null;
}

interface UserContextType {
  loading: boolean;
  user: User | null;
  isAdmin: boolean | null;
  email: string | null;
  fullName: string | null;
  amountHours: number | null;
  avatarUrl: string | null;
  setFullName: Dispatch<SetStateAction<string | null>>;
  uploadImage: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  showConfirmAlert: boolean;
  setShowConfirmAlert: Dispatch<SetStateAction<boolean>>;
  shouldRedirect: boolean;
  setShouldRedirect: Dispatch<SetStateAction<boolean>>;
  downloadAndSetUserAvatar: any;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [amountHours, setAmountHours] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState<boolean>(false);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(true);


  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setShouldRedirect(true); // Enable redirection when auth state changes
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, amount_hours, admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setFullName(data?.full_name || "");
        setIsAdmin(data?.admin || "");
        setAmountHours(data?.amount_hours !== null ? Number(data.amount_hours) : null);
        setEmail(data?.email || "");

        if (data?.avatar_url) {
          await downloadAndSetAvatar(data.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const updateProfile = async (profile: Profile): Promise<void> => {
    try {
      setLoading(true);
      const updates = {
        id: user?.id as string,
        full_name: profile.fullname,
        username: profile.username,
        website: profile.website,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      if (profile.fullname !== undefined) setFullName(profile.fullname);
      if (profile.avatar_url !== undefined) setAvatarUrl(profile.avatar_url);

      setShowConfirmAlert(true);
    } catch (error) {
      alert("Error updating the data!");
      console.error("Error updating the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      await downloadAndSetAvatar(filePath);
    } catch (error) {
      alert("Error uploading avatar!");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const downloadAndSetAvatar = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const downloadAndSetUserAvatar = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) throw error;

      return URL.createObjectURL(data);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        email,
        loading,
        isAdmin,
        fullName,
        avatarUrl,
        amountHours,
        setFullName,
        uploadImage,
        updateProfile,
        showConfirmAlert,
        setShowConfirmAlert,
        shouldRedirect,
        setShouldRedirect,
        downloadAndSetUserAvatar
      }}>
      {children}
    </UserContext.Provider>
  );
}
