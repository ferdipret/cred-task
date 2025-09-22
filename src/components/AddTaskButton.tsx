import React, { useState } from "react";
import useStore from "../store";
import { Lightbox } from "./Lightbox";
import { PlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

export function AddTaskButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const addTask = useStore((s) => s.addTask);

  const handleOpen = () => {
    setIsModalOpen(true);
    setTitle("");
    setDescription("");
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) return;

    addTask(title.trim(), description.trim() || undefined);
    handleClose();
  };

  const handleDiscard = () => {
    handleClose();
  };

  const isFormValid = title.trim().length > 0;

  return (
    <>
      <button
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all ease-in-out duration-200 font-bold uppercase flex items-center gap-2 shadow-md hover:shadow-lg"
        onClick={handleOpen}
      >
        <PlusIcon className="w-5 h-5" />
        Add task
      </button>

      <Lightbox
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Create New Task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Make it a good one..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              maxLength={100}
            />
            {title.length > 80 && (
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Leave nothing open to their imaginations..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              maxLength={500}
            />
            {description.length > 400 && (
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleDiscard}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white bg-opacity-90 border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Discard
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </form>
      </Lightbox>
    </>
  );
}
