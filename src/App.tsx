import { useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import AuthRedirect from "./components/AuthRedirect";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Check from "./pages/Check";
import Users from "./pages/Users";
import Account from "./pages/Account";
import Register from "./pages/Register";
import UserEdit from "./pages/UserEdit";
import ConfirmRegistration from "./pages/ConfirmRegistration";

function App() {
  
  const location = useLocation();
  
  useEffect(() => {
    const loadFlyonui = async () => {
      await import("flyonui/flyonui");
      window.HSStaticMethods.autoInit();
    };
    loadFlyonui();
  }, [location.pathname]);

  return (<UserProvider>
      <AuthRedirect/>
      <div className="min-h-screen bg-base-200/60">
        <Navbar/>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Home/>}/>
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
    </UserProvider>);
}

export default App;
