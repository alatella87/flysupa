import React, { useState } from "react";
import { signup } from "../services/authServices.ts";
import { useNavigate } from "react-router-dom";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(email, password, navigate);
  };

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Card className="w-full md:max-w-md dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl dark:text-white">
              Crea un nuovo account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-white">
                  Mail
                </Label>
                <Input
                  type="email"
                  required
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-white">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                />
              </div>
              <Button
                type="submit"
                className="w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                Iscriviti
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
