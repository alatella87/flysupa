import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser.tsx";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useNavigate } from "react-router-dom";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

interface Profile {
  id: string;
  full_name: string;
  email: string;
  admin: boolean;
  updated_at: string;
  amount_hours: number;
  avatar_url?: string;
  days_difference: number;
  phone: string;
  sensibilizzazione: boolean;
  soccorritori: boolean;
}

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  "& .MuiDataGrid-cell": {
    fontSize: "16px",
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "#2c2b31",
  },
  "& .MuiDataGrid-columnsContainer": {
    backgroundColor: "#ff0000",
    ...theme.applyStyles("light", {
      backgroundColor: "#fafafa",
    }),
  },
}));

const formatDate = (dateStr: string | number | Date) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  // Get day and pad with zero
  const month = date.toLocaleString("default", {
    month: "short",
  });
  // Get short month name
  const year = date.getFullYear();
  // Get year
  return `${day} ${month} ${year}`;
};

export default function Users() {
  const { downloadAndSetUserAvatar } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const columns = [
    {
      field: "avatar_url",
      headerName: "Avatar",
      flex: '50px',
      renderCell: (params: { value: string | undefined }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifySelf: "center",
            alignItems: "center",
            height: "100%",
          }}>
          <img src={params.value} alt="Avatar" className="w-12 rounded-full" />
        </div>
      ),
    },
    {
      field: "licenza_date",
      headerName: "Data rilascio LAC",
      flex: 1,
      renderCell: (params: { value: any }) => (
        <span
          className={`${
            params.value ? "" : ""
          } text-white text-xs`}>
          {formatDate(params.value)}
        </span>
      ),
    },
    {
      field: "days_difference",
      headerName: "Licenza scade fra",
      flex: 1,
      renderCell: (params: { value: any }) => (
        <span
          className={`badge 
    ${
      params.value && 365 - params.value < 90 && 365 - params.value > 0
        ? "bg-primary text-white"
        : ""
    }
    ${params.value && 365 - params.value <= 0 ? "bg-gray-500 text-white" : ""}
    text-xs`}>
          {365 - params.value < 0
            ? `scaduto da ${Math.abs(365 - params.value)} giorni`
            : `${365 - params.value} giorni`}
        </span>
      ),
    },
    {
      field: "amount_hours",
      headerName: "Completate",
      flex: 1,
      renderCell: (params: { value: any }) => (
        <span
          className={`
          ${
          params.value ? "badge badge-primary badge-sm text-sm": "text-sm" } `}>
          {params.value}
        </span>
      ),
    },
    {
      field: "soccorritori",
      headerName: "Soccorritori",
      flex: 1,
      renderCell: (params: { value: any }) => (
        <span
          className={`${
            params.value ? "badge badge-primary" : ""
          } text-xs`}>
          {params.value ? "Completato" : ""}
        </span>
      ),
    },
    {
      field: "sensibilizzazione",
      headerName: "Sensibilizzazione",
      flex: 1,
      renderCell: (params: { value: any }) => (
        <span
          className={`${params.value ? "badge badge-success" : ""} text-xs`}>
          {params.value ? "Vero" : ""}
        </span>
      ),
    },
    {
      field: "email",
      headerName: "Mail",
      flex: 1,
      renderCell: (params: { value: any }) => (
        <span
          className={`${
            params.value ? "" : ""
          } text-white text-xs`}>
          {params.value}
        </span>
      ),
    },
    {
      field: "",
      headerName: "Azioni",
      flex: 'end',
      renderCell: (params: { row: { id: string } }) => (
        <div>
          <span
            className="badge badge-primary"
            aria-label="Edit user"
            onClick={() => navigate(`/user-edit/${params.row.id}`)}>
            <span className="icon-[tabler--edit] size-4"></span>
          </span>
          <span
            className="badge badge-soft ml-1"
            aria-label="Action button">
            <span className="icon-[tabler--trash] size-4"></span>
          </span>
        </div>
      ),
    },
  ];

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
        console.log("Profiles: ", data);

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

  const filteredProfiles = profiles?.length
    ? profiles.filter(
        (profile) =>
          profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          profile.email?.toLowerCase().includes(search.toLowerCase()) ||
          profile.phone?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-[90%] ml-auto mr-auto mt-4">
      <h1 className="text-base-content text-2xl mb-4">Lista Utenti</h1>
      <form className="flex items-center max-w-sm my-4">
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="simple-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Cerca utenti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>
      <div className=" overflow-x-auto">
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <StyledDataGrid
            rows={filteredProfiles}
            rowHeight={65}
            columns={columns as any}
            rowCount={filteredProfiles.length} // Ensure count is defined
            paginationMode="server" // If fetching from API
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
        </ThemeProvider>
      </div>
    </div>
  );
}
