import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { signOutUser } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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

  // Extract initials for avatar fallback
  const getInitials = (email: string) => {
    if (!email) return "U";
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part[0]?.toUpperCase() || '').join('');
  };

  return (
    <div className="container mx-auto pt-6 space-y-6">
    <nav className="flex items-center justify-between p-4 bg-card shadow-md rounded-lg">
      <div className="flex-1">
        <Link
          className="font-semibold text-foreground hover:text-primary transition-colors"
          to="/home"
        >
          Scuola Guida Lugano 
        </Link>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          { isAdmin ? <Badge variant={'outline'}>Admin</Badge> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || ''} alt={email || "User"} />
                  <AvatarFallback>{getInitials(email || "")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/home">
                    <span className="mr-2">🏠</span>
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/users">
                      <span className="mr-2">👥</span>
                      <span>Lista utenti</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/account">
                    <span className="mr-2">👤</span>
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/payments">
                    <span className="mr-2">💰</span>
                    <span>Pagamenti</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/faq">
                    <span className="mr-2">❓</span>
                    <span>Domande frequenti (FAQs)</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOutUser(navigate)}
                className="text-red-500 focus:text-red-500"
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