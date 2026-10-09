
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      onLogout();
      navigate("/login", { replace: true });
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="brand" href="/dashboard">MyApp</a>
        <button className="secondary-button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="welcome-card">
        <p className="eyebrow">YOUR DASHBOARD</p>
        <h1>Welcome, {user?.name || "there"}!</h1>
        <p className="muted">
          You've successfully signed in.
        </p>

        <div className="profile-details">
          <span>Account email</span>
          <strong>{user?.email || "Not provided"}</strong>
        </div>

        <div className="success-message">
          Your account session is active.
        </div>
      </section>
    </main>
  );
}