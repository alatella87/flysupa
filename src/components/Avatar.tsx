"use client";
import { useState } from "react";
import { useUser } from "../hooks/useUser";
import { AvatarProps } from "@/types";

// Shadcn Components
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Avatar({
  size = "md",
  editMode = false,
  navbar = false,
  sourceUrl,
  className = "",
}: AvatarProps) {
  const { avatarUrl, uploadImage } = useUser();
  const [uploading, setUploading] = useState(false);

  // Get image URL from props or context
  const imgUrl = sourceUrl || avatarUrl;

  // Get initials for avatar fallback
  const getInitials = () => {
    return "U"; // Default fallback
  };

  // Size mapping
  const sizeClass = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-36 w-36",
  }[size];

  // Simple avatar for navbar
  if (navbar) {
    return (
      <ShadcnAvatar className={`${sizeClass} ${className}`}>
        <AvatarImage src={imgUrl || ''} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </ShadcnAvatar>
    );
  }

  // Full card with upload functionality
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Immagine profilo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ShadcnAvatar className={`${size === "xl" ? "h-36 w-36" : "h-24 w-24"} mb-4`}>
          <AvatarImage src={imgUrl || ''} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </ShadcnAvatar>

        {editMode && (
          <div className="mt-4 w-full">
            <label htmlFor="avatar-upload" className="w-full">
              <div className="w-full cursor-pointer">
                <Button
                  className="w-full"
                  disabled={uploading}
                >
                  {uploading ? "Caricamento..." : "Carica foto"}
                </Button>
              </div>
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
              className="sr-only"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}