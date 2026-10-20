"use client";

import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/api";
import { StatusFilter } from "@/components/tasks/StatusFilter";
import { TaskList } from "@/components/tasks/TaskList";

export function TaskDashboard() {
  const {
    filteredTasks,
    filter,
    loading,
    error,
    updatingTaskId,
    setFilter,
    fetchTasks,
    updateTaskStatus,
  } = useTasks();

  const handleToggle = (task: Task) => {
    updateTaskStatus(task.id, !task.completed);
  };

  return (
    <section className="stack">
      <h1>Task Dashboard</h1>

      <StatusFilter value={filter} onChange={setFilter} />

      {loading ? (
        <div className="card muted" role="status">
          Loading tasks...
        </div>
      ) : null}

      {error ? (
        <div className="alert" role="alert">
          <p>{error}</p>
          <button type="button" className="button" onClick={fetchTasks}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <TaskList tasks={filteredTasks} updatingTaskId={updatingTaskId} onToggle={handleToggle} />
      ) : null}
    </section>
  );
}
