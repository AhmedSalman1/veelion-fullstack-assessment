import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TaskDashboard } from "@/components/tasks/TaskDashboard";

export default function TasksPage() {
  return (
    <main className="stack">
      <nav>
        <Link href="/" className="button icon-button" aria-label="Back to home">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
      </nav>
      <TaskDashboard />
    </main>
  );
}
