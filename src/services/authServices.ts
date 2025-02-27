import { supabase } from "./supabaseClient.tsx";

// Login Flow
export async function login(email: string, password: string) {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login failed:", error.message);
      return;
    }

    console.log("Login successful");
  } catch (err) {
    console.error("Unexpected error during login:", err);
  }
}

// Signup Flow
export async function signup(email: string, password: string, navigate: any) {
  try {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Signup failed:", error.message);
      navigate("/error");
      return;
    }
    navigate("/check");
  } catch (err) {
    console.error("Unexpected error during signup:", err);
    navigate("/error");
  }
}

// Sign Out Flow
export async function signOutUser(navigate: (arg0: string) => void) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out failed:", error.message);
      return;
    }

    console.log("Sign-out successful");
    navigate("/login"); // Redirect to login after sign out
  } catch (err) {
    console.error("Unexpected error during sign-out:", err);
  }
}
