import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient.tsx";
import logo from "../../assets/sgl.svg";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <img className="max-w-[200px] mb-4" src={logo} alt="Scuola Guida Lugano Logo" />
          <CardTitle className="text-semibold">Grazie per esserti registrato</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            La tua email è stata confermata. Puoi procedere al login.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button 
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Vai al Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmRegistration;