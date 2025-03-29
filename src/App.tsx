import React, { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Plus, X } from "lucide-react";
import "./App.css";
import CodeEditor from "./components/CodeEditor";
import Navbar from "./components/Navbar";

interface Tab {
  id: string;
  title: string;
  code: string;
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultContent = "SELECT * FROM my_table;";

  const [tabs, setTabs] = useState<Tab[]>(() => {
    const storedTabs = localStorage.getItem("tabs");
    if (storedTabs) {
      const parsedTabs = JSON.parse(storedTabs) as Tab[];
      return parsedTabs.length > 0
        ? parsedTabs
        : [{ id: "tab-1", title: "Tab 1", code: defaultContent }];
    }
    return [{ id: "tab-1", title: "Tab 1", code: defaultContent }];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const storedActiveTab = localStorage.getItem("activeTab");
    const tabs = localStorage.getItem("tabs")
      ? (JSON.parse(localStorage.getItem("tabs")!) as Tab[])
      : [];
    if (storedActiveTab && tabs.find((t) => t.id === storedActiveTab)) {
      return storedActiveTab;
    }
    return "tab-1";
  });

  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [isSplitLineHovered, setIsSplitLineHovered] = useState(false);
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
        if (newTabs.length === 0) {
          return [{ id: "tab-1", title: "Tab 1", code: defaultContent }];
        }
        return newTabs;
      });

      setActiveTab((prev) => {
        if (prev === tabId) {
          const remaining = tabs.filter((t) => t.id !== tabId);
          return remaining.length ? remaining[0].id : "tab-1";
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
          ((e.clientX - container.left - 180) / (container.width - 180)) * 100
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
  }, [isDragging]);

  const updateCode = (tabId: string, newCode: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, code: newCode } : tab))
    );
  };

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <>
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />
      <div className="split-container" ref={containerRef}>
        <div className="vertical-tab-bar">
          <div className="tab-list">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab ${tab.id === activeTab ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {editingTabId === tab.id ? (
                  <input
                    value={tab.title}
                    onChange={(e) => handleEditTabTitle(e, tab.id)}
                    onBlur={finishEditTabTitle}
                    autoFocus
                  />
                ) : (
                  <span onDoubleClick={() => setEditingTabId(tab.id)}>
                    {tab.title}
                  </span>
                )}
                <button
                  className="remove-tab-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button className="add-tab-button" onClick={addTab}>
            <Plus size={18} />
          </button>
        </div>

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
          <div className="result-panel">Result Panel</div>
        </div>
      </div>
    </>
  );
}

export default App;
