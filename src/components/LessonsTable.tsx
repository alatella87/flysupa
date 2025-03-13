import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useState } from "react";
import { Profile, Lesson, LessonsTableProps, LessonItem } from "@/types";
import { supabase } from "../services/supabaseClient.tsx";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { ChevronDown, ChevronRight, X, Plus } from "lucide-react";

export default function LessonsTable({
  id,
  profile,
  lessons,
  lessonsCount,
  createLesson,
  deleteLesson,
  refetchLessons,
}: LessonsTableProps) {

  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{ id: string, profileId: string } | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [availableItems, setAvailableItems] = useState<LessonItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isItemListOpen, setIsItemListOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle row expansion
  const toggleRowExpansion = (lessonId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  // Fetch available lesson items with their completion status across all lessons
  const fetchAvailableItems = async (lessonId: string) => {
    try {
      // First fetch all available items
      const { data: allItems, error: itemsError } = await supabase
        .from("lessons_items")
        .select("*");

      if (itemsError) {
        console.error("Error fetching available items:", itemsError.message);
        return;
      }
      
      if (!allItems) {
        setAvailableItems([]);
        return;
      }
      
      // Fetch ALL lesson item associations to get completion degrees from any lesson
      const { data: allAssociations, error: allAssociationsError } = await supabase
        .from("lesson_item_associations")
        .select("lesson_id, lesson_item_id, completion_degree")
        .or(`completion_degree.eq.Trained,completion_degree.eq.Mastered`);
        
      if (allAssociationsError) {
        console.error("Error fetching all associations:", allAssociationsError.message);
        setAvailableItems(allItems);
        return;
      }
      
      // Then fetch existing associations for this specific lesson to mark current items
      const { data: currentLessonAssociations, error: currentAssociationsError } = await supabase
        .from("lesson_item_associations")
        .select("lesson_item_id, completion_degree")
        .eq("lesson_id", lessonId);
        
      if (currentAssociationsError) {
        console.error("Error fetching current associations:", currentAssociationsError.message);
      }
      
      // Create a map of item_id to completion_degree for current lesson
      const currentLessonCompletionMap: Record<string, string | null> = {};
      if (currentLessonAssociations) {
        currentLessonAssociations.forEach(assoc => {
          currentLessonCompletionMap[assoc.lesson_item_id] = assoc.completion_degree;
        });
      }
      
      // Create a map of item_id to its best completion degree across all lessons
      const globalCompletionMap: Record<string, {degree: string | null, lessonId: string | null}> = {};
      if (allAssociations) {
        allAssociations.forEach(assoc => {
          const currentBest = globalCompletionMap[assoc.lesson_item_id];
          // Prioritize "Mastered" over "Trained" degree
          if (!currentBest || 
              (assoc.completion_degree === "Mastered" && currentBest.degree !== "Mastered")) {
            globalCompletionMap[assoc.lesson_item_id] = {
              degree: assoc.completion_degree,
              lessonId: assoc.lesson_id
            };
          }
        });
      }
      
      // Merge the completion degrees into the items
      const itemsWithCompletion = allItems.map(item => ({
        ...item,
        // Use current lesson completion degree if exists, otherwise null
        completion_degree: currentLessonCompletionMap[item.id] || null,
        // Include global completion status separate from the current lesson
        global_completion: globalCompletionMap[item.id] || { degree: null, lessonId: null }
      }));
      
      setAvailableItems(itemsWithCompletion);
    } catch (err) {
      console.error("Error in fetchAvailableItems:", err);
    }
  };

  // Open add item dialog
  const openAddItemDialog = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    await fetchAvailableItems(lessonId);
    setIsAddItemOpen(true);
    
    // Reset input field and ensure it doesn't get focus when opened
    setInputValue("");
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }, 50);
  };

  // Cycle through completion degrees: null -> Trained -> Mastered -> null
  const cycleCompletionDegree = (currentDegree: string | null): string | null => {
    if (!currentDegree) return "Trained";
    if (currentDegree === "Trained") return "Mastered";
    return null; // From Mastered back to null
  };

  // Update completion degree
  const updateCompletionDegree = async (lessonId: string, lessonItemId: string, currentDegree: string | null) => {
    // Prevent multiple clicks while updating
    const updateKey = `${lessonId}-${lessonItemId}`;
    if (updating === updateKey) return;

    setUpdating(updateKey);

    try {
      // Get next completion degree in the cycle
      const newCompletionDegree = cycleCompletionDegree(currentDegree);

      // Prepare updates object
      const updates = {
        completion_degree: newCompletionDegree
      };

      // Use Supabase client for the update
      const { error } = await supabase
        .from('lesson_item_associations')
        .update(updates)
        .match({
          lesson_id: lessonId,
          lesson_item_id: lessonItemId
        });

      if (error) {
        console.error('Error updating completion degree:', error);
        return;
      }

      // Refresh the lessons data
      if (profile?.id) {
        if (refetchLessons) {
          // Use the provided refetch function if available
          await refetchLessons(profile.id);
        } else {
          // Fallback to local refresh
          await fetchLessonDetails(lessonId);
        }
      }

    } catch (err) {
      console.error('Error in updateCompletionDegree:', err);
    } finally {
      setUpdating(null);
    }
  };

  // Fetch updated lesson details
  const fetchLessonDetails = async (lessonId: string) => {
    try {
      // First get the lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        console.error('Error fetching lesson:', lessonError);
        return;
      }

      // Then get the lesson details
      const { data: detailsData, error: detailsError } = await supabase
        .from('lesson_item_details_view')
        .select('*')
        .eq('lesson_id', lessonId);

      if (detailsError) {
        console.error('Error fetching lesson details:', detailsError);
        return;
      }

      // Update the lesson in the lessons array
      const updatedLesson = { ...lessonData, details: detailsData };

      // Update the lessons state
      const lessonIndex = lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1) {
        const updatedLessons = [...lessons];
        updatedLessons[lessonIndex] = updatedLesson;
        // We would need to set lessons here, but since it's passed as a prop,
        // we need to lift this state up to the parent component or use context
        // For now, we'll just rerender the component
        forceUpdate();
      }
    } catch (err) {
      console.error('Error fetching lesson details:', err);
    }
  };

  // Force component update
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Function to associate a single item to a lesson
  const associateItemToLesson = async (lessonId: string, itemId: string) => {
    if (!lessonId || !itemId) return;

    try {
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

      // Refresh lessons data
      if (profile?.id && refetchLessons) {
        await refetchLessons(profile.id);
      }

      return data;
    } catch (err) {
      console.error("Error in associateItemToLesson:", err);
      return null;
    }
  };

  // Function to remove an item association
  const removeItemAssociation = async (lessonId: string, itemId: string) => {
    if (!lessonId || !itemId) return;
    
    // Prevent multiple clicks while updating
    const updateKey = `${lessonId}-${itemId}`;
    if (updating === updateKey) return;

    setUpdating(updateKey);
    
    try {
      const { error } = await supabase
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

      console.log("Item association removed successfully");
      
      // Refresh lessons data
      if (profile?.id && refetchLessons) {
        await refetchLessons(profile.id);
      } else {
        // Local refresh as fallback
        await fetchLessonDetails(lessonId);
      }
      
    } catch (err) {
      console.error("Error in removeItemAssociation:", err);
    } finally {
      setUpdating(null);
    }
  };

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
            <TableHead className="dark:text-slate-100">Ora</TableHead>w
            <TableHead className="text-right dark:text-slate-100">
              Argomenti
            </TableHead>
            <TableHead className="text-right dark:text-slate-100">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson: any) => (
              <React.Fragment key={lesson.id}>
                <TableRow
                  className={clsx(
                    "dark:border-slate-700 cursor-pointer",
                    expandedRows[lesson.id] && "bg-muted dark:bg-slate-800/50"
                  )}
                  onClick={() => toggleRowExpansion(lesson.id)}>
                  <TableCell className="dark:text-slate-100">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {expandedRows[lesson.id] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                      {lesson.date ? (
                        new Date(lesson.date).toLocaleString("default", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })
                      ) : (
                        <Badge
                          variant={"outline"}
                          className="dark:border-slate-600 dark:text-slate-100">
                          tbd
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-slate-100">
                    {lesson.time ? (
                      new Date(`1970-01-01T${lesson.time}`).toLocaleTimeString(
                        "default",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )
                    ) : (
                      <Badge
                        variant={"outline"}
                        className="dark:border-slate-600 dark:text-slate-100">
                        tbd
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge
                      variant={"outline"}
                      className="dark:border-slate-600 dark:text-slate-100">
                      {lesson.id}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right dark:text-slate-100">
                    {lesson.details && lesson.details.length > 0 ? (
                      <>
                        <span className="text-xs text-muted-foreground dark:text-slate-400">
                          {lesson.details.length} argomenti
                        </span>
                      </>
                    ) : (
                      <span>N/A</span>
                    )}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mr-2 dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
                        onClick={() =>
                          navigate(`/edit-lesson/${lesson?.id}`, {
                            state: {
                              profileId: profile?.id,
                            },
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setLessonToDelete({
                            id: lesson.id,
                            profileId: profile?.id as string,
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
                </TableRow>

                {/* Expanded content row */}
                {expandedRows[lesson.id] && (
                  <TableRow className="dark:border-slate-700 dark:bg-slate-800/20">
                    <TableCell colSpan={5} className="py-2">
                      <div className="ml-2 dark:border-slate-700 py-2">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium dark:text-slate-100">
                            Dettagli argomenti
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                          {lesson.details?.length > 0
                            ? lesson.details
                                .slice() // Create a copy to avoid mutating the original array
                                .sort(
                                  (a, b) => a.lesson_item_id - b.lesson_item_id
                                ) // Sort by lesson_item_id
                                .map((detail: any, index: number) => (
                                  <div
                                    key={index}
                                    className={clsx(
                                      "flex items-center bg-muted p-2 rounded dark:bg-slate-800 cursor-pointer transition-all",
                                      updating ===
                                        `${lesson.id}-${detail.lesson_item_id}` &&
                                        "opacity-50",
                                      !updating &&
                                        "hover:bg-slate-200 dark:hover:bg-slate-700"
                                    )}
                                    onClick={() =>
                                      updateCompletionDegree(
                                        lesson.id,
                                        detail.lesson_item_id,
                                        detail.completion_degree
                                      )
                                    }>
                                    <Badge
                                      className={clsx(
                                        "mr-2",
                                        !detail.completion_degree &&
                                          "bg-[#aeaeae] dark:bg-white dark:text-slate-900",
                                        detail.completion_degree ===
                                          "Trained" &&
                                          "bg-orange-500 dark:bg-orange-400",
                                        detail.completion_degree ===
                                          "Mastered" &&
                                          "bg-[#0d580d] dark:bg-green-500"
                                      )}>
                                      {detail.lesson_item_id}
                                    </Badge>
                                    <span className="text-xs truncate dark:text-slate-300">
                                      {detail.title || "Argomento"}
                                    </span>
                                    {updating ===
                                    `${lesson.id}-${detail.lesson_item_id}` ? (
                                      <span className="ml-auto text-xs animate-pulse dark:text-slate-400">
                                        Updating...
                                      </span>
                                    ) : (
                                      <div className="ml-auto flex items-center gap-2">
                                        {detail.completion_degree && (
                                          <Badge
                                            className="text-xs"
                                            variant="outline">
                                            {detail.completion_degree}
                                          </Badge>
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeItemAssociation(
                                              lesson.id,
                                              detail.lesson_item_id
                                            );
                                          }}>
                                          <X className="h-3 w-3 font-black" />
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                ))
                            : null}

                          <Button
                            size="icon"
                            variant="outline"
                            className="flex w-full items-center bg-muted p-2 rounded bg-gray-400 text-white dark:bg-slate-800 cursor-pointer transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddItemDialog(lesson.id);
                            }}>
                            Aggiungi
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center dark:text-slate-400">
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
            <DialogTitle className="dark:text-slate-100">
              Conferma eliminazione
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Sei sicuro di voler cancellare la lezione {lessonToDelete?.id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100">
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
              }}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">
              Aggiungi Argomento
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Seleziona un argomento da aggiungere alla lezione.
              <span className="block mt-1 text-amber-500 dark:text-amber-400 text-sm">
                Gli argomenti già "Trained" (arancione) o "Mastered" (verde)
                sono mostrati in una sezione dedicata.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Command className="overflow-visible bg-transparent">
              <div className="group border border-input dark:border-slate-700 rounded-md px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <CommandPrimitive.Input
                  ref={inputRef}
                  value={inputValue}
                  onValueChange={setInputValue}
                  onBlur={() => setIsItemListOpen(false)}
                  onFocus={() => setIsItemListOpen(true)}
                  placeholder="Cerca..."
                  readOnly={true}
                  onClick={() => {
                    setIsItemListOpen(true);
                    if (inputRef.current) {
                      // Remove readonly attribute when clicked, but not on mobile/tablet
                      if (window.innerWidth > 768) {
                        inputRef.current.readOnly = false;
                      }
                    }
                  }}
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground dark:text-slate-100 dark:placeholder:text-slate-400 no-select no-keyboard-mobile"
                />
              </div>
              <div className="relative mt-2">
                <CommandList>
                  {isItemListOpen && availableItems.length > 0 ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border dark:border-slate-700 bg-popover dark:bg-slate-900 text-popover-foreground shadow-md outline-none animate-in">
                      <CommandGroup className="h-[250px] overflow-auto">
                        {/* Show normal unassigned items first */}
                        {availableItems
                          .filter(
                            (item) =>
                              item.title &&
                              String(item.title)
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) &&
                              !item.completion_degree &&
                              !item.global_completion?.degree
                          )
                          .sort((a, b) => Number(a.id) - Number(b.id))
                          .map((item) => (
                            <CommandItem
                              key={item.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onSelect={async () => {
                                setInputValue("");
                                if (selectedLessonId) {
                                  await associateItemToLesson(
                                    selectedLessonId,
                                    item.id
                                  );
                                  setIsAddItemOpen(false); // Close dialog after adding
                                }
                              }}
                              className="cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800 dark:aria-selected:bg-slate-800">
                              <div className="flex items-center w-full">
                                <span>
                                  {item.id} - {item.title}
                                </span>
                              </div>
                            </CommandItem>
                          ))}

                        {/* Add a divider and header for items already assigned to THIS lesson */}
                        {availableItems.some(
                          (item) =>
                            item.completion_degree &&
                            String(item.title)
                              .toLowerCase()
                              .includes(inputValue.toLowerCase())
                        ) && (
                          <div className="py-2 px-2 text-xs font-medium text-muted-foreground dark:text-slate-500 border-t dark:border-slate-700">
                            Argomenti già assegnati in questa lezione
                          </div>
                        )}

                        {/* Show items already assigned to THIS lesson */}
                        {availableItems
                          .filter(
                            (item) =>
                              item.title &&
                              String(item.title)
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) &&
                              item.completion_degree
                          )
                          .sort((a, b) => Number(a.id) - Number(b.id))
                          .map((item) => (
                            <CommandItem
                              key={item.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onSelect={async () => {
                                setInputValue("");
                                if (selectedLessonId) {
                                  await associateItemToLesson(
                                    selectedLessonId,
                                    item.id
                                  );
                                  setIsAddItemOpen(false); // Close dialog after adding
                                }
                              }}
                              className="cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800 dark:aria-selected:bg-slate-800">
                              <div className="flex items-center w-full">
                                <span>
                                  {item.id} - {item.title}
                                </span>
                                {item.completion_degree && (
                                  <Badge
                                    className={clsx(
                                      "ml-auto",
                                      item.completion_degree === "Trained" &&
                                        "bg-orange-500 dark:bg-orange-400",
                                      item.completion_degree === "Mastered" &&
                                        "bg-[#0d580d] dark:bg-green-500"
                                    )}>
                                    {item.completion_degree}
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}

                        {/* Add a divider and header for items with global completion status (but not in this lesson) */}
                        {availableItems.some(
                          (item) =>
                            item.title &&
                            String(item.title)
                              .toLowerCase()
                              .includes(inputValue.toLowerCase()) &&
                            item.global_completion?.degree &&
                            !item.completion_degree
                        ) && (
                          <div className="py-2 px-2 text-xs font-medium text-muted-foreground dark:text-slate-500 border-t dark:border-slate-700">
                            Argomenti con stato in altre lezioni
                          </div>
                        )}

                        {/* Show items with global completion status but not in this lesson */}
                        {availableItems
                          .filter(
                            (item) =>
                              item.title &&
                              String(item.title)
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) &&
                              item.global_completion?.degree &&
                              !item.completion_degree
                          )
                          .sort((a, b) => {
                            // Sort by status (Mastered first, then Trained)
                            if (
                              a.global_completion?.degree === "Mastered" &&
                              b.global_completion?.degree !== "Mastered"
                            )
                              return -1;
                            if (
                              a.global_completion?.degree !== "Mastered" &&
                              b.global_completion?.degree === "Mastered"
                            )
                              return 1;
                            // Then by ID
                            return Number(a.id) - Number(b.id);
                          })
                          .map((item) => (
                            <CommandItem
                              key={item.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onSelect={async () => {
                                setInputValue("");
                                if (selectedLessonId) {
                                  await associateItemToLesson(
                                    selectedLessonId,
                                    item.id
                                  );
                                  setIsAddItemOpen(false); // Close dialog after adding
                                }
                              }}
                              className="cursor-pointer dark:text-slate-100 dark:hover:bg-slate-800 dark:aria-selected:bg-slate-800">
                              <div className="flex items-center w-full">
                                <span>
                                  {item.id} - {item.title}
                                </span>
                                {item.global_completion?.degree && (
                                  <Badge
                                    className={clsx(
                                      "ml-auto",
                                      item.global_completion.degree ===
                                        "Trained" &&
                                        "bg-orange-500 dark:bg-orange-400",
                                      item.global_completion.degree ===
                                        "Mastered" &&
                                        "bg-[#0d580d] dark:bg-green-500"
                                    )}>
                                    {item.global_completion.degree}
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </div>
                  ) : null}
                </CommandList>
              </div>
            </Command>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddItemOpen(false)}
              className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100">
              Annulla
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
