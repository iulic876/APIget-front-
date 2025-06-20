"use client";

import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

type EditableDivProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
  placeholder?: string;
};

// Helper function to set cursor position
const setCursor = (node: Node, position: 'start' | 'end') => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(node);
  range.collapse(position === 'start');
  selection?.removeAllRanges();
  selection?.addRange(range);
};

export const EditableDiv = forwardRef<HTMLDivElement, EditableDivProps>(({ value, onChange, onKeyDown, className, placeholder }, ref) => {
  const divRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => divRef.current as HTMLDivElement);

  // This effect synchronizes the div's content with the `value` prop
  useEffect(() => {
    const element = divRef.current;
    if (!element) return;

    // A simple way to check if an update is needed is to compare the text content.
    // A more robust solution would compare the DOM structure.
    let currentText = '';
    element.childNodes.forEach(node => {
      currentText += node.textContent;
    })
    
    if (currentText === value) {
      return;
    }

    // When the value changes, re-render the content
    element.innerHTML = '';
    const parts = value.split(/(\{\{[^}]+\}\})/g);

    parts.forEach(part => {
      if (part.match(/(\{\{[^}]+\}\})/)) {
        const span = document.createElement('span');
        span.className = "bg-blue-500/20 text-blue-300 px-1 rounded-md mx-0.5";
        span.contentEditable = 'false';
        span.textContent = part;
        element.appendChild(span);
      } else if(part) {
        element.appendChild(document.createTextNode(part));
      }
    });

  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    let textContent = '';
    target.childNodes.forEach(node => {
        textContent += node.textContent;
    });
    onChange(textContent);
  };
  
  return (
    <div
      ref={divRef}
      contentEditable
      onInput={handleInput}
      onKeyDown={onKeyDown}
      className={className}
      suppressContentEditableWarning={true}
      data-placeholder={placeholder}
      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
    />
  );
});

EditableDiv.displayName = 'EditableDiv'; 