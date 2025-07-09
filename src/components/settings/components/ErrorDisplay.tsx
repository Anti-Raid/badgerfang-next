'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface SettingsErrorDisplayProps {
  loadErrors: { [templateName: string]: string };
  onRetry?: () => void;
}

export const SettingsErrorDisplay: React.FC<SettingsErrorDisplayProps> = ({ 
  loadErrors, 
  onRetry 
}) => {
  if (!loadErrors || Object.keys(loadErrors).length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
      <div className="text-destructive">
        {Object.entries(loadErrors).map(([templateName, error]) => (
          <div key={templateName}>
            Error in {templateName}: <br />
            <code className="whitespace-pre-wrap">{error}</code>
          </div>
        ))}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-auto bg-destructive/20 hover:bg-destructive/30 text-destructive px-3 py-1 rounded-md text-sm transition-colors focus:outline focus:outline-2 focus:outline-destructive"
          aria-label="Retry loading settings"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
};
