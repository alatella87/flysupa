"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.tsx";
import { Profile, Lesson } from "@/types";
import { useUser } from "../hooks/useUser";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Update imports to include our custom Avatar
import Avatar from "@/components/Avatar";

// Custom Components
import LessonsTable, { NoLessons, LoadingLessons } from "./LessonsTable";

export default function UserEditForm() {
  const { id } = useParams<{ id: string }>(); // Get user ID from URL
  const { refetchTotalHours, downloadAndSetUserAvatar } = useUser(); // Add downloadAndSetUserAvatar
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]); // Initialize as an empty array
  const [loadingLessons, setLoadingLessons] = useState(true); // Initialize as true
  const [totalHours, setTotalHours] = useState<number>(0); // Initialize as 0
  const [lessonsCount, setLessonsCount] = useState<number>(0); // Initialize as 0

  // Profile fields that we want to display in our table
  const fieldDisplayNames: { [key: string]: string } = {
    nome_utente: "Nome Completo",
    email: "Email",
    phone: "Telefono",
    licenza_date: "Data rilascio LAC",
    admin: "Amministratore",
    sensibilizzazione: "Sensibilizzazione",
    soccorritori: "Soccorritori",
  };

  // Use Effects
  useEffect(() => {
    if (!id) return;
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      await fetchProfile();
      await fetchProfileLessons(id);
    };

    fetchData();
  }, [id]);

  // Fetch Profile
  const fetchProfile = async () => {
    if (!id) {
      setError("Invalid User Id");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/profiles_table?id=eq.${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();

      if (data.length > 0) {
        const profileData = data[0];

        // Download and set avatar if available
        if (profileData.avatar_url) {
          const avatarUrl = await downloadAndSetUserAvatar(profileData.avatar_url);
          profileData.full_avatar_url = avatarUrl;
        }
        setProfile(profileData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lessons
  const fetchProfileLessons = async (id: string) => {
    try {
      setLoadingLessons(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lessons?profile_id=eq.${id}&order=date.asc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }

      const lessonsData: Lesson[] = await response.json();

      // Fetch lesson details for each lesson
      const detailedLessons = await Promise.all(
        lessonsData.map(async (lesson) => {
          const detailsResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lesson_item_details_view?lesson_id=eq.${lesson.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
            }
          );

          if (!detailsResponse.ok) {
            console.warn(`Failed to fetch details for lesson ${lesson.id}`);
            return lesson; // Return the lesson without additional details if fetch fails
          }

          const details = await detailsResponse.json();
          return { ...lesson, details }; // Assign all details instead of just details[0]
        })
      );

      setLessons(detailedLessons);
      setLessonsCount(detailedLessons.length); // Update lessonsCount
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Handle edits from custom edit components
  const handleFieldChange = (key: string, value: any) => {
    // Update the profile state
    setProfile((prev) => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };

  const updateProfile = async () => {
    if (!id || !profile) return;

    try {
      setLoading(true);

      // Extract updatable fields from profile
      const updates = Object.entries(profile)
        .filter(([key]) => key !== "email" && key in fieldDisplayNames)
        .reduce((acc, [key, value]) => {
          return { ...acc, [key]: value };
        }, {});

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setShowConfirmAlert(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update the createLesson function
  const createLesson = async (id: string) => {
    const lessonData = {
      profile_id: id,
      title: "Lezione di Guida",
      description: "Lezione di Guida",
      amount_hours: 1,
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(lessonData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      // Refetch lessons
      await fetchProfileLessons(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Update the deleteLesson function similarly
  const deleteLesson = async (id: string, profileId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lessons?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }

      // Refetch lessons
      await fetchProfileLessons(profileId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Loading handling
  if (loading && !profile) return <div>Loading...</div>;

  // Error handling
  if (error)
    return (
      <div className="flex justify-center items-center h-screen mt-[-6rem]">
        <div className="text-black">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto py-6 space-y-6 sm:py-0">
      <h1 className="text-3xl font-bold tracking-tight sm:text-xl dark:text-slate-100">
        Modifica Utente
      </h1>

      {showConfirmAlert && (
        <div className="rounded-lg bg-green-100 dark:bg-green-900 p-4 text-green-700 dark:text-green-100 flex justify-between items-center">
          <p>Profilo aggiornato con successo!</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmAlert(false)}
            className="dark:bg-white dark:text-green-900 dark:border-green-700 dark:hover:bg-green-50">
            Chiudi
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        {/* User data card */}
        <Card className="md:w-1/3 dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <div className="flex flex-row items-center gap-4">
              <div>
                <Avatar
                  size="sm"
                  navbar={true}
                  userEditForm={true}
                  sourceUrl={profile?.full_avatar_url}
                  lessonsCount={lessonsCount || 0}
                />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                  Dati utente
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground dark:text-slate-400">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Modifica le informazioni del profilo utente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personal Information */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_utente" className="dark:text-slate-100">Nome Completo</Label>
                  <Input
                    id="nome_utente"
                    value={profile?.nome_utente || ""}
                    onChange={(e) =>
                      handleFieldChange("nome_utente", e.target.value)
                    }
                    className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-slate-100">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ""} 
                    disabled 
                    className="dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="dark:text-slate-100">Telefono</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+41 XX XXX XX XX"
                    className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_hours" className="dark:text-slate-100">Totale Ore</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    min="0"
                    step="1"
                    value={profile?.total_hours || 0}
                    onChange={(e) =>
                      handleFieldChange("total_hours", Number(e.target.value))
                    }
                    className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenza_date" className="dark:text-slate-100">Data rilascio LAC</Label>
                <Input
                  id="licenza_date"
                  type="date"
                  value={
                    profile?.licenza_date
                      ? new Date(profile.licenza_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleFieldChange("licenza_date", e.target.value)
                  }
                  className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Checkboxes section */}
            <div className="border rounded-lg p-4 space-y-4 dark:border-slate-700">
              <h3 className="text-lg font-medium dark:text-slate-100">Status & Certificazioni</h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    disabled={true}
                    id="admin"
                    checked={profile?.admin || false}
                    onCheckedChange={(checked) =>
                      handleFieldChange("admin", checked)
                    }
                    className="dark:border-slate-600"
                  />
                  <Label htmlFor="admin" className="dark:text-slate-100">Amministratore</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sensibilizzazione"
                    checked={profile?.sensibilizzazione || false}
                    onCheckedChange={(checked) =>
                      handleFieldChange("sensibilizzazione", checked)
                    }
                    className="dark:border-slate-600"
                  />
                  <Label htmlFor="sensibilizzazione" className="dark:text-slate-100">Sensibilizzazione</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soccorritori"
                    checked={profile?.soccorritori || false}
                    onCheckedChange={(checked) =>
                      handleFieldChange("soccorritori", checked)
                    }
                    className="dark:border-slate-600"
                  />
                  <Label htmlFor="soccorritori" className="dark:text-slate-100">Soccorritori</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={updateProfile}
              disabled={loading}
              className="w-full dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100">
              {loading ? "Salvando..." : "Salva Profilo"}
            </Button>
          </CardFooter>
        </Card>

        {/* Lessons card */}
        <Card className="w-full md:w-2/3 dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-slate-100">
              Lezioni
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground dark:text-slate-400">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Elenco delle lezioni registrate per questo utente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lessons && lessons.length > 0 ? (
              <LessonsTable
                lessons={lessons}
                profile={profile}
                createLesson={createLesson}
                deleteLesson={deleteLesson}
                id={id as any}
              />
            ) : (
              <NoLessons
                lessons={lessons}
                profile={profile}
                createLesson={createLesson}
                id={id as any}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground dark:text-slate-400">
                Totale ore:{" "}
                {/* <span className="font-medium dark:text-slate-100">{profile?.total_hours || 0}</span> */}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
