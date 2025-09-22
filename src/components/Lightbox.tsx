import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export function Lightbox({ isOpen, onClose, children, title }: LightboxProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />

      <div className="relative bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-md sm:max-w-lg lg:max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200">
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white bg-opacity-50 sticky top-0 z-10">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pr-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0 p-1"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 bg-white bg-opacity-30">{children}</div>
      </div>
    </div>
  );
}
