import { CircleCheck, CircleDashed, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TaskFilter } from "@/types/api";

const FILTERS: Array<{ label: string; value: TaskFilter; Icon: LucideIcon }> = [
  { label: "All", value: "all", Icon: Layers },
  { label: "Completed", value: "completed", Icon: CircleCheck },
  { label: "Pending", value: "pending", Icon: CircleDashed },
];

type StatusFilterProps = {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
};

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <section aria-label="Filter tasks by status" className="card filter-row">
      {FILTERS.map((filter) => {
        const active = filter.value === value;

        return (
          <button
            key={filter.value}
            type="button"
            className={active ? "button primary" : "button"}
            onClick={() => onChange(filter.value)}
            aria-pressed={active}
          >
            <filter.Icon size={16} aria-hidden="true" />
            {filter.label}
          </button>
        );
      })}
    </section>
  );
}
