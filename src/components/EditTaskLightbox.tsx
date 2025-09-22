import { useState, useEffect } from "react";
import type { Task } from "../store/types";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

type EditTaskLightboxProps = {
  task: Task;
  onClose: () => void;
  onSave: (updates: Partial<Pick<Task, "title" | "description">>) => void;
};

export function EditTaskLightbox({
  task,
  onClose,
  onSave,
}: EditTaskLightboxProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  const handleDiscard = () => {
    setTitle(task.title);
    setDescription(task.description || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />

      <div className="relative bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md sm:max-w-lg lg:max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white bg-opacity-50 sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pr-2">
            Edit Task
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-white bg-opacity-30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 bg-opacity-90"
                placeholder="Make it a good one..."
                maxLength={100}
                required
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                {title.length}/100 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="edit-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 bg-opacity-90 resize-none"
                placeholder="Leave nothing open to their imaginations..."
                rows={4}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/500 characters
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleDiscard}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
              >
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
