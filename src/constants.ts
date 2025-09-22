import type { ColumnId } from "./store/types";

export const COLUMNS = [
  { id: "todo", title: "To-do" },
  { id: "inprogress", title: "In progress" },
  { id: "done", title: "Done" },
] as const;

export const COLUMN_LABELS: Record<ColumnId, string> = COLUMNS.reduce(
  (acc, col) => {
    acc[col.id] = col.title;
    return acc;
  },
  {} as Record<ColumnId, string>
);

export const HISTORY_LENGTH = 5;

export const PERSIST_KEY = "app.store";
