import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase} from "../services/supabaseClient.tsx"; // Adjust the import path as needed

const Check: React.FC = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Grazie per esserti registrato!</h1>
        <p className="text-lg white">
          Controlla la mail per il link di conferma.
        </p>
      </div>
    </div>
  );
};

export default Check;
