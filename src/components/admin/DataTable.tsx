'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Trash2, Edit } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onRowClick?: (item: T) => void;
  actions?: {
    addHref?: string;
    addLabel?: string;
    onBulkDelete?: (selectedIds: string[]) => void;
  };
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchQuery = '',
  onSearchChange,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div className="bg-white border border-[#e5e5ea] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      {/* Action Bar */}
      <div className="bg-white px-5 py-4 border-b border-[#e5e5ea] flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          {onSearchChange && (
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#f5f5f7] border border-transparent rounded-lg text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#d2d2d7] focus:ring-4 focus:ring-[#0071e3]/10 transition-all outline-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#86868b] font-medium">
            {data.length} {data.length === 1 ? 'result' : 'results'}
          </span>
          {actions?.addHref && (
            <Link
              href={actions.addHref}
              className="px-4 py-1.5 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ED] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {actions.addLabel || 'Add New'}
            </Link>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar (shows when items are selected) */}
      {selectedIds.size > 0 && actions?.onBulkDelete && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between animate-fade-in">
          <span className="text-sm font-bold text-amber-800">
            {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            <select className="text-sm border border-amber-300 bg-white rounded-lg px-3 py-1 text-amber-900 outline-none focus:ring-4 focus:ring-amber-500/10">
              <option value="">--------</option>
              <option value="delete">Delete selected items</option>
            </select>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete these items? This action cannot be undone.")) {
                  actions.onBulkDelete!(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }
              }}
              disabled={selectedIds.size === 0}
              aria-disabled={selectedIds.size === 0}
              className="px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition-colors shadow-sm"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f5f5f7]/50 border-b border-[#e5e5ea] text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              <th className="px-4 py-2.5 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={handleSelectAll}
                  className="rounded border-[#c7c7cc] text-[#0071e3] focus:ring-[#0071e3]"
                />
              </th>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-2.5 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5ea] text-sm text-[#1d1d1f]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-12 text-center text-[#86868b]">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="group hover:bg-[#f5f5f7]/50 transition-colors">
                  <td className="px-4 py-2 text-center border-r border-[#e5e5ea]/50">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${item.id}`}
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="rounded border-[#c7c7cc] text-[#0071e3] focus:ring-[#0071e3]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-2 max-w-[250px] truncate"
                      onClick={() => onRowClick && onRowClick(item)}
                    >
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-[#f5f5f7]/30 px-5 py-3 border-t border-[#e5e5ea] flex items-center justify-between text-sm text-[#86868b] font-medium">
        <div>
          {data.length} {data.length === 1 ? 'record' : 'records'}
        </div>
        {/* Real pagination will be implemented via Server Actions later */}
      </div>
    </div>
  );
}
