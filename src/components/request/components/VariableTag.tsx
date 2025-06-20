"use client";

import React from 'react';

type VariableTagProps = {
  children: React.ReactNode;
};

export const VariableTag: React.FC<VariableTagProps> = ({ children }) => {
  return (
    <span
      className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md mx-1"
      contentEditable={false}
    >
      {children}
    </span>
  );
}; 