import { Menu, Settings, User } from "lucide-react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
  

function Navbar({ onMenuClick, onSettings, onAccount }) {

  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);


  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="icon-button mobile-menu" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>

        <h1 className="logo">
          AI<span>Verse</span>
        </h1>
      </div>

      <div className="navbar-actions">
        <button className="icon-button" aria-label="Settings" onClick={() => {
                setProfileOpen(false);
                onSettings();
              }}>
          <Settings size={20} />
        </button>

        <button className="profile-button" aria-label="Profile" onClick={() => {
                setProfileOpen(false);
                onAccount();
              }}>
          <User size={20} />
        </button>

        {user && (
          <button
            className="logout-button"
            onClick={signOut}
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        )}
        
      </div>
    </header>
  );
}

export default Navbar;