import { useEffect, useRef, useState } from "react";
import type { Task } from "../store/types";
import useStore from "../store";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { EditTaskLightbox } from "./EditTaskLightbox";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import invariant from "tiny-invariant";

type TaskCardProps = {
  task: Task;
  index?: number;
};

export function TaskCard({ task }: TaskCardProps) {
  const taskCardRef = useRef<HTMLLIElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showEditLightbox, setShowEditLightbox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const taskCardEl = taskCardRef.current;
    invariant(taskCardEl);

    const cleanupDrag = draggable({
      element: taskCardEl,
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
      getInitialData: () => ({ id: task.id }),
    });

    const cleanupDrop = dropTargetForElements({
      element: taskCardEl,
      canDrop: ({ source }) => {
        const data = source.data as { id: string };
        return data?.id !== task.id;
      },
      getData: ({ input }) =>
        attachClosestEdge(
          { taskId: task.id },
          {
            element: taskCardEl,
            input,
            allowedEdges: ["top", "bottom"],
          }
        ),
    });

    return () => {
      cleanupDrag?.();
      cleanupDrop?.();
    };
  }, [task.id]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      updateTask(task.id, { title: trimmedTitle });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEdit();
    }
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowEditLightbox(true);
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTask) {
      deleteTask(task.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    setEditTitle(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <li
      ref={taskCardRef}
      data-task-id={task.id}
      className={`relative p-4 rounded-lg bg-white min-h-20 border-gray-200 border cursor-grab active:cursor-grabbing mb-2 group hover:shadow-md hover:border-blue-200 transition-all duration-200 ${
        dragging ? "cursor-grabbing opacity-50" : "cursor-grab"
      }`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(event) => setEditTitle(event.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="w-full text-lg font-medium text-gray-800 bg-blue-50 border border-blue-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={100}
        />
      ) : (
        <div
          className="text-lg font-medium text-gray-800 cursor-text hover:bg-blue-50 py-0.5 rounded transition-colors"
          onClick={handleStartEdit}
          title="Click to edit title"
        >
          {task.title}
        </div>
      )}
      <div className="text-xs font-medium text-gray-600 mb-2">
        {task.description}
      </div>

      <div className="flex items-center justify-end space-x-1 pt-1 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEditClick}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
          title="Edit task"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
          title="Delete task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={handleCancelDelete}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Task
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{task.title}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditLightbox && (
        <EditTaskLightbox
          task={task}
          onClose={() => setShowEditLightbox(false)}
          onSave={(updates) => {
            updateTask(task.id, updates);
            setShowEditLightbox(false);
          }}
        />
      )}
    </li>
  );
}
