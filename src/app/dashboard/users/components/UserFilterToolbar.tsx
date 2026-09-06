'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface UserFilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  boardFilter: string;
  setBoardFilter: (val: string) => void;
  classFilter: string;
  setClassFilter: (val: string) => void;
}

export function UserFilterToolbar({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  boardFilter,
  setBoardFilter,
  classFilter,
  setClassFilter,
}: UserFilterToolbarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#0d0d15] border border-white/10 p-4 rounded-2xl">
      {/* Search */}
      <div className="relative lg:col-span-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or username..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
        />
      </div>

      {/* Role Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none"
        >
          <option value="">All Roles</option>
          <option value="user">Learner</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Super Admin</option>
        </select>
      </div>

      {/* Board Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <select
          value={boardFilter}
          onChange={(e) => setBoardFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none"
        >
          <option value="">All Boards</option>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE</option>
          <option value="Homeschool">Homeschool</option>
        </select>
      </div>

      {/* Class Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#08080c] border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-[#d4af37]/60 appearance-none"
        >
          <option value="">All Standards</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
        </select>
      </div>
    </div>
  );
}
