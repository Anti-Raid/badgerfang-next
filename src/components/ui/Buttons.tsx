'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconType as ReactIconType } from 'react-icons';

type ButtonIcon = ReactIconType | LucideIcon;

interface ButtonProps {
  Title: string;
  onClick: () => void;
  icon?: ButtonIcon;
}

const baseClass =
  'px-5 py-2.5 w-full max-w-[160px] rounded-sm text-foreground font-medium text-[16px] border border-white border-opacity-5 hover:brightness-[80%] transition-all inline-flex justify-center items-center gap-2';

export const Primary: React.FC<ButtonProps> = ({ Title, onClick, icon: Icon }) => {
  return (
    <button
      className={`bg-extra ${baseClass}`}
      type="button"
      onClick={onClick}
    >
      {Icon && <Icon className="text-[18px]" />} {Title}
    </button>
  );
};

export const Secondary: React.FC<ButtonProps> = ({ Title, onClick, icon: Icon }) => {
  return (
    <button
      className={`bg-secondary ${baseClass}`}
      type="button"
      onClick={onClick}
    >
      {Icon && <Icon className="text-[18px]" />} {Title}
    </button>
  );
};

export const Ghost: React.FC<ButtonProps> = ({ Title, onClick, icon: Icon }) => {
  return (
    <button
      className="bg-transparent px-4 py-2 rounded-sm text-foreground font-semibold text-[16px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all flex items-center gap-2"
      type="button"
      onClick={onClick}
    >
      {Icon && <Icon className="text-[18px]" />} {Title}
    </button>
  );
};