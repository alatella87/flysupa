"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient.tsx";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  amount_hours: number;
  admin: boolean;
  sensibilizzazione?: boolean;
  soccorritori?: boolean;
  phone?: string;
  licenza_date?: string;
  full_avatar_url?: string;
  [key: string]: any; // Allow for dynamic field access
}

interface ProfileRow {
  id: number;
  field: string;
  value: any;
  type: string;
  key: string;
}

export default function UserEditShadcn() {
  const { id } = useParams(); // Get user ID from URL
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ProfileRow[]>([]);

  // Profile fields that we want to display in our table
  const fieldDisplayNames: {[key: string]: string} = {
    full_name: 'Nome Completo',
    email: 'Email',
    phone: 'Telefono',
    amount_hours: 'Totale Ore',
    licenza_date: 'Data rilascio LAC',
    admin: 'Amministratore',
    sensibilizzazione: 'Sensibilizzazione',
    soccorritori: 'Soccorritori'
  };

  const downloadAndSetAvatar = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      return url;
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError("Invalid User Id");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/profiles_view?id=eq.${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        if (data.length > 0) {
          const profileData = data[0];
          
          // Download and set avatar if available
          if (profileData.avatar_url) {
            const avatarUrl = await downloadAndSetAvatar(profileData.avatar_url);
            profileData.full_avatar_url = avatarUrl;
          }
          
          setProfile(profileData);
          
          // Convert profile data to rows
          const profileRows = Object.entries(fieldDisplayNames)
            .filter(([key]) => key in profileData)
            .map(([key, displayName], index) => ({
              id: index,
              field: displayName,
              value: profileData[key],
              type: typeof profileData[key],
              key: key // Keep original key for later use
            }));
            
          setRows(profileRows);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Handle edits from custom edit components
  const handleFieldChange = (key: string, value: any) => {
    // Update the profile state
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
    
    // Update the rows state
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.key === key) {
          return { ...row, value };
        }
        return row;
      });
    });
  };

  const updateProfile = async () => {
    if (!id || !profile) return;

    try {
      setLoading(true);
      
      // Extract updatable fields from profile
      const updates = Object.entries(profile)
        .filter(([key]) => key !== 'email' && key in fieldDisplayNames)
        .reduce((acc, [key, value]) => {
          // Special processing for date fields
          if (key === 'licenza_date' && value) {
            // For dates, ensure we handle ISO format properly
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              acc[key] = date.toISOString();
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
      
      console.log('Updating profile with:', updates);
      
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/profiles_view?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setShowConfirmAlert(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Modifica Utente</h1>

      {showConfirmAlert && (
        <div className="rounded-lg bg-green-100 p-4 text-green-700 flex justify-between items-center">
          <p>Profilo aggiornato con successo!</p>
          <Button variant="outline" size="sm" onClick={() => setShowConfirmAlert(false)}>
            Chiudi
          </Button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Avatar section */}
        <div className="flex justify-center">
          <Avatar className="h-32 w-32">
            <AvatarImage 
              src={profile?.full_avatar_url} 
              alt={profile?.full_name || 'User avatar'} 
            />
            <AvatarFallback>
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User data card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dati utente
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </CardTitle>
            <CardDescription>
              Modifica le informazioni del profilo utente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Personal Information */}
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input 
                    id="full_name" 
                    value={profile?.full_name || ''} 
                    onChange={(e) => handleFieldChange('full_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ''} 
                    disabled 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input 
                    id="phone" 
                    value={profile?.phone || ''} 
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount_hours">Totale Ore</Label>
                  <Input 
                    id="amount_hours" 
                    type="number"
                    min="0"
                    step="1"
                    value={profile?.amount_hours || 0}
                    onChange={(e) => handleFieldChange('amount_hours', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licenza_date">Data rilascio LAC</Label>
                <Input 
                  id="licenza_date" 
                  type="date"
                  value={profile?.licenza_date ? profile.licenza_date.split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('licenza_date', e.target.value)}
                />
              </div>
            </div>
            
            {/* Checkboxes section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Status & Certificazioni</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="admin" 
                    checked={profile?.admin || false}
                    onCheckedChange={(checked) => handleFieldChange('admin', checked)}
                  />
                  <Label htmlFor="admin">Amministratore</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sensibilizzazione" 
                    checked={profile?.sensibilizzazione || false}
                    onCheckedChange={(checked) => handleFieldChange('sensibilizzazione', checked)}
                  />
                  <Label htmlFor="sensibilizzazione">Sensibilizzazione</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="soccorritori" 
                    checked={profile?.soccorritori || false}
                    onCheckedChange={(checked) => handleFieldChange('soccorritori', checked)}
                  />
                  <Label htmlFor="soccorritori">Soccorritori</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={updateProfile}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Salvando..." : "Salva Profilo"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}