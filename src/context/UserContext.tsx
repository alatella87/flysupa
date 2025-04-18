import { createContext, ReactNode, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient.tsx";
import { User, Profile, UserContextType } from "@/types";

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [nomeUtente, setNomeUtente] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState<boolean>(false);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          total_hours: 0,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          total_hours: 0,
        });
      } else {
        setUser(null);
      }
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
        const { data, error }: any = await supabase
          .from("profiles")
          .select("nome_utente, avatar_url, license_url, admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        console.log("User Data:", data);
        setNomeUtente(data?.nome_utente || "");
        setIsAdmin(data?.admin || false);
        setTotalHours(
          data?.total_hours !== null ? Number(data.total_hours) : null
        );
        setEmail(user?.email || "");

        if (data?.avatar_url) {
          await downloadAndSetAvatar(data.avatar_url);
        }

        if (data?.license_url) {
          await downloadAndSetLicense(data.license_url);
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
        nome_utente: profile.nome_utente,
        username: profile.username,
        website: profile.website,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      if (profile.nome_utente !== undefined) setNomeUtente(profile.nome_utente);
      if (profile.avatar_url !== undefined) setAvatarUrl(profile.avatar_url);

      setShowConfirmAlert(true);
    } catch (error) {
      alert("Error updating the data!");
      console.error("Error updating the data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "license" = "avatar"
  ): Promise<void> => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      // Determine bucket and field based on type
      const bucket = type === "license" ? "licenses" : "avatars";
      const field = type === "license" ? "license_url" : "avatar_url";

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update the profile with the appropriate field
      const updates = { [field]: filePath };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (updateError) throw updateError;

      // Download and set the image in state
      if (type === "license") {
        await downloadAndSetLicense(filePath);
      } else {
        await downloadAndSetAvatar(filePath);
      }
    } catch (error) {
      alert(`Error uploading ${type}!`);
      console.error(`Error uploading ${type}:`, error);
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
      console.error("Error downloading avatar image:", error);
    }
  };

  const downloadAndSetLicense = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("licenses")
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setLicenseUrl(url);
    } catch (error) {
      console.error("Error downloading license image:", error);
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
      value={
        {
          user,
          email,
          loading,
          isAdmin,
          avatarUrl,
          licenseUrl,
          totalHours,
          nomeUtente,
          setNomeUtente,
          uploadImage,
          updateProfile,
          showConfirmAlert,
          setShowConfirmAlert,
          shouldRedirect,
          setShouldRedirect,
          downloadAndSetUserAvatar,
        } as any
      }>
      {children}
    </UserContext.Provider>
  );
}
