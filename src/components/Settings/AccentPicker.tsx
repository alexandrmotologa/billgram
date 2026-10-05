import React from 'react';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface AccentPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
}

export const AccentPicker: React.FC<AccentPickerProps> = ({ currentColor, onChange }) => {
  const presets = [
    { name: 'Obsidian', color: '#0f172a' },
    { name: 'Cobalt', color: '#1d4ed8' },
    { name: 'Emerald', color: '#047857' },
    { name: 'Burgundy', color: '#881337' },
    { name: 'Slate', color: '#475569' },
    { name: 'Indigo', color: '#4338ca' },
  ];

  return (
    <div className="flex items-center gap-2.5">
      {presets.map((p) => {
        const active = currentColor.toLowerCase() === p.color.toLowerCase();
        return (
          <button
            key={p.color}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onChange(p.color);
            }}
            title={p.name}
            style={{ backgroundColor: p.color }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
              active ? 'ring-2 ring-offset-2 ring-slate-800 scale-105' : 'opacity-85 hover:opacity-100'
            }`}
          >
            {active && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        );
      })}
    </div>
  );
};
