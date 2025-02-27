import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase} from "../services/supabaseClient.tsx"; // Adjust the import path as needed
import {useNavigate} from "react-router-dom";
import logo from "../assets/sgl.svg";

const ConfirmRegistration: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  useEffect(() => {
    const confirmEmail = async () => {
      if (tokenHash && type === "email") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (error) {
            console.error("Email confirmation failed:", error.message);
            return;
          }
          console.log("Email confirmed successfully");
        } catch (err) {
          console.error("Unexpected error during email confirmation:", err);
        }
      }
    };
    confirmEmail();
  }, [tokenHash, type]);

  return (<div className="flex flex-col items-center justify-center min-h-screen">
    <div className="ml-auto mr-auto m-4">
      <img className="max-w-[200px]" src={logo} alt={'logo'}/>
    </div>
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Grazie per esserti registrato</h1>
      <p className="text-lg text-gray-400 mb-4">
        Puoi procedere al login.
      </p>
      <button
        style={{marginTop: "1rem", marginLeft: "1rem"}}
        aria-label="Close Button"
        className={"btn btn-sm btn-primary"}
        onClick={() => navigate("/login")}>
        <span className="color: primary">Login</span>
      </button>
    </div>
  </div>);
};

export default ConfirmRegistration;
