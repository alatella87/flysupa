import * as Sentry from "@sentry/react";

import { useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./components/theme-provider";

import AuthRedirect from "./components/AuthRedirect";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Check from "./pages/Auth/Check";
import Users from "./pages/Users";
import Account from "./pages/Account";
import Register from "./pages/Auth/Register";
import UserEdit from "./components/UserEditForm";
import EditLesson from "./pages/EditLesson";
import ConfirmRegistration from "./pages/Auth/ConfirmRegistration";
import Dashboard from "./pages/Dashboard";

Sentry.init({
  dsn: "https://6ff7edb8118e1b43ae0236e8653dbdf2@o4508383495716864.ingest.de.sentry.io/4509075451215952",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

console.log(import.meta.env);

function App() {
  const location = useLocation();

  useEffect(() => {
    const loadFlyonui = async () => {
      const cachedFlyonui = localStorage.getItem("flyonui");

      try {
        const flyonui = await import("flyonui/flyonui");

        if (!cachedFlyonui) {
          localStorage.setItem("flyonui", "loaded");
        }
        // Check if HSStaticMethods exists before calling
        if (
          (window as any).HSStaticMethods &&
          typeof (window as any).HSStaticMethods.autoInit === "function"
        ) {
          (window as any).HSStaticMethods.autoInit();
        } else {
          console.warn("HSStaticMethods.autoInit is not available");
        }
      } catch (err) {
        console.error("Error loading flyonui:", err);
      }
    };
    loadFlyonui();
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <UserProvider>
        <AuthRedirect />
        <div className="min-h-screen bg-background">
          {location.pathname !== "/login" && <Navbar />}
          <div className="p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/users" element={<Users />} />
              <Route path="/user-edit/:id" element={<UserEdit />} />
              <Route path="/edit-lesson/:id" element={<EditLesson />} />
              <Route path="/account" element={<Account />} />
              <Route path="/register" element={<Register />} />
              <Route path="/check" element={<Check />} />
              <Route path="/auth/confirm" element={<ConfirmRegistration />} />
            </Routes>
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
