import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import useStore from "./index";
import { PERSIST_KEY } from "../constants";

vi.mock("nanoid", () => ({ nanoid: () => "fixedid" }));

beforeEach(() => {
  try {
    localStorage.removeItem(PERSIST_KEY);
  } catch {
    /* ignore */
  }
  useStore.setState({
    board: {
      tasks: {},
      order: { todo: [], inprogress: [], done: [] },
      filters: {
        searchTerm: "",
        statusFilters: { todo: true, inprogress: true, done: true },
      },
    },
    history: [],
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("store.addTask", () => {
  it("returns id, creates the task, and prepends id to todo order", () => {
    const title = "Write TDD test";
    const desc = "some description";

    const id = useStore.getState().addTask(title, desc);
    expect(id).toBe("fixedid");

    const store = useStore.getState();
    expect(store.board).toBeDefined();
    expect(store.board!.tasks[id].title).toBe(title);
    expect(store.board!.tasks[id].description).toBe(desc);
    expect(store.board!.order.todo[0]).toBe(id);
  });

  it("creates task without description when description is not provided", () => {
    const title = "Simple task";
    const id = useStore.getState().addTask(title);

    const store = useStore.getState();
    expect(store.board!.tasks[id].title).toBe(title);
    expect(store.board!.tasks[id].description).toBeUndefined();
  });

  it("adds history entry for task creation", () => {
    const title = "Test task";
    useStore.getState().addTask(title);

    const store = useStore.getState();
    expect(store.history).toHaveLength(1);
    expect(store.history[0].type).toBe("task_created");
    expect(store.history[0].taskTitle).toBe(title);
  });
});

describe("store.moveTask", () => {
  beforeEach(() => {
    useStore.getState().addTask("Task 1");
    useStore.getState().addTask("Task 2");
  });

  it("moves task between columns", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().moveTask(taskId, "inprogress");

    const newStore = useStore.getState();
    expect(newStore.board.order.todo).not.toContain(taskId);
    expect(newStore.board.order.inprogress).toContain(taskId);
  });

  it("moves task to specific index in target column", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().addTask("In Progress Task");
    useStore.getState().moveTask(store.board.order.todo[0], "inprogress");

    useStore.getState().moveTask(taskId, "inprogress", 0);

    const newStore = useStore.getState();
    expect(newStore.board.order.inprogress[0]).toBe(taskId);
  });

  it("logs history for task movement between columns", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().moveTask(taskId, "done");

    const newStore = useStore.getState();
    const moveAction = newStore.history.find(
      (action) => action.type === "task_moved"
    );
    expect(moveAction).toBeDefined();
    expect(moveAction?.type).toBe("task_moved");
  });

  it("logs history for task reordering within same column", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().moveTask(taskId, "todo", 1);

    const newStore = useStore.getState();
    const reorderAction = newStore.history.find(
      (action) => action.type === "task_reordered"
    );
    expect(reorderAction).toBeDefined();
    expect(reorderAction?.type).toBe("task_reordered");
  });
});

describe("store.updateTask", () => {
  beforeEach(() => {
    useStore.getState().addTask("Original Title", "Original Description");
  });

  it("updates task title", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().updateTask(taskId, { title: "Updated Title" });

    const newStore = useStore.getState();
    expect(newStore.board.tasks[taskId].title).toBe("Updated Title");
    expect(newStore.board.tasks[taskId].description).toBe(
      "Original Description"
    );
  });

  it("updates task description", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore
      .getState()
      .updateTask(taskId, { description: "Updated Description" });

    const newStore = useStore.getState();
    expect(newStore.board.tasks[taskId].title).toBe("Original Title");
    expect(newStore.board.tasks[taskId].description).toBe(
      "Updated Description"
    );
  });

  it("updates both title and description", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().updateTask(taskId, {
      title: "New Title",
      description: "New Description",
    });

    const newStore = useStore.getState();
    expect(newStore.board.tasks[taskId].title).toBe("New Title");
    expect(newStore.board.tasks[taskId].description).toBe("New Description");
  });

  it("logs history for task updates", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().updateTask(taskId, { title: "Updated Title" });

    const newStore = useStore.getState();
    const updateAction = newStore.history.find(
      (action) => action.type === "task_updated"
    );
    expect(updateAction).toBeDefined();
    expect(updateAction?.type).toBe("task_updated");
    expect(updateAction?.changes).toContain(
      'title: "Original Title" → "Updated Title"'
    );
  });

  it("does not log history when no changes are made", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];
    const initialHistoryLength = store.history.length;

    useStore.getState().updateTask(taskId, { title: "Original Title" });

    const newStore = useStore.getState();
    expect(newStore.history).toHaveLength(initialHistoryLength);
  });
});

