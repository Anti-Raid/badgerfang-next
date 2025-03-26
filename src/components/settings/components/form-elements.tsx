"use client"

import type React from "react"

interface InputFieldProps {
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  description,
  placeholder,
  type = "text",
  value,
  onChange,
  options,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-foreground mb-1">{label}</label>
      {description && <p className="text-sm text-muted-foreground mb-2">{description}</p>}
      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-background border border-primary border-opacity-20 rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        />
      )}
    </div>
  );
};

interface RadioOptionProps {
  label: string
  name: string
  checked?: boolean
  onChange?: () => void
}

export const RadioOption: React.FC<RadioOptionProps> = ({ label, name, checked = false, onChange }) => {
  return (
    <label className="inline-flex items-center mr-4 cursor-pointer">
      <div className="relative flex items-center">
        <input type="radio" name={name} className="sr-only" checked={checked} onChange={onChange} />
        <div
          className={`w-5 h-5 rounded-full border ${checked ? "border-primary bg-primary" : "border-muted-foreground"} flex items-center justify-center`}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-background"></div>}
        </div>
        <span className="ml-2 text-foreground">{label}</span>
      </div>
    </label>
  )
}

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: () => void
}

export const Toggle: React.FC<ToggleProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <button
          className={`w-6 h-6 rounded-full flex items-center justify-center ${checked ? "bg-primary" : "bg-background border border-muted-foreground"}`}
          onClick={onChange}
        >
          {checked && <div className="w-3 h-3 rounded-full bg-background"></div>}
        </button>
        <span className="ml-2 font-medium text-foreground">{label}</span>
      </div>
      {description && <p className="text-sm text-muted-foreground ml-8">{description}</p>}
    </div>
  )
}

