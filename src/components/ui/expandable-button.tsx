"use client";

import { useState } from "react";
import { Button } from "./button";
import { Save } from "lucide-react";
import { DateTimePicker24h } from "../DateTimerPicker";
import { X } from "lucide-react";
import { Plus } from "lucide-react";
import { Input } from "./input";

interface ExpandableButtonProps {
  profileId?: string;
  refetch: any;
}

export default function ExpandableButton({
  profileId,
  refetch,
}: ExpandableButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [amountHours, setAmoutHours] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      handleCreateLesson();
    }
  };

  const handleCreateLesson = async () => {
    if (isCreating) return;
    setIsCreating(true);

    // Format the date for database update (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Format the time for database update (HH:MM:00)
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const formattedTime = `${hour}:${minute}:00`;

    // Create lesson data
    const lessonData = {
      date: formattedDate,
      time: formattedTime,
      profile_id: profileId,
      amount_hours: amountHours,
    };

    // POST/Create lesson
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

      // ToDo: Refetch lessons
      await refetch(profileId);
    } catch (err: unknown) {
      console.error("Failed to create lesson:", err);
    } finally {
      setIsCreating(false);
      setIsExpanded(false);
    }
  };

  const handleDateTimeSelect = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  const resetForm = () => {
    setDate(new Date());
    setIsExpanded(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleClick}
        onSubmit={handleCreateLesson}
        disabled={isCreating}
        className="flex items-center justify-center gap-1 h-8 dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
        size="sm"
        variant="secondary">
        {isExpanded ? (
          <>
            <Save className="h-3 w-3" />
            <span>{isCreating ? "Salvando..." : "Salva"}</span>
          </>
        ) : (
          <>
            <Plus className="h-1 w-1" />
            <span>Crea</span>
          </>
        )}
      </Button>

      <div
        className={`flex items-center gap-3 transition-all duration-300 ease-in-out ${
          isExpanded
            ? "opacity-100 max-w-[1000px] translate-x-0"
            : "opacity-0 max-w-0 -translate-x-4 overflow-hidden pointer-events-none"
        }`}>
        <div className="flex items-center gap-2">
          <DateTimePicker24h
            date={date}
            setDate={setDate}
            onDateTimeSelect={handleDateTimeSelect}
          />
          <Input
            type="number"
            className="dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 max-w-[60px]"
            value={amountHours}
            onChange={(e) => setAmoutHours(e.target.value)}
          />
        </div>
        <Button
          onClick={resetForm}
          size="sm"
          variant="destructive"
          disabled={isCreating}
          className="shrink-0 h-8 w-8 rounded-md border-muted-foreground/20"
          aria-label="Cancel">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
