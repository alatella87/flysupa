import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useState } from "react";
import { Profile, Lesson, LessonsTableProps } from "@/types";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LessonsTable({
  id,
  profile,
  lessons,
  createLesson,
  deleteLesson,
}: LessonsTableProps) {
  
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{ id: string, profileId: string } | null>(null);

  return (
    <>
      <Button
        onClick={() => createLesson(id)}
        className="p-2 mb-6 dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
        variant={"secondary"}>
        + Aggiungi Lezione
      </Button>
      <Table>
        <TableCaption className="dark:text-slate-400">
          Lezioni registrate per {profile?.nome_utente}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="dark:text-slate-100">Data</TableHead>
            <TableHead className="dark:text-slate-100">Ora</TableHead>
            <TableHead className="text-right dark:text-slate-100">Argomenti</TableHead>
            <TableHead className="text-right dark:text-slate-100">Actions</TableHead>
            <TableHead className="w-[100px] text-right dark:text-slate-100">
              <Badge variant={"outline"} className="dark:border-slate-600 dark:text-slate-100">id</Badge>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson) => (
              <TableRow key={lesson.id} className="dark:border-slate-700">
                <TableCell className="dark:text-slate-100">
                  {lesson.date ? (
                    new Date(lesson.date).toLocaleString("default", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })) : <Badge variant={"outline"} className="dark:border-slate-600 dark:text-slate-100">tbd</Badge>
                  }
                </TableCell>
                <TableCell className="dark:text-slate-100">
                  {lesson.time ? (
                    new Date(`1970-01-01T${lesson.time}`).toLocaleTimeString("default", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  ) : (
                    <Badge variant={"outline"} className="dark:border-slate-600 dark:text-slate-100">tbd</Badge>
                  )}
                </TableCell>

                <TableCell className="text-right dark:text-slate-100">
                  {lesson.details && lesson.details.length > 0 ? (
                    <>
                      {lesson.details.map((detail, index) => (
                        <Badge
                          key={index}
                          className={clsx(
                            "ml-2",
                            !detail.completion_degree && "bg-[#aeaeae] dark:bg-white dark:text-slate-900",
                            detail.completion_degree === "Trained" &&
                              "bg-orange-500 dark:bg-orange-400",
                            detail.completion_degree === "Mastered" &&
                              "bg-[#0d580d] dark:bg-green-500"
                          )}>
                          {detail.lesson_item_id}
                        </Badge>
                      ))}
                    </>
                  ) : (
                    <span>N/A</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-2 dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
                      onClick={() =>
                        navigate(`/edit-lesson/${lesson?.id}`, {
                          state: { selectedLessons: lesson },
                        })
                      }>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
                      onClick={() => {
                        setLessonToDelete({ 
                          id: lesson.id, 
                          profileId: profile?.id as string 
                        });
                        setIsDeleteDialogOpen(true);
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
                        strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={"outline"} className="dark:border-slate-600 dark:text-slate-100">{lesson.id}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center dark:text-slate-400">
                Nessuna lezione disponibile
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">Conferma eliminazione</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Sei sicuro di voler cancellare la lezione {lessonToDelete?.id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
            >
              Annulla
            </Button>
            <Button
              type="button" 
              variant="destructive"
              className="dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
              onClick={() => {
                if (lessonToDelete) {
                  deleteLesson(lessonToDelete.id, lessonToDelete.profileId);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function NoLessons({
  profile,
  lessons,
  createLesson,
  id,
}: {
  profile: Profile | null;
  lessons: any;
  createLesson: (id: string) => void;
  id: string;
}) {
  return (
    <div className="text-left py-4 text-muted-foreground dark:text-slate-400">
      <Button
        onClick={() => createLesson(id)}
        className="p-2 dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
        size={"sm"}
        variant={"secondary"}>
        Aggiungi Lezione
      </Button>
    </div>
  );
}

export function LoadingLessons() {
  return <div className="text-center py-4">Caricamento lezioni...</div>;
}