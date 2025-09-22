import {
  ClockIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowsUpDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { HistoryAction } from "../store/types";
import useStore from "../store";

export function TaskHistory() {
  const history = useStore((s) => s.history);

  const getActionIcon = (action: HistoryAction) => {
    switch (action.type) {
      case "task_created":
        return <PlusIcon className="w-4 h-4 text-green-600" />;
      case "task_moved":
        return <ArrowRightIcon className="w-4 h-4 text-blue-600" />;
      case "task_reordered":
        return <ArrowsUpDownIcon className="w-4 h-4 text-purple-600" />;
      case "task_updated":
        return <PencilIcon className="w-4 h-4 text-orange-600" />;
      case "task_deleted":
        return <TrashIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionText = (action: HistoryAction) => {
    switch (action.type) {
      case "task_created":
        return `Created task "${action.taskTitle}"`;
      case "task_moved": {
        const fromColumn =
          action.fromColumn === "todo"
            ? "To Do"
            : action.fromColumn === "inprogress"
            ? "In Progress"
            : "Done";
        const toColumn =
          action.toColumn === "todo"
            ? "To Do"
            : action.toColumn === "inprogress"
            ? "In Progress"
            : "Done";
        return `Moved "${action.taskTitle}" from ${fromColumn} to ${toColumn}`;
      }
      case "task_reordered": {
        const columnName =
          action.column === "todo"
            ? "To Do"
            : action.column === "inprogress"
            ? "In Progress"
            : "Done";
        return `Reordered "${action.taskTitle}" in ${columnName}`;
      }
      case "task_updated":
        return `Updated "${action.taskTitle}": ${action.changes.join(", ")}`;
      case "task_deleted":
        return `Deleted task "${action.taskTitle}"`;
      default:
        return "Unknown action";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Task History</h3>
        </div>
        <p className="text-sm text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <ClockIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Task History</h3>
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
          Last {history.length} actions
        </span>
      </div>

      <div className="space-y-3">
        {history.map((action, index) => (
          <div
            key={`${action.taskId}-${action.timestamp}-${index}`}
            className="flex items-start space-x-3 p-3 rounded-lg bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex-shrink-0 mt-0.5">{getActionIcon(action)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {getActionText(action)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(action.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
