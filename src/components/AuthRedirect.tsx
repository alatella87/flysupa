import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser"

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { user , shouldRedirect, setShouldRedirect } = useUser();

  useEffect(() => {
    if (user && shouldRedirect) {
      // navigate("/account");
      setShouldRedirect(false); // Disable redirection after navigating
    }
  }, [user, shouldRedirect, navigate, setShouldRedirect]);

  return null;
};

export default AuthRedirect;
