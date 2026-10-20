import type { Task } from "@/types/api";

type TaskItemProps = {
  task: Task;
  busy: boolean;
  onToggle: (task: Task) => void;
};

export function TaskItem({ task, busy, onToggle }: TaskItemProps) {
  return (
    <li className="card task-item">
      <div className="task-item-head">
        <p className="task-title">{task.title}</p>
        <span className={`badge ${task.completed ? "badge--completed" : "badge--pending"}`}>
          {task.completed ? "Completed" : "Pending"}
        </span>
      </div>

      <small className="meta">Updated: {new Date(task.updatedAt).toLocaleString()}</small>

      <div>
        <button
          type="button"
          className="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
        >
          {busy ? "Saving..." : task.completed ? "Mark as Pending" : "Mark as Completed"}
        </button>
      </div>
    </li>
  );
}
