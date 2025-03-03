import { useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import AuthRedirect from "./components/AuthRedirect";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Check from "./pages/Auth/Check";
import Users from "./pages/Users";
import Account from "./pages/Account";
import Register from "./pages/Auth/Register";
import UserEdit from "./pages/UserEdit";
import ConfirmRegistration from "./pages/Auth/ConfirmRegistration";
import Dashboard from "./pages/Dashboard";

function App() {
  
  const location = useLocation();
  
  useEffect(() => {
    const loadFlyonui = async () => {
      await import("flyonui/flyonui");
      window.HSStaticMethods.autoInit();
    };
    loadFlyonui();
  }, [location.pathname]);

  return (
    <UserProvider>
      <AuthRedirect/>
      <div className="min-h-screen bg-background">
        {location.pathname !== "/login" && <Navbar/>}
        <div className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/home" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/users" element={<Users/>}/>
            <Route path="/user-edit/:id" element={<UserEdit />} />
            <Route path="/account" element={<Account/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/check" element={<Check/>}/>
            <Route path="/auth/confirm" element={<ConfirmRegistration/>}/>
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
