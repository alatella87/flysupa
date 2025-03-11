"use client";

import * as React from "react";
import { useEffect } from "react"; 
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns";
import { supabase } from "../services/supabaseClient.tsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePicker24hProps {
  lessonId: string;
}

export function DateTimePicker24h({ lessonId }: DateTimePicker24hProps) {

  const [date, setDate] = React.useState<Date>();
  const [isOpen, setIsOpen] = React.useState(false);
  const [time, setTime] = React.useState<{hour: number; minute: number}>({ hour: 7, minute: 0 });

  const hours = Array.from({ length: 17 }, (_, i) => i + 7);
  const minutes = [0, 15, 30, 45];

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && lessonId) {
      // Preserve the current time when selecting a new date
      if (time) {
        selectedDate.setHours(time.hour);
        selectedDate.setMinutes(time.minute);
      }
      
      setDate(selectedDate);
      
      // Format the date for database update (YYYY-MM-DD)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      
      // Update the database
      async function updateLessonDate(lessonId: string, dateStr: string) {
        console.log(`Updating lesson ${lessonId} date to ${dateStr}`);
        
        const { data, error } = await supabase
          .from("lessons")
          .update({ date: dateStr })
          .eq("id", lessonId);

        if (error) {
          console.error("Error updating lesson date:", error.message);
          return null;
        }
        
        return data;
      }
      
      updateLessonDate(lessonId, formattedDate);
    }
  };

  useEffect(() => {
    async function fetchLessonDateTime(lessonId: string) {
      const { data, error } = await supabase
        .from("lessons")
        .select("date, time")
        .eq("id", lessonId)
        .single();

      if (error) {
        console.error("Error fetching lesson date and time:", error.message);
        return;
      }

      if (data) {
        // Set date
        if (data.date) {
          const fetchedDate = new Date(data.date);
          setDate(fetchedDate);
          
          // Set time if available
          if (data.time) {
            try {
              const timeParts = data.time.split(':');
              if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0], 10);
                const minutes = parseInt(timeParts[1], 10);
                
                // Update date with time
                fetchedDate.setHours(hours);
                fetchedDate.setMinutes(minutes);
                setDate(fetchedDate);
                
                // Update time state
                setTime({
                  hour: hours,
                  minute: minutes
                });
              }
            } catch (e) {
              console.error("Error parsing time:", e);
            }
          }
        }
      }
    }

    if (lessonId) {
      fetchLessonDateTime(lessonId);
    }
  }, [lessonId]);

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const valueNum = parseInt(value, 10);
    
    // Create a new time object based on current time
    const newTime = { ...time };
    
    // Update the hour or minute
    if (type === "hour") {
      newTime.hour = valueNum;
    } else if (type === "minute") {
      newTime.minute = valueNum;
    }
    
    // Update time state
    setTime(newTime);
    
    // Update the date object if it exists
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(newTime.hour);
      newDate.setMinutes(newTime.minute);
      setDate(newDate);
    }
    
    // Format the time string for the database (HH:MM:00)
    const formattedTime =
    `${String(newTime.hour).padStart(2, '0')}:${String(newTime.minute).padStart(2, '0')}:00`;
    
    // Update in database
    async function updateLessonTime(lessonId: string, timeStr: string) {
      console.log(`Updating lesson ${lessonId} time to ${timeStr}`);
      
      const { data, error } = await supabase
        .from("lessons")
        .update({ time: timeStr })
        .eq("id", lessonId);

      if (error) {
        console.error("Error updating lesson time:", error.message);
        return null;
      }
      
      return data;
    }
    
    updateLessonTime(lessonId, formattedTime)
      .then((updatedLesson) => {
        if (updatedLesson) {
          console.log("Updated lesson time successfully");
        } else {
          console.log("Failed to update lesson time");
        }
      });
  };
 

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal dark:border-slate-700 bg-popover dark:bg-slate-900",
            !date && "text-muted-foreground"
          )}>
          <CalendarIcon className="mr-2 h-4 w-8" />
          {date ? (
            <>
              {date.toLocaleString("default", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })}
              <span className="ml-auto">
                {`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`}
              </span>
            </>
          ) : (
            <>
              <span>Select date and time</span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          {/* Date */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          {/* Time */}
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              {/* Hours */}
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={time.hour === hour ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString())}>
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              {/* Minutes */}
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={time.minute === minute ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }>
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}