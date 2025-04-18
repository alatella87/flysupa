import logo from "../assets/sgl.svg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "../hooks/useUser";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const { isAdmin } = useUser();
  return (
    <div className="flex flex-col items-center">
      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Totale Utenti</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center"></CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lezioni</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center"></CardContent>
        </Card>
      )}
    </div>
  );
}
