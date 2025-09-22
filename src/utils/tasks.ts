import type { BoardState, ColumnId } from "../store/types";

export const nowISO = () => new Date().toISOString();

export const emptyOrder = (): Record<ColumnId, string[]> => ({
  todo: [],
  inprogress: [],
  done: [],
});

export const getEmptyBoard = (): BoardState => ({
  tasks: {},
  order: emptyOrder(),
  ui: { filter: "" },
  filters: {
    searchTerm: "",
    statusFilters: {
      todo: true,
      inprogress: true,
      done: true,
    },
  },
});

import type { Task } from "../store/types";

export const getTasksById = (id: string, tasks: Record<string, Task>) => {
  return tasks[id];
};
