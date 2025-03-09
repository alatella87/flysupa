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
        className="p-2 mb-6"
        variant={"secondary"}>
        + Aggiungi Lezione
      </Button>
      <Table>
        <TableCaption>
          Lezioni registrate per {profile?.nome_utente}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Ora</TableHead>
            <TableHead className="text-right">Argomenti</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            <TableHead className="w-[100px] text-right">
              <Badge variant={"outline"}>id</Badge>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  {lesson.date ? (
                    new Date(lesson.date).toLocaleString("default", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })) : <Badge variant={"outline"}>tbd</Badge>
                  }
                </TableCell>
                <TableCell>
                  {lesson.time ? (
                    new Date(`1970-01-01T${lesson.time}`).toLocaleTimeString("default", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  ) : (
                    <Badge variant={"outline"}>tbd</Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {lesson.details && lesson.details.length > 0 ? (
                    <>
                      {lesson.details.map((detail, index) => (
                        <Badge
                          key={index}
                          className={clsx(
                            "ml-2",
                            !detail.completion_degree && "bg-[#aeaeae]",
                            detail.completion_degree === "Trained" &&
                              "bg-orange-500",
                            detail.completion_degree === "Mastered" &&
                              "bg-[#0d580d]"
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
                      className="mr-2"
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
                  <Badge variant={"outline"}>{lesson.id}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nessuna lezione disponibile
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler cancellare la lezione {lessonToDelete?.id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button
              type="button" 
              variant="destructive"
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
    <div className="text-left py-4 text-muted-foreground">
      <Button
        onClick={() => createLesson(id)}
        className="p-2"
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