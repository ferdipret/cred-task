import { create } from "zustand";
import type { AppState, ColumnId, Task, HistoryAction } from "./types";
import { createJSONStorage, persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { getEmptyBoard, nowISO } from "../utils/tasks";
import { HISTORY_LENGTH, PERSIST_KEY } from "../constants";

const addHistoryEntry = (state: AppState, action: HistoryAction): AppState => {
  const newHistory = [action, ...state.history].slice(0, HISTORY_LENGTH);
  return { ...state, history: newHistory };
};

export interface AppActions {
  addTask: (title: string, description?: string) => string;
  moveTask: (id: string, toColumn: ColumnId, toIndex?: number) => void;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "description">>,
  ) => void;
  deleteTask?: (id: string) => void;
  setSearchTerm: (searchTerm: string) => void;
  toggleStatusFilter: (status: ColumnId) => void;
  clearFilters: () => void;
}

export type AppStore = AppState & AppActions;

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      board: getEmptyBoard(),
      history: [],

      addTask: (title: string, description?: string) => {
        const id = nanoid();
        const task: Task = { id, title, description, createdAt: nowISO() };

        set((state) => {
          const { tasks, order } = state.board;

          const newState = {
            ...state,
            board: {
              ...state.board,
              tasks: { ...tasks, [id]: task },
              order: { ...order, todo: [id, ...order.todo] },
            },
          };

          const historyAction: HistoryAction = {
            type: "task_created",
            taskId: id,
            taskTitle: title,
            timestamp: nowISO(),
          };

          return addHistoryEntry(newState, historyAction);
        });

        return id;
      },

      moveTask: (
        taskId: string,
        targetColumn: ColumnId,
        targetIndex?: number,
      ) => {
        set((state) => {
          const board = state.board ?? getEmptyBoard();
          if (!board.tasks[taskId]) return state;

          const currentColumn = Object.entries(board.order).find(
            ([, taskIds]) => taskIds.includes(taskId),
          )?.[0] as ColumnId;

          if (!currentColumn) return state;

          const newOrder = {
            todo: board.order.todo.filter((id) => id !== taskId),
            inprogress: board.order.inprogress.filter((id) => id !== taskId),
            done: board.order.done.filter((id) => id !== taskId),
          };

          const targetColumnTasks = [...newOrder[targetColumn]];
          const insertIndex = targetIndex ?? targetColumnTasks.length;
          targetColumnTasks.splice(insertIndex, 0, taskId);
          newOrder[targetColumn] = targetColumnTasks;

          const newState = {
            ...state,
            board: { ...board, order: newOrder },
          };

          const historyAction: HistoryAction =
            currentColumn === targetColumn
              ? {
                  type: "task_reordered",
                  taskId,
                  taskTitle: board.tasks[taskId].title,
                  column: targetColumn,
                  fromIndex: board.order[currentColumn].indexOf(taskId),
                  toIndex: insertIndex,
                  timestamp: nowISO(),
                }
              : {
                  type: "task_moved",
                  taskId,
                  taskTitle: board.tasks[taskId].title,
                  fromColumn: currentColumn,
                  toColumn: targetColumn,
                  timestamp: nowISO(),
                };

          return addHistoryEntry(newState, historyAction);
        });
      },

      updateTask: (
        id: string,
        updates: Partial<Pick<Task, "title" | "description">>,
      ) => {
        set((state) => {
          const board = state.board ?? getEmptyBoard();
          if (!board.tasks[id]) return {};

          const oldTask = board.tasks[id];
          const updatedTask = { ...oldTask, ...updates };

          const changes: string[] = [];
          if (updates.title && updates.title !== oldTask.title) {
            changes.push(`title: "${oldTask.title}" → "${updates.title}"`);
          }
          if (
            updates.description !== undefined &&
            updates.description !== oldTask.description
          ) {
            const oldDesc = oldTask.description || "empty";
            const newDesc = updates.description || "empty";
            changes.push(`description: "${oldDesc}" → "${newDesc}"`);
          }

          const newState = {
            ...state,
            board: {
              ...board,
              tasks: { ...board.tasks, [id]: updatedTask },
            },
          };

          if (changes.length > 0) {
            const historyAction: HistoryAction = {
              type: "task_updated",
              taskId: id,
              taskTitle: updatedTask.title,
              changes,
              timestamp: nowISO(),
            };

            return addHistoryEntry(newState, historyAction);
          }

          return newState;
        });
      },

      deleteTask: (id: string) => {
        set((state) => {
          const board = state.board ?? getEmptyBoard();
          if (!board.tasks[id]) return {};

          const taskTitle = board.tasks[id].title;

          const newTasks = { ...board.tasks };
          delete newTasks[id];

          const newOrder = {
            todo: board.order.todo.filter((x) => x !== id),
            inprogress: board.order.inprogress.filter((x) => x !== id),
            done: board.order.done.filter((x) => x !== id),
          };

          const newState = {
            ...state,
            board: { ...board, tasks: newTasks, order: newOrder },
          };

          const historyAction: HistoryAction = {
            type: "task_deleted",
            taskId: id,
            taskTitle,
            timestamp: nowISO(),
          };

          return addHistoryEntry(newState, historyAction);
        });
      },

      setSearchTerm: (searchTerm: string) => {
        set((state) => ({
          ...state,
          board: {
            ...state.board,
            filters: {
              ...(state.board.filters || {
                searchTerm: "",
                statusFilters: { todo: true, inprogress: true, done: true },
              }),
              searchTerm,
            },
          },
        }));
      },

      toggleStatusFilter: (status: ColumnId) => {
        set((state) => {
          const currentFilters = state.board.filters || {
            searchTerm: "",
            statusFilters: { todo: true, inprogress: true, done: true },
          };

          return {
            ...state,
            board: {
              ...state.board,
              filters: {
                ...currentFilters,
                statusFilters: {
                  ...currentFilters.statusFilters,
                  [status]: !currentFilters.statusFilters[status],
                },
              },
            },
          };
        });
      },

      clearFilters: () => {
        set((state) => ({
          ...state,
          board: {
            ...state.board,
            filters: {
              searchTerm: "",
              statusFilters: {
                todo: true,
                inprogress: true,
                done: true,
              },
            },
          },
        }));
      },
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export default useStore;