describe("store.deleteTask", () => {
  beforeEach(() => {
    useStore.getState().addTask("Task to delete");
  });

  it("deletes task from tasks and removes from all columns", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().deleteTask!(taskId);

    const newStore = useStore.getState();
    expect(newStore.board.tasks[taskId]).toBeUndefined();
    expect(newStore.board.order.todo).not.toContain(taskId);
    expect(newStore.board.order.inprogress).not.toContain(taskId);
    expect(newStore.board.order.done).not.toContain(taskId);
  });

  it("logs history for task deletion", () => {
    const store = useStore.getState();
    const taskId = store.board.order.todo[0];

    useStore.getState().deleteTask!(taskId);

    const newStore = useStore.getState();
    const deleteAction = newStore.history.find(
      (action) => action.type === "task_deleted"
    );
    expect(deleteAction).toBeDefined();
    expect(deleteAction?.type).toBe("task_deleted");
    expect(deleteAction?.taskTitle).toBe("Task to delete");
  });

  it("does nothing when trying to delete non-existent task", () => {
    const store = useStore.getState();
    const initialTasks = { ...store.board.tasks };
    const initialOrder = { ...store.board.order };

    useStore.getState().deleteTask!("non-existent-id");

    const newStore = useStore.getState();
    expect(newStore.board.tasks).toEqual(initialTasks);
    expect(newStore.board.order).toEqual(initialOrder);
  });
});

describe("store filter actions", () => {
  describe("setSearchTerm", () => {
    it("sets search term in filters", () => {
      useStore.getState().setSearchTerm("test search");

      const store = useStore.getState();
      expect(store.board.filters.searchTerm).toBe("test search");
    });

    it("preserves existing status filters when setting search term", () => {
      useStore.getState().toggleStatusFilter("done");
      useStore.getState().setSearchTerm("test");

      const store = useStore.getState();
      expect(store.board.filters.searchTerm).toBe("test");
      expect(store.board.filters.statusFilters.done).toBe(false);
    });
  });

  describe("toggleStatusFilter", () => {
    it("toggles status filter from true to false", () => {
      useStore.getState().toggleStatusFilter("todo");

      const store = useStore.getState();
      expect(store.board.filters.statusFilters.todo).toBe(false);
    });

    it("toggles status filter from false to true", () => {
      useStore.getState().toggleStatusFilter("todo");
      useStore.getState().toggleStatusFilter("todo");

      const store = useStore.getState();
      expect(store.board.filters.statusFilters.todo).toBe(true);
    });

    it("preserves other filters when toggling one", () => {
      useStore.getState().setSearchTerm("test");
      useStore.getState().toggleStatusFilter("inprogress");

      const store = useStore.getState();
      expect(store.board.filters.searchTerm).toBe("test");
      expect(store.board.filters.statusFilters.inprogress).toBe(false);
      expect(store.board.filters.statusFilters.todo).toBe(true);
      expect(store.board.filters.statusFilters.done).toBe(true);
    });
  });

  describe("clearFilters", () => {
    it("resets all filters to default state", () => {
      useStore.getState().setSearchTerm("test");
      useStore.getState().toggleStatusFilter("todo");
      useStore.getState().toggleStatusFilter("done");

      useStore.getState().clearFilters();

      const store = useStore.getState();
      expect(store.board.filters.searchTerm).toBe("");
      expect(store.board.filters.statusFilters.todo).toBe(true);
      expect(store.board.filters.statusFilters.inprogress).toBe(true);
      expect(store.board.filters.statusFilters.done).toBe(true);
    });
  });
});

describe("store history management", () => {
  it("limits history to 5 entries and keeps most recent", () => {
    for (let i = 0; i <= 10; i++) {
      useStore.getState().addTask(`Task ${i}`);
    }

    const store = useStore.getState();
    expect(store.history).toHaveLength(5);
    expect(store.history[0].taskTitle).toBe("Task 10");
    expect(store.history[1].taskTitle).toBe("Task 9");
  });

  it("adds most recent action at the beginning of history", () => {
    useStore.getState().addTask("First Task");
    useStore.getState().addTask("Second Task");

    const store = useStore.getState();
    expect(store.history[0].taskTitle).toBe("Second Task");
    expect(store.history[1].taskTitle).toBe("First Task");
  });
});
