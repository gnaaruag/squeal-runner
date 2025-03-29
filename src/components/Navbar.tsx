import React from "react";
import "./Navbar.css";
import { Sun, Moon } from "lucide-react";

interface NavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  editorMode: "normal" | "vim";
  setEditorMode: (val: "normal" | "vim") => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  setIsDarkMode,
  editorMode,
  setEditorMode,
}) => {
  return (
    <div className="navbar">
	<div className="navbar-left">
	  <img
		src={ "/squeal-logo.png"}
		alt="Squeal Runner Logo"
		className="logo"
		style={{ width: "60px", height: "auto" }}
	  />{" "}
	  <span className="title">squeal-runner</span>
	</div>
      <div className="navbar-right">
        <button
          className="theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <select
          value={editorMode}
          onChange={(e) => setEditorMode(e.target.value as "normal" | "vim")}
          className="editor-mode-dropdown"
        >
          <option value="normal">Normal Mode</option>
          <option value="vim">Vim Mode</option>
        </select>
      </div>
    </div>
  );
};

export default Navbar;
