/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeftToLine,
  ArrowRightFromLine,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import Navbar from "./components/Navbar";
import table1Data from "./data/table1.json";
import table2Data from "./data/table2.json";
import DataTable from "./components/DataTable";

interface Tab {
  id: string;
  title: string;
  code: string;
}

const defaultTabs: Tab[] = [
  { id: "tab-1", title: "Readme.md", code: "SELECT * FROM my_table;" },
  { id: "tab-2", title: "query-one", code: "SELECT * FROM airlogs;" },
  {
    id: "tab-3",
    title: "query-two",
    code: "SELECT * FROM airlogs WHERE flight_duration > 2;",
  },
  { id: "tab-4", title: "query-three", code: "SELECT * from users;" },
  { id: "tab-5", title: "query-four", code: "SELECT * from ufotable;" },
];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [tabs, setTabs] = useState<Tab[]>(() => {
    try {
      const stored = localStorage.getItem("tabs");
      const parsed = stored ? JSON.parse(stored) : [];
      return parsed.length > 0 ? parsed : defaultTabs;
    } catch {
      return defaultTabs;
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const storedActive = localStorage.getItem("activeTab");
    const storedTabs = localStorage.getItem("tabs");
    const parsedTabs = storedTabs
      ? (JSON.parse(storedTabs) as Tab[])
      : defaultTabs;
    return storedActive && parsedTabs.some((t) => t.id === storedActive)
      ? storedActive
      : parsedTabs[0].id;
  });

  // Layout states
  const [splitPosition, setSplitPosition] = useState(50);
  const [tabBarWidth, setTabBarWidth] = useState(180);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [isSplitLineHovered, setIsSplitLineHovered] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Query result (table rows or error)
  const [result, setResult] = useState<any>(null);

  // Theme toggles
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    return stored ? stored === "dark" : true;
  });

  // Editor mode
  const [editorMode, setEditorMode] = useState<"normal" | "vim">(() => {
    return (localStorage.getItem("editorMode") as "normal" | "vim") || "normal";
  });

  // Apply theme
  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Save editor mode
  useEffect(() => {
    localStorage.setItem("editorMode", editorMode);
  }, [editorMode]);

  // Persist tabs & active tab
  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Creating a new tab
  const addTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      { id: newTabId, title: `Tab ${prev.length + 1}`, code: "" },
    ]);
    setActiveTab(newTabId);
  }, []);

  // Removing a tab
  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((t) => t.id !== tabId);
        return newTabs.length > 0 ? newTabs : defaultTabs;
      });

      setActiveTab((prev) => {
        if (prev === tabId) {
          const remaining = tabs.filter((t) => t.id !== tabId);
          return remaining.length ? remaining[0].id : defaultTabs[0].id;
        }
        return prev;
      });
    },
    [tabs]
  );

  // Editing tab title
  const handleEditTabTitle = (
    e: React.ChangeEvent<HTMLInputElement>,
    tabId: string
  ) => {
    const newTitle = e.target.value;
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, title: newTitle } : tab
      )
    );
  };

  const finishEditTabTitle = () => setEditingTabId(null);

  // Draggable split line
  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const container = containerRef.current.getBoundingClientRect();
      const newPos = Math.max(
        0,
        Math.min(
          100,
          ((e.clientX - container.left - tabBarWidth) /
            (container.width - tabBarWidth)) *
            100
        )
      );
      setSplitPosition(newPos);
    };
    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, tabBarWidth]);

  // Resizing sidebar
  useEffect(() => {
    const handleSidebarResize = (e: MouseEvent) => {
      if (!resizingSidebar || !containerRef.current) return;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newWidth = Math.max(120, Math.min(400, e.clientX - containerLeft));
      setTabBarWidth(newWidth);
    };
    const stopSidebarResize = () => setResizingSidebar(false);

    document.addEventListener("mousemove", handleSidebarResize);
    document.addEventListener("mouseup", stopSidebarResize);
    return () => {
      document.removeEventListener("mousemove", handleSidebarResize);
      document.removeEventListener("mouseup", stopSidebarResize);
    };
  }, [resizingSidebar]);

  // Update the code in the editor
  const updateCode = (tabId: string, newCode: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, code: newCode } : tab))
    );
  };

  // Run Query => sets 'result' to your data array or an error
  const runQuery = () => {
    if (activeTab === "tab-2" || activeTab === "tab-3") {
      // Use the 'columns' array from table1Data
      setResult(table1Data.columns);
    } else if (activeTab === "tab-4") {
      // Use the 'columns' array from table2Data
      setResult(table2Data.columns);
    } else if (activeTab === "tab-5") {
      // error
      setResult({ error: "Query failed: Table not found." });
    } else {
      setResult(null);
    }
  };

  // Keydown listener for Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runQuery();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Current tab
  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <>
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />

      <div className="split-container" ref={containerRef}>
        {/* == Sidebar (tabs) == */}
        <div
          className="vertical-tab-bar"
          style={{ width: isSidebarCollapsed ? "48px" : `${tabBarWidth}px` }}
        >
          <button
            className="collapse-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ArrowRightFromLine size={20} stroke="currentColor" />
            ) : (
              <ArrowLeftToLine size={20} stroke="currentColor" />
            )}
          </button>

          <div className="tab-list">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab ${tab.id === activeTab ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {editingTabId === tab.id ? (
                  !isSidebarCollapsed && (
                    <input
                      value={tab.title}
                      onChange={(e) => handleEditTabTitle(e, tab.id)}
                      onBlur={finishEditTabTitle}
                      autoFocus
                    />
                  )
                ) : (
                  !isSidebarCollapsed && (
                    <span
                      className="tab-title"
                      onDoubleClick={() => setEditingTabId(tab.id)}
                    >
                      {tab.title}
                    </span>
                  )
                )}
                {!isSidebarCollapsed && (
                  <button
                    className="remove-tab-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isSidebarCollapsed && (
            <button className="add-tab-button" onClick={addTab}>
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* == Sidebar resize handle == */}
        <div
          className="vertical-resize-handle"
          onMouseDown={() => setResizingSidebar(true)}
        />

        {/* == Left panel (Editor) == */}
        <div className="left-panel" style={{ width: `${splitPosition}%` }}>
          <div className="code-editor-container">
            {currentTab && (
              <CodeEditor
                key={currentTab.id}
                code={currentTab.code}
                onChange={(newCode) => updateCode(currentTab.id, newCode)}
                isDarkMode={isDarkMode}
                editorMode={editorMode}
              />
            )}
          </div>
          <div className="editor-footer">
            <button className="run-button" onClick={runQuery}>
              Run (Ctrl + Enter)
            </button>
          </div>
        </div>

        {/* == Middle Split line == */}
        <div
          className="split-line-container"
          onMouseEnter={() => setIsSplitLineHovered(true)}
          onMouseLeave={() => setIsSplitLineHovered(false)}
        >
          <div
            className={`split-line ${isSplitLineHovered ? "split-line-hovered" : ""}`}
            onMouseDown={handleMouseDown}
          >
            <MoreVertical size={60} />
          </div>
        </div>

        {/* == Right panel (Results) == */}
        <div className="right-panel" style={{ width: `${100 - splitPosition}%` }}>
          <div className="result-panel">
            {result ? (
              result.error ? (
                <div style={{ color: "red" }}>{result.error}</div>
              ) : (
                // Pass the .columns array to DataTable
                <DataTable data={result} />
              )
            ) : (
              "Result Panel"
            )}
          </div>
          <div className="result-footer">
            <button className="export-button">Export CSV ⎙</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
