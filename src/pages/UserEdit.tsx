"use client";
import { useState } from "react";
import UserEditForm from "../components/UserEditForm";
import UserEditShadcn from "../components/UserEditForm.Shadcn";
import { Button } from "@/components/ui/button";

export default function UserEdit() {
  // This state controls which UI version to display
  const [useShadcn, setUseShadcn] = useState(false);

  return (
    <>
      <div className="container mx-auto my-4">
        <div className="flex justify-end mb-4">
          <Button 
            variant={useShadcn ? "default" : "outline"}
            onClick={() => setUseShadcn(!useShadcn)}
            className="text-sm"
          >
            {useShadcn ? "Switch to Original UI" : "Switch to Shadcn UI"}
          </Button>
        </div>
        
        {useShadcn ? <UserEditShadcn /> : <UserEditForm />}
      </div>
    </>
  );
}
