import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import { MoreVertical } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  code: string;
}

function App() {
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const splitLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('tab-1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [isSplitLineHovered, setIsSplitLineHovered] = useState(false);

  useEffect(() => {
    const loadTabs = () => {
      const storedTabs = localStorage.getItem('tabs');
      if (storedTabs) {
        const parsedTabs = JSON.parse(storedTabs) as Tab[];
        if (parsedTabs.length > 0) {
          setTabs(parsedTabs);
          setActiveTab(parsedTabs[0].id);
          return
        }
      }
      else {
        setTabs([{ id: 'tab-1', title: 'Tab 1', code: '' }]);
      }
        setActiveTab('tab-1');
    };
    loadTabs();
  }, []);

  useEffect(() => {
    if(tabs.length > 0){
      localStorage.setItem('tabs', JSON.stringify(tabs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tabs', JSON.stringify(tabs));
  }, [tabs]);

  const addTab = useCallback(() => {
    const newTabId = `tab-${tabs.length + 1}`;
    setTabs([...tabs, { id: newTabId, title: `Tab ${tabs.length + 1}`, code: '' }]);
    setActiveTab(newTabId);
  }, [tabs]);

  const removeTab = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      if (newTabs.length > 0) {
        if (activeTab === tabId) {
          setActiveTab(newTabs[0].id)
        }
      } else {
        const newTabId = "tab-1"
        setActiveTab(newTabId);
        setTabs([{ id: newTabId, title: "Tab 1", code: "" }])
      }
      return newTabs
    })
    
    
    
  }, [tabs, activeTab]);

  const handleEditTabTitle = (e: React.ChangeEvent<HTMLInputElement>, tabId: string) => {
    const newTitle = e.target.value;
    setTabs((prevTabs) => prevTabs.map((tab) => tab.id === tabId ? { ...tab, title: newTitle } : tab));
  };

  const finishEditTabTitle = () => {
    setEditingTabId(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newPosition = Math.max(0, Math.min(100, (e.clientX - containerRect.left) / containerRect.width * 100));
      setSplitPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = () => { setIsDragging(true); };

  const updateCode = (tabId: string, newCode: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, code: newCode } : tab
      )
    );
  };

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="split-container" ref={containerRef}>
      <div className="left-panel" style={{ width: `${splitPosition}%` }}>
        <div className="tab-bar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={tab.title}
                  onChange={(e) => handleEditTabTitle(e, tab.id)}
                  onBlur={finishEditTabTitle}
                  autoFocus
                />
              ) : (
                <span onDoubleClick={() => setEditingTabId(tab.id)} onClick={() => setActiveTab(tab.id)}>{tab.title}</span>
              )}
              <button className="remove-tab-button" onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}>X</button>
            </div>
          ))}
          <button className="add-tab-button" onClick={addTab}>+</button>
        </div>
        <div className='code-editor-container'>
          <div className='line-numbers-container'>
            {currentTab?.code.split('\n').map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          {currentTab && <textarea
            ref={codeEditorRef}
            className="code-editor"
            placeholder="Enter your SQL code here..."
            value={currentTab.code}
            onChange={(e) => updateCode(currentTab.id, e.target.value)}
          />}
        </div>

      </div>      
      <div className="split-line-container"
        onMouseEnter={() => setIsSplitLineHovered(true)}
        onMouseLeave={() => setIsSplitLineHovered(false)}
      >
        <div className={`split-line ${isSplitLineHovered ? 'split-line-hovered' : ''}`}
          ref={splitLineRef} onMouseDown={handleMouseDown}
        >
          <MoreVertical size={60} />
        </div>
      </div>
      <div className="right-panel" style={{ width: `${100 - splitPosition}%` }}>
        <div className="result-panel">Result Panel</div>        
      </div>
    </div>
  );
}

export default App;
