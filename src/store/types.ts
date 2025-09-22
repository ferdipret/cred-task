export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ColumnId = "todo" | "inprogress" | "done";

export interface FilterState {
  searchTerm: string;
  statusFilters: {
    todo: boolean;
    inprogress: boolean;
    done: boolean;
  };
}

export interface BoardState {
  tasks: Record<string, Task>;
  order: Record<ColumnId, string[]>;
  ui?: {
    filter?: string;
    selectedTaskId?: string;
  };
  filters: FilterState;
}

export type HistoryAction =
  | {
      type: "task_created";
      taskId: string;
      taskTitle: string;
      timestamp: string;
    }
  | {
      type: "task_moved";
      taskId: string;
      taskTitle: string;
      fromColumn: ColumnId;
      toColumn: ColumnId;
      timestamp: string;
    }
  | {
      type: "task_reordered";
      taskId: string;
      taskTitle: string;
      column: ColumnId;
      fromIndex: number;
      toIndex: number;
      timestamp: string;
    }
  | {
      type: "task_updated";
      taskId: string;
      taskTitle: string;
      changes: string[];
      timestamp: string;
    }
  | {
      type: "task_deleted";
      taskId: string;
      taskTitle: string;
      timestamp: string;
    };

export interface AppState {
  board: BoardState;
  history: HistoryAction[];
}
