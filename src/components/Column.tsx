import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnId } from "../store/types";
import useStore from "../store";
import invariant from "tiny-invariant";
import { TaskCard } from "./TaskCard";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const getHeaderColor = (id: string) => {
	switch (id) {
		case "todo":
			return "text-orange-700";
		case "inprogress":
			return "text-blue-700";
		case "done":
			return "text-green-700";
		default:
			return "text-gray-700";
	}
};

const getColumnColors = (cid: ColumnId) => {
	switch (cid) {
		case "todo":
			return "bg-orange-50 border-orange-200 outline-orange-500";
		case "inprogress":
			return "bg-blue-50 border-blue-200 outline-blue-500";
		case "done":
			return "bg-green-50 border-green-200 outline-green-500";
		default:
			return "bg-gray-50 border-gray-200 outline-gray-500";
	}
};

type ColumnProps = {
	id: ColumnId;
	title: string;

	children?: React.ReactNode;
};

export function Column({ id, title }: ColumnProps) {
	const order = useStore((s) => s.board.order);
	const tasks = useStore((s) => s.board.tasks);
	const filters = useStore((s) => s.board.filters);
	const columnRef = useRef<HTMLDivElement | null>(null);
	const [isDraggedOver, setIsDraggedOver] = useState(false);

	const filteredTasks = useMemo(() => {
		const columnTasks = order[id] ?? [];
		const currentFilters = filters || {
			searchTerm: "",
			statusFilters: { todo: true, inprogress: true, done: true },
		};

		if (!currentFilters.statusFilters[id]) {
			return [];
		}

		if (currentFilters.searchTerm.trim()) {
			const searchTerm = currentFilters.searchTerm.toLowerCase();
			return columnTasks.filter((taskId) => {
				const task = tasks[taskId];
				if (!task) return false;

				const titleMatch = task.title.toLowerCase().includes(searchTerm);
				const descriptionMatch =
					task.description?.toLowerCase().includes(searchTerm) || false;

				return titleMatch || descriptionMatch;
			});
		}

		return columnTasks;
	}, [order, tasks, filters, id]);

	useEffect(() => {
		const columnEl = columnRef.current;
		invariant(columnEl);

		return dropTargetForElements({
			element: columnEl,
			onDragEnter: () => setIsDraggedOver(true),
			onDragLeave: () => setIsDraggedOver(false),
			onDrop: () => setIsDraggedOver(false),
			getData: () => ({ columnId: id }),
		});
	}, [id]);

	return (
		<div
			aria-label={`column-${id}`}
			ref={columnRef}
			className={`w-full h-full min-h-[300px] p-3 sm:p-4 rounded-xl list-none border-2 transition-all duration-200 flex flex-col ${getColumnColors(
				id
			)} ${
				isDraggedOver ? "outline outline-2 outline-offset-2" : "border-dashed"
			} `}
		>
			<h3
				className={`flex justify-start font-bold text-sm ${getHeaderColor(
					id
				)} pb-2`}
			>
				{title}
			</h3>
			<ul className="m-0 p-0 flex-1">
				{filteredTasks.length === 0 && (order[id] ?? []).length > 0 ? (
					<li className="text-sm text-gray-500 italic text-center py-4">
						{filters?.statusFilters[id] === false
							? "Column hidden by filter"
							: "No tasks match search criteria"}
					</li>
				) : (
					filteredTasks.map((taskId, index) => {
						const task = tasks[taskId];

						if (!task) return null;

						return <TaskCard key={taskId} task={task} index={index} />;
					})
				)}
			</ul>
		</div>
	);
}
