import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase} from "../../services/supabaseClient.tsx"; // Adjust the import path as needed

const Check: React.FC = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="font-semibold text-xl mt-[-10rem]">Grazie per esserti registrato!</h1>
        <p className="text-md  white">
          Controlla la mail per il link di conferma.
        </p>
      </div>
    </div>
  );
};

export default Check;
