import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser.tsx";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

interface Profile {
  id: string;
  nome_utente: string;
  email: string;
  admin: boolean;
  updated_at: string;
  total_hours: number;
  avatar_url?: string;
  days_difference: number;
  phone: string;
  sensibilizzazione: boolean;
  soccorritori: boolean;
  licenza_date?: string;
}

const formatDate = (dateStr: string | number | Date) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function Users() {
  const { downloadAndSetUserAvatar } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles_view`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();

        // Fetch avatar URLs for each profile
        const profilesWithAvatars = await Promise.all(
          data.map(async (profile: Profile) => {
            if (profile.avatar_url) {
              const avatarUrl = await downloadAndSetUserAvatar(
                profile.avatar_url
              );
              return { ...profile, avatar_url: avatarUrl };
            }
            return profile;
          })
        );

        setProfiles(profilesWithAvatars as Profile[]);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [downloadAndSetUserAvatar, setProfiles]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]?.toUpperCase() || '').join('');
  };

  // Define columns for data table
  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <Avatar>
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{getInitials(profile.nome_utente)}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "total_hours",
      header: "Ore",
      cell: ({ row }) => {
        const hours = row.original.total_hours;
        if (hours === 0) return null; // Returns nothing if hours is 0
        return (
          <div className="flex justify-center items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-black text-gray">
              {hours}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "licenza_date",
      header: "Data rilascio LAC",
      cell: ({ row }) => formatDate(row.original.licenza_date || ''),
    },
    {
      accessorKey: "days_difference",
      header: "Licenza scade fra",
      cell: ({ row }) => {
        const profile = row.original;
        if (!profile.days_difference) return "N/A";
        
        const daysLeft = 365 - profile.days_difference;
        let badgeVariant = "outline";
        
        if (daysLeft < 90 && daysLeft > 0) {
          badgeVariant = "default";
        } else if (daysLeft <= 0) {
          badgeVariant = "secondary";
        }
        
        return (
          <Badge variant={badgeVariant}>
            {daysLeft < 0
              ? `scaduto da ${Math.abs(daysLeft)} giorni`
              : `${daysLeft} giorni`}
          </Badge>
        );
      },
    },
    {
      accessorKey: "soccorritori",
      header: "Soccorritori",
      cell: ({ row }) => (
        row.original.soccorritori &&
        <Badge variant="default">Completato</Badge>
      ),
    },
    {
      accessorKey: "sensibilizzazione",
      header: "Sensibilizzazione",
      cell: ({ row }) => (
        row.original.sensibilizzazione &&
        <Badge variant="default">Completato</Badge>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Azioni</div>,
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="text-right">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate(`/user-edit/${profile.id}`)}
            >
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
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
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
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Lista Utenti</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Utenti</CardTitle>
          <CardDescription>
            Lista di tutti gli utenti registrati nella piattaforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={profiles} 
            searchColumn="email"
            searchPlaceholder="Cerca utenti..."
          />
        </CardContent>
      </Card>
    </div>
  );
}