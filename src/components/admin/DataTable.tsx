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
    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Django-style Action Bar */}
      <div className="bg-neutral-100 px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-4">
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
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-neutral-300 rounded focus:ring-1 focus:ring-[#10164A] focus:border-[#10164A] outline-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 font-medium">
            {data.length} {data.length === 1 ? 'result' : 'results'}
          </span>
          {actions?.addHref && (
            <Link
              href={actions.addHref}
              className="px-4 py-1.5 bg-[#10164A] text-white text-sm font-bold rounded hover:bg-[#1c246e] transition-colors flex items-center gap-1.5"
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
            <select className="text-sm border border-amber-300 bg-white rounded px-3 py-1 text-amber-900 outline-none focus:ring-1 focus:ring-amber-500">
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
              className="px-3 py-1 bg-amber-600 text-white text-sm font-bold rounded hover:bg-amber-700 transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse admin-table-striped">
          <thead>
            <tr className="bg-neutral-100 border-b border-[#e5e7eb] text-xs font-bold text-neutral-600 uppercase tracking-wider">
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={handleSelectAll}
                  className="rounded border-neutral-300 text-[#10164A] focus:ring-[#10164A]"
                />
              </th>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] text-sm text-neutral-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-neutral-500">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="group">
                  <td className="px-4 py-3 text-center border-r border-[#e5e7eb]/50">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${item.id}`}
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="rounded border-neutral-300 text-[#10164A] focus:ring-[#10164A]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-3"
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

      {/* Pagination Footer (Django-style) */}
      <div className="bg-neutral-100 px-4 py-3 border-t border-[#e5e7eb] flex items-center justify-between text-sm text-neutral-600 font-medium">
        <div>
          {data.length} {data.length === 1 ? 'record' : 'records'}
        </div>
        {/* Real pagination will be implemented via Server Actions later */}
      </div>
    </div>
  );
}
