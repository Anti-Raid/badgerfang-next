'use client';

import React from 'react';

interface SettingsFooterProps {
  footerText?: string;
}

export const SettingsFooter: React.FC<SettingsFooterProps> = ({ footerText }) => {
  if (!footerText) return null;
  
  return (
    <p className="text-sm text-muted-foreground mt-4">{footerText}</p>
  );
};
