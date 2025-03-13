import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "../hooks/useUser";
import { supabase } from "../services/supabaseClient";
import Avatar from "@/components/Avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UpcomingLesson {
  id: string;
  title: string;
  date: string;
  time: string;
  profile_id: string;
  profiles: {
    avatar_url: string;
    nome_utente: string;
  };
  processed_avatar_url?: string;
  isToday?: boolean;
  lessonsCount?: number; // Add property for lessons count
}

export default function Home() {
  const { user, isAdmin, downloadAndSetUserAvatar } = useUser();
  const navigate = useNavigate();
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to check if a date is today
  function checkIsToday(dateString: string): boolean {
    // Format both dates to YYYY-MM-DD format for reliable comparison
    const formattedLessonDate = dateString.split("T")[0];
    const formattedToday = new Date().toISOString().split("T")[0];

    return formattedLessonDate === formattedToday;
  }

  // Format a date with day of week
  function formatDate(dateString: string): string {
    if (!dateString) return "TBD";

    const dateObj = new Date(dateString);
    return dateObj.toLocaleString("default", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }

  // Format time
  function formatTime(timeString: string): string {
    if (!timeString) return "TBD";

    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
        "default",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      );
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  }

  // Function to fetch the total lessons count for a profile
  async function fetchLessonsCountForProfile(profileId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("id", { count: "exact" })
        .eq("profile_id", profileId);
        
      if (error) {
        console.error("Error counting lessons for profile:", error);
        return 0;
      }
      
      return data?.length || 0;
    } catch (error) {
      console.error("Error in fetchLessonsCountForProfile:", error);
      return 0;
    }
  }

  // Process a single lesson (handle avatar URL, today check, and lessons count)
  async function processLesson(
    lesson: UpcomingLesson
  ): Promise<UpcomingLesson> {
    try {
      const isTodayLesson = checkIsToday(lesson.date);
      const processedLesson = { ...lesson, isToday: isTodayLesson };

      // Process avatar if available
      if (lesson.profiles?.avatar_url) {
        try {
          const avatarUrl = await downloadAndSetUserAvatar(
            lesson.profiles.avatar_url
          );
          processedLesson.processed_avatar_url = avatarUrl;
        } catch (error) {
          console.error("Error processing avatar:", error);
        }
      }
      
      // Fetch and add the lessons count for this profile
      if (lesson.profile_id) {
        try {
          const lessonsCount = await fetchLessonsCountForProfile(lesson.profile_id);
          processedLesson.lessonsCount = lessonsCount;
        } catch (error) {
          console.error("Error fetching lessons count:", error);
        }
      }

      return processedLesson;
    } catch (error) {
      console.error("Error processing lesson:", error);
      return lesson;
    }
  }

  // Fetch all upcoming lessons
  async function fetchLessons() {
    setLoading(true);

    try {
      // Use gte to include today's lessons
      const { data, error } = await supabase
        .from("lessons")
        .select(
          `
          id,
          title,
          date,
          time,
          profile_id,
          profiles (avatar_url, nome_utente)
        `
        )
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log("Raw data from API:", data);

        // Process each lesson
        const processedLessons = await Promise.all(
          data.map((lesson) => processLesson(lesson as any))
        );

        setUpcomingLessons(processedLessons);

        // For debugging
        console.log("Today's date:", new Date().toISOString().split("T")[0]);
        console.log("Processed lessons:", processedLessons);
      } else {
        setUpcomingLessons([]);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchLessons();
    }
  }, [isAdmin]);

  // Group lessons
  const todayLessons = upcomingLessons.filter((lesson) => lesson.isToday);
  const futureLessons = upcomingLessons.filter((lesson) => !lesson.isToday);

  return (
    <div className="container flex flex-row justify-between mx-auto py-2 space-y-6">
      {user ? (
        isAdmin ? (
          <>
            <Card className="w-1/2 dark:border-slate-700 dark:bg-slate-900">
              <CardHeader>
                <h1 className="text-2xl font-bold tracking-tight dark:text-slate-100">
                  Prossime lezioni
                </h1>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 dark:text-slate-400">
                    Caricamento lezioni...
                  </div>
                ) : upcomingLessons.length > 0 ? (
                  <Table>
                    <TableCaption className="dark:text-slate-400">
                      Lista delle prossime lezioni
                    </TableCaption>
                    <TableHeader>
                      <TableRow className="dark:border-slate-700">
                        <TableHead className="dark:text-slate-100">
                          Student
                        </TableHead>
                        <TableHead className="dark:text-slate-100">
                          Date
                        </TableHead>
                        <TableHead className="dark:text-slate-100">
                          Time
                        </TableHead>
                        <TableHead className="text-right dark:text-slate-100">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Today's lessons */}
                      {todayLessons.length > 0 && (
                        <>
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="bg-muted dark:bg-slate-800 dark:border-slate-700">
                              <div className="font-semibold py-1 dark:text-slate-100">
                                Oggi
                              </div>
                            </TableCell>
                          </TableRow>
                          {todayLessons.map((lesson) => (
                            <TableRow
                              key={lesson.id}
                              className="dark:border-slate-700 dark:hover:bg-slate-800/50 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation(); 
                                navigate(`/user-edit/${lesson.profiles.profile_id}`)}}
                              title={`Click to view ${lesson.profiles?.nome_utente}'s profile`}
                            >
                              <TableCell className="font-medium dark:text-slate-100">
                                <div className="flex items-center gap-2">
                                  <Avatar
                                    size="sm"
                                    navbar={true}
                                    sourceUrl={
                                      lesson.processed_avatar_url || ""
                                    }
                                    lessonsCount={lesson.lessonsCount || 0}
                                  />
                                  <span>
                                    {lesson.profiles?.nome_utente || ""}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-slate-100">
                                {formatDate(lesson.date)}
                              </TableCell>
                              <TableCell className="dark:text-slate-100">
                                {formatTime(lesson.time)}
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="outline"
                                  className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/edit-lesson/${lesson?.id}`, {
                                      state: {
                                        profile: lesson.profiles,
                                      },
                                    });
                                  }}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  Modifica
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      )}

                      {/* Future lessons */}
                      {futureLessons.length > 0 && (
                        <>
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="bg-muted dark:bg-slate-800 dark:border-slate-700">
                              <div className="font-semibold py-1 dark:text-slate-100">
                                Prossimamente
                              </div>
                            </TableCell>
                          </TableRow>
                          {futureLessons.map((lesson) => (
                            <TableRow
                              key={lesson.id}
                              className="dark:border-slate-700 dark:hover:bg-slate-800/50 cursor-pointer"
                              onClick={() => navigate(`/user-edit/${lesson.profile_id}`)}
                              title={`Click to view ${lesson.profiles?.nome_utente}'s profile`}
                            >
                              <TableCell className="font-medium dark:text-slate-100">
                                <div className="flex items-center gap-2">
                                  <Avatar
                                    size="sm"
                                    navbar={true}
                                    sourceUrl={
                                      lesson.processed_avatar_url || ""
                                    }
                                    lessonsCount={lesson.lessonsCount || 0}
                                  />
                                  <span>
                                    {lesson.profiles?.nome_utente ||
                                      "Unknown Student"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="dark:text-slate-100">
                                {formatDate(lesson.date)}
                              </TableCell>
                              <TableCell className="dark:text-slate-100">
                                {formatTime(lesson.time)}
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="outline"
                                  className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/edit-lesson/${lesson.id}`);
                                  }}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  Modifica
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 dark:text-slate-400">
                    No upcoming lessons found
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center p-6">
              <h2 className="text-xl font-semibold mb-4">
                Welcome back, {user.email}
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                Access your lesson history and upcoming schedule
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-8 bg-white">
            <Link
              className="font-semibold text-foreground hover:text-primary mb-6 transition-colors"
              to="/home">
              Scuola Guida Lugano
            </Link>
            <p className="text-lg text-center mb-8">
              Benvenuto nel tuo spazio digitale di Scuola Guida Lugano
            </p>

            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild variant="default" size="lg">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
