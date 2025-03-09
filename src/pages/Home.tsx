import logo from "../assets/sgl.svg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "../hooks/useUser";

export default function Home() {
  const { user, isAdmin } = useUser();
  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-2 gap-16">
      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-3xl mx-auto">
        {user ? (
          <></>
        )  
        : (
          <Card className="w-full mt-[-12rem]">
            <CardContent className="flex flex-col items-center p-8 bg-white">
              <Link
                className="font-semibold text-foreground hover:text-primary mb-6 transition-colors"
                to="/home">
                Scuola Guida Lugano
              </Link>
              <p className="text-lg text-center mb-8">
                Benvenuto nel tuo spazio digitale di Scuola Guida Lugano
              </p>

              <div className="flex gap-4 items-center flex-col sm:flex-row">
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Login</Link>
                </Button>

                <Button asChild variant="default" size="lg">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center py-4">
        <Button asChild variant="link">
          <a
            href="https://scuolaguidalugano.ch"
            target="_blank"
            rel="noopener noreferrer">
            Sito scuola guida
          </a>
        </Button>
      </footer>
    </div>
  );
}
