import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { signOutUser } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Maximize, Minimize } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, email, avatarUrl, isAdmin } = useUser();
  const { theme, setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if fullscreen is supported and update state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .catch(err => console.error(`Error attempting to enable fullscreen mode: ${err.message}`));
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .catch(err => console.error(`Error attempting to exit fullscreen mode: ${err.message}`));
      }
    }
  };

  // Extract initials for avatar fallback
  const getInitials = (email: string) => {
    if (!email) return "U";
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part[0]?.toUpperCase() || '').join('');
  };

  return (
    <div className="container pt-6 space-y-6">
    <nav className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-md dark:bg-transparent dark:border-slate-700 dark:shadow-none">
      <div className="flex items-center gap-4">
        <Link
          className="font-semibold text-foreground dark:text-slate-100 hover:text-primary transition-colors"
          to="/home"
        >
          Scuola Guida Lugano 
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
              onClick={() => navigate('/home')}
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
                className="mr-1"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
              onClick={() => navigate('/users')}
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
                className="mr-1"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Utenti
            </Button>
          </div>
        )}
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          {/* Fullscreen Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </Button>

          {/* Dark Mode Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="dark:bg-white dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          { isAdmin ? <Badge variant={'outline'} className="dark:border-slate-700 dark:text-slate-100">Admin</Badge> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || ''} alt={email || "User"} />
                  <AvatarFallback className="dark:bg-slate-800 dark:text-slate-100">{getInitials(email || "")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 dark:bg-slate-900" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none dark:text-slate-100">{email}</p>
                  <p className="text-xs leading-none text-muted-foreground dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-slate-700" />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-100">
                  <Link to="/home">
                    <span className="mr-2">🏠</span>
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-100">
                    <Link to="/users">
                      <span className="mr-2">👥</span>
                      <span>Lista utenti</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-100">
                  <Link to="/account">
                    <span className="mr-2">👤</span>
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-100">
                  <Link to="/payments">
                    <span className="mr-2">💰</span>
                    <span>Pagamenti</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="dark:focus:bg-slate-800 dark:text-slate-100">
                  <Link to="/faq">
                    <span className="mr-2">❓</span>
                    <span>Domande frequenti (FAQs)</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="dark:bg-slate-700" />
              <DropdownMenuItem 
                onClick={() => signOutUser(navigate)}
                className="text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400 dark:focus:bg-slate-800"
              >
                <span className="mr-2">🚪</span>
                <span>Esci</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
    </div>
  );
}