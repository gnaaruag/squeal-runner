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
import { readme_text, tab1, tab2, tab3, tab4, tab5 } from "./consts/TabContent";

interface Tab {
  id: string;
  title: string;
  code: string;
}

const defaultTabs: Tab[] = [
  { id: "tab-1", title: "Readme.md", code: readme_text },
  { id: "tab-2", title: "Airlogs - All", code: tab1 },
  {
    id: "tab-3",
    title: "Airlogs Filter",
    code: tab2,
  },
  { id: "tab-4", title: "Users - All", code: tab3 },
  {
    id: "tab-5",
    title: "Users Filter",
    code: tab4,
  },
  {
    id: "tab-6",
    title: "Error Display",
    code: tab5,
  },
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
  const [splitPosition, setSplitPosition] = useState(50);
  const [tabBarWidth, setTabBarWidth] = useState(180);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [isSplitLineHovered, setIsSplitLineHovered] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    return stored ? stored === "dark" : true;
  });
  const [editorMode, setEditorMode] = useState<"normal" | "vim">(() => {
    return (localStorage.getItem("editorMode") as "normal" | "vim") || "normal";
  });

  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("editorMode", editorMode);
  }, [editorMode]);

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const addTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      { id: newTabId, title: `Tab ${prev.length + 1}`, code: "" },
    ]);
    setActiveTab(newTabId);
  }, []);

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

  const updateCode = (tabId: string, newCode: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, code: newCode } : tab))
    );
  };

  const runQuery = () => {
    if (activeTab === "tab-2") {
      setResult(table1Data.columns);
    } else if (activeTab === "tab-3") {
      const filtered = table1Data.columns.filter(
        (row: any) => row.airport_code === "SHS"
      );
      setResult(filtered);
    } else if (activeTab === "tab-4") {
      setResult(table2Data.columns);
    } else if (activeTab === "tab-5") {
      const filtered = table2Data.columns.filter(
        (row: any) => row.language === "Sindhi"
      );
      setResult(filtered);
    } else if (activeTab === "tab-6") {
      setResult({ error: "Query failed: Table not found." });
    } else {
      const filtered = table2Data.columns.filter(
        (row: any) => row.language === "Uyghur"
      );
      setResult(filtered.slice(0, Math.floor(Math.random() * (17 - 3 + 1)) + 3));
    }
  };

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

  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  function exportToCSV(data: any[], filename = "export.csv") {
    if (!Array.isArray(data) || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];
    csvRows.push(headers.join(","));
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] ?? "";
        if (String(val).includes(",") || String(val).includes('"')) {
          return `"${String(val).replace(/"/g, '""')}"`;
        }
        return String(val);
      });
      csvRows.push(values.join(","));
    }
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />

      <div className="split-container" ref={containerRef}>
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
                {editingTabId === tab.id
                  ? !isSidebarCollapsed && (
                      <input
                        value={tab.title}
                        onChange={(e) => handleEditTabTitle(e, tab.id)}
                        onBlur={finishEditTabTitle}
                        autoFocus
                      />
                    )
                  : !isSidebarCollapsed && (
                      <span
                        className="tab-title"
                        onDoubleClick={() => setEditingTabId(tab.id)}
                      >
                        {tab.title}
                      </span>
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

        <div
          className="vertical-resize-handle"
          onMouseDown={() => setResizingSidebar(true)}
        />

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

        <div
          className="split-line-container"
          onMouseEnter={() => setIsSplitLineHovered(true)}
          onMouseLeave={() => setIsSplitLineHovered(false)}
        >
          <div
            className={`split-line ${
              isSplitLineHovered ? "split-line-hovered" : ""
            }`}
            onMouseDown={handleMouseDown}
          >
            <MoreVertical size={60} />
          </div>
        </div>

        <div
          className="right-panel"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <div className="result-panel">
            {result ? (
              result.error ? (
                <div className="error-message">{result.error}</div>
              ) : (
                <DataTable data={result} />
              )
            ) : (
              <div className="placeholder-message">
                Run any query to see the result here
              </div>
            )}
          </div>
          <div className="result-footer">
            <button
              className="export-button"
              onClick={() => {
                if (Array.isArray(result)) {
                  exportToCSV(result, "queryResult.csv");
                } else {
                  alert("No valid data to export!");
                }
              }}
            >
              Export CSV ⎙
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
