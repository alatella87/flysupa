"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient.tsx";
import { Lesson, LessonItem, Profile } from "@/types";
import { DateTimePicker24h } from "@/components/DateTimerPicker.tsx";
import { X, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/Avatar";

export default function EditLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Handling props via state parameters originating from the useNavigate in LessonsTable.tsx
  const location = useLocation();

  const [lessonsCount, setLessonsCount] = useState<number>(0);
  const [lesson, setLesson] = useState<Lesson>();
  
  const [profile, setProfile] = useState<Profile>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [selected, setSelected] = useState<LessonItem[]>([]);
  const [availableItems, setAvailableItems] = useState<LessonItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  const [open, setOpen] = useState(false);

  const handleUnselect = useCallback(
    async (item: LessonItem) => {
      // Update UI immediately for better UX
      setSelected((prev) => prev.filter((s) => s.id !== item.id));

      // Remove the association from the database
      if (lesson?.id) {
        await removeItemAssociation(lesson.id, item.id);
      }
    },
    [lesson?.id]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setSelected((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    []
  );

  async function fetchLessonById(id: any) {
    const cachedData = localStorage.getItem(`lesson_${id}`);
    if (cachedData) {
      setLesson(JSON.parse(cachedData));
      return;
    }

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lesson:", error.message);
      return null;
    }

    localStorage.setItem(`lesson_${id}`, JSON.stringify(data));
    setLesson(data);
  }

  async function fetchAvailableItems() {
    const { data, error } = await supabase
    .from("lessons_items")
    .select("*");

    if (error) {
      console.error("Error fetching available items:", error.message);
      return null;
    }
    setAvailableItems(data);
  }

  // Function to associate a single item to a lesson
  async function associateItemToLesson(lessonId: string, itemId: string) {
    const association = {
      lesson_id: lessonId,
      lesson_item_id: itemId,
    };

    const { data, error } = await supabase
      .from("lesson_item_associations")
      .insert([association]);

    if (error) {
      console.error("Error associating item to lesson:", error.message);
      return null;
    }

    console.log("Item associated successfully:", data);
    return data;
  }

  // Function to remove an item association
  async function removeItemAssociation(lessonId: string, itemId: string) {
    const { data, error } = await supabase
      .from("lesson_item_associations")
      .delete()
      .match({
        lesson_id: lessonId,
        lesson_item_id: itemId,
      });

    if (error) {
      console.error("Error removing item association:", error.message);
      return null;
    }

    console.log("Item association removed successfully:", data);
    return data;
  }

  // Function to fetch existing associations for this lesson
  async function fetchExistingAssociations(lessonId: string) {
    const { data, error } = await supabase
      .from("lesson_item_associations")
      .select("*, lessons_items!lesson_item_id(*)")
      .eq("lesson_id", lessonId);

    if (error) {
      console.error("Error fetching existing associations:", error.message);
      return;
    }

    if (data && data.length > 0) {
      // Extract the lesson items from the associations and set them as selected
      const selectedItems = data.map(
        (association) => association.lessons_items
      );
      setSelected(selectedItems);
    }
  }
  
  async function fetchLessonsCount(lessonId: string) {
    // Step 1: Retrieve the profile_id from the lessons table
    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("profile_id")
      .eq("id", lessonId)
      .single();

    if (lessonError) {
      console.error("Error fetching lesson:", lessonError);
    } else {
      const profileId = lessonData.profile_id;

      // Step 2: Count the total lessons assigned to the retrieved profile_id
      const { data: lessonsCountData, error: countError } = await supabase
        .from("lessons")
        .select("id", { count: "exact" })
        .eq("profile_id", profileId);

      if (countError) {
        console.error("Error counting lessons:", countError);
      } else {
        console.log(
          "Total lessons assigned to the profile:",
          lessonsCountData.length
        );
        setLessonsCount(lessonsCountData.length)
      }
    }
  }

  async function fetchProfileFromLessonId(lessonId: string) {

    // API call to get the profile data linked to the specified lessonId
    const { data: profileData, error } = await supabase
      .from('lessons')
      .select(`
        profiles(*)
      `)
      .eq('id', lessonId)
      .single();
    
    if (error) {
      console.error('Error fetching profile data:', error);
    } else {
      setProfile(profileData.profiles as any);
      getAvatarUrl(profileData.profiles.avatar_url)
    }
  }

  async function getAvatarUrl(path: any) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
  
      if (error) throw error;
  
      const url = URL.createObjectURL(data);
      console.log('error', url)

      setAvatarUrl(url);
    } catch (error) {
      console.log('error', error)
    }
  }


  // Add no-select class to body when component is active
  useEffect(() => {
    // Add the no-select class to prevent text selection in mobile
    document.body.classList.add('no-select');
    
    // Return cleanup function
    return () => {
      document.body.classList.remove('no-select');
    };
  }, []);
  
  useEffect(() => {
    if (!id) return;
    fetchProfileFromLessonId(id);
    fetchLessonById(id);
    fetchAvailableItems();
    fetchExistingAssociations(id);
    fetchLessonsCount(id);
  }, [id]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight dark:text-slate-100">
            Modifica Lezione
          </h1>
          {lesson && lesson.id && (
            <Badge
              className="ml-2 mt-1.5 dark:border-slate-700 dark:text-slate-100"
              variant="outline">
              {lesson.id}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="flex-0 min-w-[250px] dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Studente</CardTitle>
            <CardDescription className="dark:text-slate-400">
              {/* {profile.nome_utente} */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile && (
              <Avatar
                size="sm"
                navbar={true}
                userEditForm={true}
                sourceUrl={avatarUrl}
                lessonsCount={lessonsCount || 0}
              />
            )}
          </CardContent>
        </Card>
        <Card className="flex-0 min-w-[250px] dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Data</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Data della lezione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DateTimePicker24h lessonId={lesson?.id as string} />
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[250px] dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Contenuto</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Temi e argomenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command
              onKeyDown={handleKeyDown}
              className="overflow-visible bg-transparent select-none">
              <div className="group border border-input dark:border-slate-700 rounded-md px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                  {selected.map((item) => {
                    return (
                      <Badge
                        key={item.id}
                        variant="secondary"
                        className="text-md dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                        {item.id} - {item.title}
                        <button
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUnselect(item);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => handleUnselect(item)}>
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-slate-100" />
                        </button>
                      </Badge>
                    );
                  })}
                  <CommandPrimitive.Input
                    ref={inputRef}
                    value={inputValue}
                    onValueChange={setInputValue}
                    onBlur={() => setOpen(false)}
                    onFocus={() => setOpen(true)}
                    placeholder="Seleziona..."
                    autoFocus={false}
                    readOnly={true}
                    onClick={() => {
                      setOpen(true);
                      if (inputRef.current) {
                        // Remove readonly attribute when clicked, but not on mobile/tablet
                        if (window.innerWidth > 768) {
                          inputRef.current.readOnly = false;
                        }
                      }
                    }}
                    className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground dark:text-slate-100 dark:placeholder:text-slate-400 no-select no-keyboard-mobile"
                  />
                </div>
              </div>
              <div className="relative mt-2">
                <CommandList>
                  {open && availableItems.length > 0 ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border dark:border-slate-700 bg-popover dark:bg-slate-900 text-popover-foreground shadow-md outline-none animate-in">
                      <CommandGroup className="h-[250px] overflow-auto select-none">
                        {availableItems
                          .filter(
                            (item) => !selected.some((s) => s.id === item.id)
                          )
                          .sort((a, b) => a.id - b.id)
                          .map((item) => {
                            return (
                              <CommandItem
                                key={item.id}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onSelect={async (value) => {
                                  setInputValue("");
                                  setSelected((prev) => [...prev, item]);
                                  await associateItemToLesson(
                                    lesson?.id as string,
                                    item.id
                                  );
                                }}
                                className="cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800 dark:aria-selected:bg-slate-800 select-none">
                                {item.id} - {item.title}
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                    </div>
                  ) : null}
                </CommandList>
              </div>
            </Command>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}