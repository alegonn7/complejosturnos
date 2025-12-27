'use client';

import { useState } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

export function ColorPicker({ 
  label, 
  value, 
  onChange, 
  description 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary-700">
        {label}
      </label>
      
      <div className="flex items-center gap-3">
        {/* Preview del color */}
        <div
          className="w-12 h-12 rounded-lg border-2 border-primary-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        />
        
        {/* Input de color */}
        <div className="flex-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-12 rounded-lg border border-primary-200 cursor-pointer"
          />
        </div>
        
        {/* Input de texto */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-28 px-3 py-2 border border-primary-200 rounded-md text-sm font-mono"
          maxLength={7}
        />
      </div>

      {description && (
        <p className="text-xs text-primary-600">{description}</p>
      )}
    </div>
  );
}