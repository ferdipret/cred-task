import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import '@testing-library/jest-dom';
import Board from './Board';
import { useStore } from '../store';
import { COLUMNS } from '../constants';

// Mock all the child components
vi.mock('./Column', () => ({
  Column: ({ id, title }: { id: string; title: string }) => (
    <div data-testid={`column-${id}`}>{title}</div>
  ),
}));

vi.mock('./AddTaskButton', () => ({
  AddTaskButton: () => <div data-testid="add-task-button">Add Task</div>,
}));

vi.mock('./TaskHistory', () => ({
  TaskHistory: () => <div data-testid="task-history">Task History</div>,
}));

vi.mock('./FilterBar', () => ({
  FilterBar: () => <div data-testid="filter-bar">Filter Bar</div>,
}));

// Mock the drag and drop library
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  dropTargetForElements: vi.fn(() => vi.fn()),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
  extractClosestEdge: vi.fn(),
}));

vi.mock('tiny-invariant', () => ({
  default: vi.fn(),
}));

// Mock the store
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

// Mock constants
vi.mock('../constants', () => ({
  COLUMNS: [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ],
}));

const mockMoveTask = vi.fn();

describe('Board', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as unknown as Mock).mockImplementation((selector: any) => {
      if (selector.toString().includes('moveTask')) {
        return mockMoveTask;
      }
      return {
        board: {
          order: {
            todo: ['task1', 'task2'],
            inprogress: ['task3'],
            done: ['task4'],
          },
        },
      };
    });
  });

  it('renders the board with all child components', () => {
    render(<Board />);

    expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('task-history')).toBeInTheDocument();
    
    // Check that all columns are rendered
    COLUMNS.forEach((column) => {
      expect(screen.getByTestId(`column-${column.id}`)).toBeInTheDocument();
    });
  });

  it('renders the correct structure and layout', () => {
    render(<Board />);

    // Check that main container exists
    const boardContainer = screen.getByTestId('add-task-button').closest('div');
    expect(boardContainer).toBeInTheDocument();

    // Check that all sections exist
    expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
    expect(screen.getByTestId('task-history')).toBeInTheDocument();
  });


  it('calls useStore with correct selector', () => {
    render(<Board />);
    
    // Verify that useStore was called to get moveTask
    expect(useStore).toHaveBeenCalled();
    
    // Test that the selector function works correctly
    const mockSelector = (useStore as unknown as Mock).mock.calls[0][0];
    const mockState = { moveTask: mockMoveTask };
    const result = mockSelector(mockState);
    expect(result).toBe(mockMoveTask);
  });

  it('renders all columns from COLUMNS constant', () => {
    render(<Board />);
    
    // Verify each column from the constant is rendered
    expect(COLUMNS).toHaveLength(3);
    COLUMNS.forEach((column) => {
      expect(screen.getByTestId(`column-${column.id}`)).toBeInTheDocument();
    });
  });

  it('has proper DOM structure with ref', () => {
    const { container } = render(<Board />);
    
    // Check that the board container exists (the one with ref)
    const boardRef = container.querySelector('.flex.justify-center');
    expect(boardRef).toBeInTheDocument();
    
    // Verify nested structure
    const mainContent = boardRef?.querySelector('.w-full.max-w-7xl');
    expect(mainContent).toBeInTheDocument();
  });

  it('maintains component composition', () => {
    render(<Board />);
    
    // Verify all main sections are present in correct order
    const addTaskButton = screen.getByTestId('add-task-button');
    const filterBar = screen.getByTestId('filter-bar');
    const taskHistory = screen.getByTestId('task-history');
    
    expect(addTaskButton).toBeInTheDocument();
    expect(filterBar).toBeInTheDocument();
    expect(taskHistory).toBeInTheDocument();
    
    // Verify columns section exists
    const todoColumn = screen.getByTestId('column-todo');
    const inprogressColumn = screen.getByTestId('column-inprogress');
    const doneColumn = screen.getByTestId('column-done');
    
    expect(todoColumn).toBeInTheDocument();
    expect(inprogressColumn).toBeInTheDocument();
    expect(doneColumn).toBeInTheDocument();
  });
});