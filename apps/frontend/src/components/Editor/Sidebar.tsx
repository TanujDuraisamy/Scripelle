import { useState } from "react";

interface SidebarProps {
  onTabChange?: (tab: string) => void;
}

const Sidebar = ({ onTabChange }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<string>("document");

  const tabs = [
    { id: "document", label: "Document" },
    { id: "comments", label: "Comments" },
    { id: "history", label: "History" },
    { id: "settings", label: "Settings" },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="w-16 bg-gray-800 text-white flex flex-col items-center py-4 gap-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
            activeTab === tab.id
              ? "bg-gray-600 scale-110"
              : "hover:bg-gray-700 hover:scale-105"
          }`}
          title={tab.label}
        >
          {/* <span className="text-2xl">{tab.icon}</span> */}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
