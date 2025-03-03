"use client";
import { useState } from "react";
import { useUser } from "../hooks/useUser";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default function AccountForm() {
  const {
    user,
    nomeUtente,
    setNomeUtente,
    totalHours,
    updateProfile,
    showConfirmAlert,
    setShowConfirmAlert,
    avatarUrl,
    uploadImage,
  } = useUser();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]?.toUpperCase() || '').join('');
  };
  
  // Handle avatar upload with loading state
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadingAvatar(true);
    try {
      await uploadImage(e);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Benvenuto</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="edit-mode"
          checked={isEditMode}
          onCheckedChange={setIsEditMode}
        />
        <Label htmlFor="edit-mode">Modifica profilo</Label>
      </div>

      {/* Confirmation alert */}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Avatar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Il tuo profilo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-36 w-36 mb-4">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback>{getInitials(nomeUtente || "")}</AvatarFallback>
            </Avatar>
            {isEditMode && (
              <div className="mt-4 w-full">
                <Label htmlFor="avatar">Cambia avatar</Label>
                <div className="mt-1 relative">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className={uploadingAvatar ? "opacity-50" : ""}
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Data Card */}
        <Card>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={user?.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_utente">Nome Completo</Label>
              <Input
                id="nome_utente"
                type="text"
                value={nomeUtente || ""}
                disabled={!isEditMode}
                onChange={(e) => setNomeUtente(e.target.value)}
              />
            </div>
          </CardContent>
          {isEditMode && (
            <CardFooter>
              <Button
                className="w-full"
                onClick={() =>
                  updateProfile({
                    nome_utente: nomeUtente,
                    email: null,
                  })
                }
                disabled={loading}>
                {loading ? "Salvando..." : "Salva Profilo"}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Hours Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Totale Ore
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
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-end">
              <div className="text-4xl font-bold mb-2">{totalHours} ore</div>
              <p className="text-muted-foreground">
                Descrive il numero totale di ore fatte/fatturate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}