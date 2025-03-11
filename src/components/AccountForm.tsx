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
        <h1 className="text-3xl font-bold tracking-tight dark:text-slate-100">Benvenuto</h1>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="edit-mode"
          checked={isEditMode}
          onCheckedChange={setIsEditMode}
        />
        <Label htmlFor="edit-mode" className="dark:text-slate-100">Modifica profilo</Label>
      </div>

      {/* Confirmation alert */}
      {showConfirmAlert && (
        <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-green-700 dark:text-green-400 flex justify-between items-center border border-green-200 dark:border-green-900">
          <p>Profilo aggiornato con successo!</p>
          <Button
            variant="outline"
            size="sm"
            className="dark:bg-white dark:text-green-900 dark:border-green-700 dark:hover:bg-slate-100"
            onClick={() => setShowConfirmAlert(false)}>
            Chiudi
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Avatar Card */}
        <Card className="dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Il tuo profilo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-36 w-36 mb-4">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="dark:bg-slate-800 dark:text-slate-400">{getInitials(nomeUtente || "")}</AvatarFallback>
            </Avatar>
            {isEditMode && (
              <div className="mt-4 w-full">
                <Label htmlFor="avatar" className="dark:text-slate-100">Cambia avatar</Label>
                <div className="mt-1 relative">
                  <div className="relative rounded-md border border-slate-200 dark:border-slate-700 bg-transparent">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className={`
                        file:mr-4 file:py-2 file:px-4 
                        file:rounded-l-md file:border-0 
                        file:text-sm file:font-semibold
                        file:bg-slate-50 file:text-slate-700 
                        dark:file:bg-slate-800 dark:file:text-slate-100
                        dark:text-slate-100 dark:bg-transparent
                        hover:file:bg-slate-100 dark:hover:file:bg-slate-700
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${uploadingAvatar ? "opacity-50" : ""}
                      `}
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </div>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full dark:border-slate-100"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Data Card */}
        <Card className="dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-slate-100">
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
                className="text-muted-foreground dark:text-slate-400">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-100">Email</Label>
              <Input
                id="email"
                type="text"
                value={user?.email || ""}
                disabled
                className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_utente" className="dark:text-slate-100">Nome Completo</Label>
              <Input
                id="nome_utente"
                type="text"
                value={nomeUtente || ""}
                disabled={!isEditMode}
                onChange={(e) => setNomeUtente(e.target.value)}
                className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 disabled:opacity-50"
              />
            </div>
          </CardContent>
          {isEditMode && (
            <CardFooter>
              <Button
                className="w-full dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
                onClick={() =>
                  updateProfile({
                    nome_utente: nomeUtente as any,
                    email: user?.email,
                  })
                }
                disabled={loading}>
                {loading ? "Salvando..." : "Salva Profilo"}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Hours Card */}
        <Card className="dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-slate-100">
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
                className="text-muted-foreground dark:text-slate-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-end">
              <div className="text-4xl font-bold mb-2 dark:text-slate-100">{totalHours} ore</div>
              <p className="text-muted-foreground dark:text-slate-400">
                Descrive il numero totale di ore fatte/fatturate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}