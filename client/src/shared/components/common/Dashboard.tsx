import React from 'react';
import { HiOutlineSwitchHorizontal, HiOutlineChartBar, HiOutlineCreditCard, HiOutlineStar } from 'react-icons/hi';
 
const Dashboard: React.FC = () => {
  return (
    <div>
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
   </div>
  );
};

export default Dashboard;

