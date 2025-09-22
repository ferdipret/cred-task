import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useStore from "../store";
import type { ColumnId } from "../store/types";
import { COLUMN_LABELS } from "../constants";

export function FilterBar() {
  const filters = useStore(
    (state) =>
      state.board.filters || {
        searchTerm: "",
        statusFilters: {
          todo: true,
          inprogress: true,
          done: true,
        },
      }
  );
  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const toggleStatusFilter = useStore((state) => state.toggleStatusFilter);
  const clearFilters = useStore((state) => state.clearFilters);

  const hasActiveFilters =
    filters.searchTerm.trim() !== "" ||
    !filters.statusFilters.todo ||
    !filters.statusFilters.inprogress ||
    !filters.statusFilters.done;

  const activeFilterCount =
    (filters.searchTerm.trim() !== "" ? 1 : 0) +
    (filters.statusFilters.todo ? 0 : 1) +
    (filters.statusFilters.inprogress ? 0 : 1) +
    (filters.statusFilters.done ? 0 : 1);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white bg-opacity-90 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search tasks by title or description..."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.entries(COLUMN_LABELS).map(([status, label]) => (
            <label
              key={status}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.statusFilters[status as ColumnId]}
                onChange={() => toggleStatusFilter(status as ColumnId)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white bg-opacity-90 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            {filters.searchTerm.trim() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{filters.searchTerm}"
              </span>
            )}
            {Object.entries(COLUMN_LABELS).map(([status, label]) => {
              if (filters.statusFilters[status as ColumnId]) return null;
              return (
                <span
                  key={status}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                >
                  Hidden: {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
