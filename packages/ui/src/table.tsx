import React from "react";
import { Typography } from "./typography";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export const Table = <T extends { id: string | number }>({ 
  data, 
  columns, 
  onRowClick 
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0A0F1E]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 ${col.className}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((item) => (
            <tr 
              key={item.id} 
              onClick={() => onRowClick?.(item)}
              className={`
                transition-colors 
                ${onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""}
              `}
            >
              {columns.map((col, idx) => (
                <td key={idx} className={`px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 ${col.className}`}>
                  {typeof col.accessor === "function" 
                    ? col.accessor(item) 
                    : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-12 text-center">
          <Typography type="caption">Không có dữ liệu hiển thị.</Typography>
        </div>
      )}
    </div>
  );
};
