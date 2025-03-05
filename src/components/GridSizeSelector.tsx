import React from 'react';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface GridSizeSelectorProps {
  value: { rows: number; cols: number };
  onChange: (size: { rows: number; cols: number }) => void;
  disabled?: boolean;
}

const sizeOptions = Array.from({ length: 8 }, (_, i) => i + 4);

export function GridSizeSelector({ value, onChange, disabled }: GridSizeSelectorProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <GripVertical className="w-5 h-5 text-gray-600" />
        <select
          value={value.rows}
          onChange={(e) => onChange({ ...value, rows: Number(e.target.value) })}
          className="block w-16 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          {sizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <GripHorizontal className="w-5 h-5 text-gray-600" />
        <select
          value={value.cols}
          onChange={(e) => onChange({ ...value, cols: Number(e.target.value) })}
          className="block w-16 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          {sizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}