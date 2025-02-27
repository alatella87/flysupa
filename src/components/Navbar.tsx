import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { signOutUser } from "../services/authServices";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, email, avatarUrl, isAdmin } = useUser();

  return (
    <nav className="navbar bg-base-200/50 rounded-box min-h-[72px]">
      <div className="flex flex-1 items-center">
        <Link
          className="gradiented link text-base-content link-neutral text-xl font-semibold no-underline"
          to="/home"
        >
          Scuola Guida Lugano
        </Link>
      </div>
      {user && (
        <div className="navbar-end flex items-center gap-4">
          <div className="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
            {/* Dropdown Toggle */}
            <button
              type="button"
              className="dropdown-toggle flex items-center"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Dropdown"
            >
              <div className="avatar">
                <div className="size-12 rounded-full">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="rounded-full"
                    />
                  ) : (
                    <Avatar navbar={true} size={75} />
                  )}
                </div>
              </div>
            </button>
            <ul
              className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60 max-w-1000"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="dropdown-avatar"
            >
              <li className="dropdown-header gap-2">
                <div className="avatar">
                  <div className="size-12 rounded-full">
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h6 className="text-base-content text-base font-semibold">
                    {email}
                  </h6>
                  <small>{user?.email}</small>
                </div>
              </li>
              <li>
                <Link className="dropdown-item" to="/home">
                  <span className="icon-[tabler--user]"></span>
                  Home
                </Link>
              </li>
              {isAdmin ? (
                <li>
                  <Link className="dropdown-item" to="/users">
                    <span className="icon-[tabler--user]"></span>
                    Lista utenti
                  </Link>
                </li>
              ) : null}

              <li>
                <Link className="dropdown-item" to="/account">
                  <span className="icon-[tabler--user]"></span>
                  Account
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/payments">
                  <span className="icon-[tabler--receipt-rupee]"></span>
                  Pagamenti
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/faq">
                  <span className="icon-[tabler--help-triangle]"></span>
                  Domande frequenti (FAQs)
                </Link>
              </li>
              <li className="dropdown-footer gap-2">
                <button
                  onClick={() => {
                    signOutUser(navigate);
                  }}
                  className="btn btn-primary"
                  type="button"
                >
                  Esci
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
