"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient.tsx";
import Avatar from "./Avatar.tsx";
import { DataGrid, GridColDef, GridCellEditCommitParams } from "@mui/x-data-grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/system";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  "& .MuiDataGrid-cell": {
    fontSize: "16px",
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "#2c2b31",
  },
}));

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

export default function UserEdit() {
  const { id } = useParams(); // Get user ID from URL
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [error, setError] = useState("");

  // Define the columns for our editable table
  const columns: GridColDef[] = [
    {
      field: 'field',
      headerName: 'Campo',
      flex: 1,
      editable: false,
    },
    {
      field: 'value',
      headerName: 'Valore',
      flex: 2,
      editable: true,
      renderCell: (params) => {
        const row = rows.find(r => r.id === params.row.id);
        
        if (!row) return params.value;
        
        // Handle different types of values with appropriate rendering
        if (row.type === 'boolean') {
          return (
            <div className="flex items-center justify-center w-full">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={params.value}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  handleManualEdit(params.row.id, newValue);
                }}
              />
            </div>
          );
        } else if (row.key === 'amount_hours') {
          return (
            <div className="w-full">
              <input
                type="number"
                min="0"
                step="1"
                className="input input-sm w-full"
                value={params.value}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  handleManualEdit(params.row.id, newValue);
                }}
              />
            </div>
          );
        } else if (row.key === 'email') {
          return (
            <div className="text-gray-500">
              {params.value}
            </div>
          );
        } else if (row.key === 'phone') {
          return (
            <div className="w-full">
              <input
                type="tel"
                className="input input-sm w-full"
                value={params.value || ''}
                onChange={(e) => {
                  handleManualEdit(params.row.id, e.target.value);
                }}
                placeholder="+41 XX XXX XX XX"
              />
            </div>
          );
        } else if (row.key === 'licenza_date') {
          return (
            <div className="w-full">
              <input
                type="date"
                className="input input-sm w-full"
                value={params.value ? params.value.split('T')[0] : ''}
                onChange={(e) => {
                  handleManualEdit(params.row.id, e.target.value);
                }}
              />
            </div>
          );
        } else if (row.key === 'full_name') {
          return (
            <div className="w-full">
              <input
                type="text"
                className="input input-sm w-full"
                value={params.value || ''}
                onChange={(e) => {
                  handleManualEdit(params.row.id, e.target.value);
                }}
              />
            </div>
          );
        }
        
        return params.value;
      }
    }
  ];
  
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
  
  const [rows, setRows] = useState<Array<{id: number, field: string, value: any, type: string}>>([]);

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
          
          // Convert profile data to rows for DataGrid
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

  const handleCellEditCommit = (params: GridCellEditCommitParams) => {
    const rowId = params.id;
    const newValue = params.value;
    updateRowValue(rowId, newValue);
  };
  
  // Handle manual edits from custom edit components (checkbox, number inputs)
  const handleManualEdit = (rowId: number, newValue: any) => {
    updateRowValue(rowId, newValue);
  };
  
  // Shared function to update a row's value with proper type conversion
  const updateRowValue = (rowId: any, newValue: any) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      const rowIndex = updatedRows.findIndex(row => row.id === rowId);
      
      if (rowIndex !== -1) {
        const row = updatedRows[rowIndex];
        // Convert value to the correct type based on the original type
        let typedValue = newValue;
        
        if (row.type === 'number') {
          typedValue = Number(newValue);
        } else if (row.type === 'boolean') {
          typedValue = Boolean(newValue);
        }
        
        updatedRows[rowIndex] = {
          ...row,
          value: typedValue
        };
      }
      
      return updatedRows;
    });
  };

  const updateProfile = async () => {
    if (!id || !profile) return;

    try {
      setLoading(true);
      
      // Convert rows back to an object for the API call
      const updates = rows.reduce((acc, row) => {
        // Skip email field which is readonly
        if (row.key !== 'email') {
          // Special processing for date fields
          if (row.key === 'licenza_date' && row.value) {
            // For dates, ensure we handle ISO format properly
            const date = new Date(row.value);
            if (!isNaN(date.getTime())) {
              acc[row.key] = date.toISOString();
            }
          } else {
            acc[row.key] = row.value;
          }
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
    <>
      <h5 className="card-title my-4">Modifica Utente</h5>

      {showConfirmAlert && (
        <div className="card bg-primary/20 text-primary transition duration-300 ease-in-out my-4">
          <div className="p-2 flex justify-between items-center">
            <p className="text-white">Profilo aggiornato!</p>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowConfirmAlert(false)}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* User avatar */}
        <div className="flex justify-center mb-4">
          <Avatar sourceUrl={profile?.full_avatar_url} size={100} />
        </div>

        {/* Editable profile data table */}
        <div className="card w-full">
          <div className="card-body">
            <h5 className="card-title mb-4 flex justify-between">
              Dati utente
              <span className="badge badge-secondary size-8 p-0">
                <span className="icon-[tabler--user-circle] size-5" />
              </span>
            </h5>
            
            <div style={{ width: '100%' }} className="mb-4">
              <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <StyledDataGrid
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[10]}
                  disableRowSelectionOnClick
                  onCellEditStop={handleCellEditCommit}
                  getRowHeight={() => 'auto'}
                  autoHeight
                  hideFooter={rows.length <= 10}
                  editMode="cell"
                  cellModesModel={{}}
                  sx={{
                    '& .MuiDataGrid-cell--editing': {
                      backgroundColor: 'rgb(255,215,115, 0.19)',
                      color: '#1a3e72',
                    },
                    '& .Mui-error': {
                      backgroundColor: 'rgb(126,10,15, 0.1)',
                      color: '#750f0f',
                    },
                    '& .MuiDataGrid-cell': {
                      padding: '12px',
                    },
                  }}
                />
              </ThemeProvider>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={updateProfile}
              disabled={loading}>
              {loading ? "Salvando..." : "Salva Profilo"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
