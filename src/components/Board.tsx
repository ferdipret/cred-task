import { Column } from "./Column";
import { AddTaskButton } from "./AddTaskButton";
import { TaskHistory } from "./TaskHistory";
import { FilterBar } from "./FilterBar";
import { COLUMNS } from "../constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import invariant from "tiny-invariant";
import { useStore } from "../store";
import type { ColumnId } from "../store/types";

// Custom hook for drag and drop logic
function useBoardDragAndDrop() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const moveTask = useStore((s) => s.moveTask);

  const handleDrop = useCallback(
    ({ source, location }: { source: any; location: any }) => {
      const sourceTaskId = source.data.id as string;
      const dropTargets = location.current.dropTargets;

      // Find target column
      const columnTarget = dropTargets.find((t: any) => t.data?.columnId);
      const targetColumn = columnTarget?.data?.columnId as ColumnId;

      if (!targetColumn) return;

      // Find target task and closest edge
      const taskTarget = dropTargets.find((t: any) => t.data?.taskId);

      if (taskTarget) {
        const closestEdge = extractClosestEdge(taskTarget.data) as
          | "top"
          | "bottom"
          | null;
        const targetTaskId = taskTarget.data?.taskId as string;
        const board = useStore.getState().board;
        const targetTaskIndex =
          board.order[targetColumn]?.indexOf(targetTaskId) ?? -1;

        if (targetTaskIndex !== -1) {
          // Calculate insertion index based on closest edge
          const targetIndex =
            closestEdge === "bottom" ? targetTaskIndex + 1 : targetTaskIndex;
          moveTask(sourceTaskId, targetColumn, targetIndex);
        }
      } else {
        // Drop to empty area of column
        moveTask(sourceTaskId, targetColumn);
      }
    },
    [moveTask],
  );

  useEffect(() => {
    const boardEl = boardRef.current;
    invariant(boardEl);

    return dropTargetForElements({
      element: boardEl,
      onDrop: handleDrop,
    });
  }, [handleDrop]);

  return boardRef;
}

export default function Board() {
  const boardRef = useBoardDragAndDrop();

  return (
    <div className="flex justify-center" ref={boardRef}>
      <div className="w-full max-w-7xl bg-white m-4 sm:m-8 lg:m-12 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-4xl shadow-2xl shadow-gray-300">
        <div className="mb-4 sm:mb-6">
          <AddTaskButton />
        </div>

        <div className="mb-4 sm:mb-6">
          <FilterBar />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 items-stretch">
          {COLUMNS.map((col) => (
            <Column key={col.id} {...col} />
          ))}
        </div>

        <div className="mt-6 sm:mt-8">
          <TaskHistory />
        </div>
      </div>
    </div>
  );
}
