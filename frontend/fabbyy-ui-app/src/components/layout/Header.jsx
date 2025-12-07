// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { FileText, Settings, LogOut } from 'lucide-react';
const Header = ({ currentUser, onLogout, onOpenSettings }) => {
 const [showUserMenu, setShowUserMenu] = useState(false);
 return (
<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
<div className="px-6 py-4 flex items-center justify-between">
       {/* Left: Logo + Title */}
<div className="flex items-center gap-8">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
<FileText className="w-6 h-6 text-white" />
</div>
<h1 className="text-xl font-semibold text-gray-900">FABBYY FLEXICAPTURE</h1>
</div>
</div>
       {/* Right: User Info + Settings + Avatar */}
<div className="flex items-center gap-4">
<span className="text-sm text-gray-600">
           Hi, <span className="font-medium text-gray-900">{currentUser?.name || 'User'}</span>
</span>
         {/* Settings Button */}
<button
           onClick={onOpenSettings}
           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
>
<Settings className="w-5 h-5 text-gray-600" />
</button>
         {/* Avatar with Dropdown */}
<div className="relative">
<button
             onClick={() => setShowUserMenu(prev => !prev)}
             className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm hover:ring-4 hover:ring-purple-200 transition-all"
>
             {currentUser?.avatar || 'FS'}
</button>
           {showUserMenu && (
<div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
<div className="px-4 py-3 border-b border-gray-200">
<p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
<p className="text-xs text-gray-500">{currentUser?.email}</p>
<p className="text-xs text-gray-400 mt-1">Role: {currentUser?.role}</p>
</div>
<button
                 onClick={() => {
                   onLogout();
                   setShowUserMenu(false);
                 }}
                 className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
>
<LogOut className="w-4 h-4" /> Logout
</button>
</div>
           )}
</div>
</div>
</div>
</header>
 );
};
export default Header;