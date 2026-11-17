import Link from "next/link";
import { isQueue, queues, queueKeys, type Assignment } from "./queues";
import { QueueList } from "./QueueList";

type Filters = Record<string, string | string[] | undefined>;

export default async function OperationsPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  const queue = isQueue(filters.queue) ? filters.queue : "fulfillment";
  const rawPage = typeof filters.page === "string" ? Number(filters.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage >= 1 && rawPage <= 10000 ? rawPage : 1;
  const assignment: Assignment = queue === "support" && (filters.assignment === "mine" || filters.assignment === "unassigned")
    ? filters.assignment
    : "all";

  return (
    <div className="space-y-5 pb-12">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Action Queue</h1>
        <p className="mt-1 text-sm text-slate-600">Review open work, oldest first.</p>
      </header>
      <nav aria-label="Operations queues" className="flex flex-wrap gap-2">
        {queueKeys.map((key) => (
          <Link key={key} href={`?queue=${key}`} aria-current={key === queue ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${key === queue ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
            {queues[key].label}
          </Link>
        ))}
      </nav>
      {queue === "support" && (
        <nav aria-label="Support assignment" className="flex flex-wrap gap-3">
          {(["all", "mine", "unassigned"] as const).map((value) => (
            <Link key={value} href={`?queue=support&assignment=${value}`}
              aria-current={value === assignment ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${value === assignment ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}>
              {{ all: "All tickets", mine: "My work", unassigned: "Unassigned" }[value]}
            </Link>
          ))}
        </nav>
      )}
      <QueueList key={`${queue}:${assignment}:${page}`} queue={queue} page={page} assignment={assignment} />
    </div>
  );
}
