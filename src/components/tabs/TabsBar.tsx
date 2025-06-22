"use client";

import { useTabs } from "./TabsContext";
import clsx from "clsx";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTabProps {
  tab: any;
  isActive: boolean;
  onTabClick: () => void;
  onCloseClick: () => void;
}

const SortableTab = ({ tab, isActive, onTabClick, onCloseClick }: SortableTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "flex items-center px-3 py-1 text-sm rounded-md space-x-2 max-w-xs cursor-grab active:cursor-grabbing",
        isActive
          ? "bg-[#21262d] text-white"
          : "text-gray-400 hover:text-white hover:bg-[#1e242c]"
      )}
    >
      {/* Drag handle */}
      <GripVertical className="w-3 h-3 text-neutral-500 hover:text-neutral-300" />
      
      {/* Make label clickable */}
      <button
        onClick={onTabClick}
        className="truncate max-w-[140px]"
      >
        {tab.label}
      </button>

      {/* ❌ Close button */}
      <button
        onClick={onCloseClick}
        className="text-neutral-600 hover:text-red-300"
      >
        ×
      </button>
    </div>
  );
};

export const TabsBar = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, reorderTabs } = useTabs();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tabs.findIndex(tab => tab.id === active.id);
      const newIndex = tabs.findIndex(tab => tab.id === over?.id);
      
      reorderTabs(oldIndex, newIndex);
    }
  };

  return (
    <div className="bg-[#161b22] border-b border-[#2a2f38] h-10 px-4 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tabs.map(tab => tab.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex items-center space-x-2 h-full">
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                onTabClick={() => setActiveTab(tab.id)}
                onCloseClick={() => closeTab(tab.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
