import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineViewGrid, HiOutlineSwitchHorizontal, HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineCog, HiOutlineCube, HiOutlineStar, HiOutlineCreditCard, HiOutlineChartBar, HiOutlineDatabase, HiOutlinePuzzle, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi';
import Navbar from './Navbar';

const sidebarMenu = [
  { icon: <HiOutlineViewGrid className="w-5 h-5" />, label: 'Dashboard' },
  { icon: <HiOutlineSwitchHorizontal className="w-5 h-5" />, label: 'Process' },
  { icon: <HiOutlineChartBar className="w-5 h-5" />, label: 'Sessions' },
  { icon: <HiOutlineDatabase className="w-5 h-5" />, label: 'Environments' },
  { icon: <HiOutlineUserGroup className="w-5 h-5" />, label: 'Collaboration' },
  { icon: <HiOutlineDocumentText className="w-5 h-5" />, label: 'Logs' },
  { icon: <HiOutlineCube className="w-5 h-5" />, label: 'Marketplace' },
  { divider: true },
  { icon: <HiOutlinePuzzle className="w-5 h-5" />, label: 'Ext. Modules' },
  { icon: <HiOutlineStar className="w-5 h-5" />, label: 'Billing' },
];

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen h-screen bg-[#fafbfc] overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col justify-between min-h-0 h-full transition-all duration-300 ease-in-out shadow-sm`}>
        <div>
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="block w-7 h-7 bg-blue-600 rounded-full flex-shrink-0" />
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-gray-500 leading-none">Tracko</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className={`ml-auto w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            >
              {isSidebarCollapsed ? <HiOutlineChevronRight className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {!isSidebarCollapsed && (
            <div className="px-4 py-2">
              <div className="flex items-center bg-[#f5f6fa] rounded-md px-2 py-1 border border-gray-200">
                <HiOutlineSearch className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none px-2 py-1 text-sm flex-1"
                />
                <button className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-gray-100">S8K</button>
              </div>
            </div>
          )}
          
          <nav className="mt-2">
            {sidebarMenu.map((item, idx) =>
              item.divider ? (
                <hr key={idx} className="my-2 border-gray-200" />
              ) : (
                <button
                  key={item.label}
                  className={`flex items-center gap-3 w-full px-5 py-2 text-gray-700 hover:bg-[#f5f6fa] rounded transition-all duration-200 text-sm ${item.label === 'Dashboard' ? 'bg-[#f5f6fa] font-semibold' : ''} ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              )
            )}
          </nav>
        </div>
        
        <div className="mb-4 px-4">
          <button 
            className={`flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 w-full mb-2 px-2 py-2 rounded transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? 'Settings' : undefined}
          >
            <HiOutlineCog className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
          <button 
            className={`flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700 hover:bg-gray-50 w-full px-2 py-2 rounded transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? 'View Grid' : undefined}
          >
            <HiOutlineViewGrid className="w-5 h-5" />
            {!isSidebarCollapsed && <span>View Grid</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-0 h-full p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">Home</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border text-sm text-gray-600 bg-white hover:bg-gray-50">Filter</button>
            <button className="px-3 py-1 rounded border text-sm text-gray-600 bg-white hover:bg-gray-50">All Time Activity</button>
            <button className="px-3 py-1 rounded border text-sm text-gray-600 bg-white hover:bg-gray-50">All Projects</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="mb-2"><HiOutlineChartBar className="w-8 h-8 text-gray-400" /></span>
            <span className="text-xs text-gray-500">Total Sessions</span>
            <span className="text-2xl font-bold">1,670</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="mb-2"><HiOutlineSwitchHorizontal className="w-8 h-8 text-gray-400" /></span>
            <span className="text-xs text-gray-500">Processes</span>
            <span className="text-2xl font-bold">16</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="mb-2"><HiOutlineStar className="w-8 h-8 text-gray-400" /></span>
            <span className="text-xs text-gray-500">Process Versions</span>
            <span className="text-2xl font-bold">587</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="mb-2"><HiOutlineCreditCard className="w-8 h-8 text-gray-400" /></span>
            <span className="text-xs text-gray-500">Module Transactions</span>
            <span className="text-2xl font-bold">19,258</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[260px] flex flex-col">
            <h3 className="font-semibold mb-2">Sessions</h3>
            <div className="flex-1 flex items-center justify-center text-gray-400">[Sessions Chart]</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[260px] flex flex-col">
            <h3 className="font-semibold mb-2">Modules Usage</h3>
            <div className="flex-1 flex items-center justify-center text-gray-400">[Modules Usage Chart]</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[260px] flex flex-col">
          <h3 className="font-semibold mb-2">Error Log</h3>
          <div className="flex-1 flex items-center justify-center text-gray-400">[Error Log Chart]</div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard; 