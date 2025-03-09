"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.tsx";
import { Profile, Lesson } from "@/types";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom Components
import LessonsTable, { NoLessons, LoadingLessons } from "./LessonsTable";


export default function UserEditForm() {
  const { id } = useParams<{ id: string }>(); // Get user ID from URL
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState([]); // Initialize as an empty array
  const [loadingLessons, setLoadingLessons] = useState(true); // Initialize as true
  const [totalHours, setTotalHours] = useState<number>(); // Initialize as true

  // Profile fields that we want to display in our table
  const fieldDisplayNames: { [key: string]: string } = {
    nome_utente: "Nome Completo",
    email: "Email",
    phone: "Telefono",
    total_hours: "Totale Ore",
    licenza_date: "Data rilascio LAC",
    admin: "Amministratore",
    sensibilizzazione: "Sensibilizzazione",
    soccorritori: "Soccorritori",
  };

  const downloadAndSetAvatar = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      return url;
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  };

  // Use Effects
  useEffect(() => {
    if (!id) return;
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchProfileLessons(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const hours = lessons?.reduce(
      (total: number, lesson: any) => total + lesson.amount_hours,
      0
    );
    setTotalHours(hours);
  }, [lessons]);

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
        }/rest/v1/profiles_view?id=eq.${id}`,
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
          const avatarUrl = await downloadAndSetAvatar(profileData.avatar_url);
          profileData.full_avatar_url = avatarUrl;
        }
        setProfile(profileData);
      }
    } catch (err) {
      setError(err.message);
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
  
      setLessons(detailedLessons as any);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoadingLessons(false);
    }
  };
  


  // Fetch Items
  const fetchProfileLessonsItems = async (id: string) => {
    try {
      setLoadingLessons(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/lessons?profile_id=eq.${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }

      const data = await response.json();

      if (data.length > 0) {
        const lessonsData = data;
        setLessons(lessonsData);
        console.log("data", lessonsData);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Keep total hours in sync with lessons
  const calculateTotalHours = (lessons: Lesson[]) => {
    const hours = lessons.reduce(
      (total, lesson) => total + lesson.amount_hours,
      0
    );
    setTotalHours(hours);
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
          // Special processing for date fields
          if (key === "licenza_date" && value) {
            // For dates, ensure we handle ISO format properly
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              acc[key] = date.toISOString();
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

      console.log("Updating profile with:", updates);

      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/profiles_view?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setShowConfirmAlert(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Lesson
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
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // Optional, if you have RLS policies
          },
          body: JSON.stringify(lessonData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      const data = await response;
      console.log("createLesson", data);
    } catch (err) {
      setError(err.message);
    } finally {
      fetchProfileLessons(id);
    }
  };

  // Delete Lesson
  const deleteLesson = async (id: string, profileId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/lessons?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // Optional, if you have RLS policies
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }
      const data = await response;
      console.log("deleteLesson", data);
    } catch (err) {
      setError(err.message);
    } finally {
      fetchProfileLessons(profileId);
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
      <h1 className="text-3xl font-bold tracking-tight sm:text-xl">
        Modifica Utente
      </h1>

      {showConfirmAlert && (
        <div className="rounded-lg bg-green-100 p-4 text-green-700 flex justify-between items-center">
          <p>Profilo aggiornato con successo!</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmAlert(false)}>
            Chiudi
          </Button>
        </div>
      )}

      <div className="flex gap-6">
        {/* User data card */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                className="text-muted-foreground">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </CardTitle>
            <CardDescription>
              Modifica le informazioni del profilo utente
            </CardDescription>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profile?.full_avatar_url}
                alt={profile?.nome_utente || "User avatar"}
              />
              <AvatarFallback>
                {profile?.nome_utente
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personal Information */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_utente">Nome Completo</Label>
                  <Input
                    id="nome_utente"
                    value={profile?.nome_utente || ""}
                    onChange={(e) =>
                      handleFieldChange("nome_utente", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile?.email || ""} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_hours">Totale Ore</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    min="0"
                    step="1"
                    value={totalHours || 0}
                    onChange={(e) =>
                      handleFieldChange("total_hours", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenza_date">Data rilascio LAC</Label>
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
                />
              </div>
            </div>

            {/* Checkboxes section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Status & Certificazioni</h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    disabled={true}
                    id="admin"
                    checked={profile?.admin || false}
                    onCheckedChange={(checked) =>
                      handleFieldChange("admin", checked)
                    }
                  />
                  <Label htmlFor="admin">Amministratore</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sensibilizzazione"
                    checked={profile?.sensibilizzazione || false}
                    onCheckedChange={(checked) =>
                      handleFieldChange("sensibilizzazione", checked)
                    }
                  />
                  <Label htmlFor="sensibilizzazione">Sensibilizzazione</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soccorritori"
                    checked={profile?.soccorritori || false}
                    onCheckedChange={(checked) =>
                      handleFieldChange("soccorritori", checked)
                    }
                  />
                  <Label htmlFor="soccorritori">Soccorritori</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={updateProfile}
              disabled={loading}
              className="w-full">
              {loading ? "Salvando..." : "Salva Profilo"}
            </Button>
          </CardFooter>
        </Card>

        {/* Lessons card */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                className="text-muted-foreground">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </CardTitle>
            <CardDescription>
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
              <div className="text-sm text-muted-foreground">
                Totale ore:{" "}
                <span className="font-medium">{profile?.total_hours || 0}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
