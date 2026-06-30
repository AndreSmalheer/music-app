import "./Header.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function BackBtn() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="back-btn"
      onClick={() => navigate(-1)}
      aria-label="Back"
    >
      <ArrowLeft size={26} strokeWidth={2.4} className="icon" />
    </button>
  );
}

function Header() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // De herontworpen schermen hebben hun eigen header/back-knop. De globale
  // Header toont alleen nog een terug-knop op de legacy-pagina's.
  const isLegacyBackPage =
    path.includes("see-all") ||
    path.includes("artist") ||
    path.includes("edit-playlist");

  if (!isLegacyBackPage) return null;

  return (
    <div className="Header">
      <BackBtn />
    </div>
  );
}

export default Header;
