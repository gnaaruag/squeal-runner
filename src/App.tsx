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

  // Initialize tabs from localStorage or create a default tab with default SQL content.
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

  // Initialize activeTab from localStorage (if it exists and matches a tab), otherwise use the first tab.
  const [activeTab, setActiveTab] = useState<string>(() => {
    const storedActiveTab = localStorage.getItem("activeTab");
    if (storedActiveTab) {
      // Check if the stored activeTab exists in the initial tabs array.
      const initialTabs = localStorage.getItem("tabs")
        ? (JSON.parse(localStorage.getItem("tabs") as string) as Tab[])
        : [];
      if (initialTabs.find((tab) => tab.id === storedActiveTab)) {
        return storedActiveTab;
      }
    }
    return "tab-1";
  });

  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [isSplitLineHovered, setIsSplitLineHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true; // default to dark
  });
  
  const [editorMode, setEditorMode] = useState<'normal' | 'vim'>(() => {
    return (localStorage.getItem('editorMode') as 'normal' | 'vim') || 'normal';
  });
  
  // Save to localStorage when they change
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  useEffect(() => {
    localStorage.setItem('editorMode', editorMode);
  }, [editorMode]);
  

  // Persist tabs to localStorage whenever they change.
  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  // Persist activeTab to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const addTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    setTabs((prevTabs) => [
      ...prevTabs,
      { id: newTabId, title: `Tab ${prevTabs.length + 1}`, code: "" },
    ]);
    setActiveTab(newTabId);
  }, []);

  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
        // If all tabs are removed, create a fallback default tab.
        if (newTabs.length === 0) {
          return [{ id: "tab-1", title: "Tab 1", code: defaultContent }];
        }
        return newTabs;
      });
      // If the removed tab was active, switch to the first remaining tab.
      setActiveTab((prevActive) => {
        if (prevActive === tabId) {
          const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
          return remainingTabs.length > 0 ? remainingTabs[0].id : "tab-1";
        }
        return prevActive;
      });
    },
    [tabs, defaultContent]
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
        Math.min(100, ((e.clientX - container.left) / container.width) * 100)
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
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, code: newCode } : tab
      )
    );
  };

  // Find the currently active tab.
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div>
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
      />
      <div className="split-container" ref={containerRef}>
      <div className="left-panel" style={{ width: `${splitPosition}%` }}>
        <div className="tab-bar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
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
                <X size={16} color="#fff" />
              </button>
            </div>
          ))}
          <button className="add-tab-button" onClick={addTab}>
            <Plus size={16} />
          </button>
        </div>
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

      <div className="right-panel" style={{ width: `${100 - splitPosition}%` }}>
        <div className="result-panel">Result Panel</div>
      </div>
    </div>
    </div>
    
  );
}

export default App;
