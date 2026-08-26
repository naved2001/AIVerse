import { useEffect, useState } from "react";
import { X, User, Mail, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AccountPanel({ onClose }) {
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name ||
      user?.email?.split("@")[0] ||
      ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDisplayName(
      user?.user_metadata?.display_name ||
        user?.email?.split("@")[0] ||
        ""
    );
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError("Please enter a display name.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const { error } = await updateProfile(
        trimmedName
      );

      if (error) {
        throw error;
      }

      setMessage("Account updated successfully.");
    } catch (error) {
      setError(
        error.message || "Failed to update account."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : "";

  const initial =
    user?.user_metadata?.display_name
      ?.charAt(0)
      .toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="account-overlay">
      <div className="account-panel">
        <div className="account-header">
          <div>
            <h2>Account</h2>
            <p>Manage your account information.</p>
          </div>

          <button
            type="button"
            className="account-close"
            onClick={onClose}
            aria-label="Close account"
          >
            <X size={20} />
          </button>
        </div>

        <div className="account-content">
          <div className="account-profile-summary">
            <div className="account-avatar">
              {initial}
            </div>

            <div>
              <h3>
                {user?.user_metadata?.display_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </h3>

              <p>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="account-field">
              <label htmlFor="displayName">
                <User size={17} />
                Display name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                placeholder="Enter your name"
              />
            </div>

            <div className="account-field">
              <label>
                <Mail size={17} />
                Email address
              </label>

              <input
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>

            {joinedDate && (
              <div className="account-joined">
                <Calendar size={17} />

                <span>
                  Account created on {joinedDate}
                </span>
              </div>
            )}

            {error && (
              <p className="account-error">
                {error}
              </p>
            )}

            {message && (
              <p className="account-success">
                {message}
              </p>
            )}

            <div className="account-actions">
              <button
                type="button"
                className="account-cancel"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="account-save"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountPanel;