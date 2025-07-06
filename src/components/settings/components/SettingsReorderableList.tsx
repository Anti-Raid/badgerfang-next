'use client';

import React from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { Primary } from '../../ui/Buttons';

interface SettingsReorderableListProps {
  entries: any[];
  onReorder: (entries: any[]) => void;
  onEdit: (entry: any) => void;
  onDelete: (entry: any) => void;
  onSaveOrder: () => void;
  isReordered: boolean;
  indexBy?: string;
}

export const SettingsReorderableList: React.FC<SettingsReorderableListProps> = ({
  entries,
  onReorder,
  onEdit,
  onDelete,
  onSaveOrder,
  isReordered,
  indexBy
}) => {
  return (
    <>
      <div className="bg-background border border-primary border-opacity-20 rounded-md overflow-hidden">
        <Reorder.Group
          axis="y"
          values={entries}
          onReorder={onReorder}
          className="divide-y divide-primary divide-opacity-10"
        >
          {entries.map((entry, index) => (
            <Reorder.Item 
              key={entry[indexBy || ''] || index} 
              value={entry} 
              className="p-3"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <span className="font-medium text-foreground">
                  {entry?.title || `Entry ${index + 1}`}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="p-1 rounded-md hover:bg-accent/50 transition-colors"
                    onClick={() => onEdit(structuredClone(entry))}
                    aria-label="Edit entry"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    className="p-1 rounded-md hover:bg-accent/50 transition-colors"
                    onClick={() => onDelete(entry)}
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {isReordered && (
        <div className="flex justify-end mt-4">
          <Primary Title="Save Order" onClick={onSaveOrder} />
        </div>
      )}
    </>
  );
};
