export function DiscoveryHistoryTimeline({ history = [] }) {
  const items = history.length > 0 ? history : [
    { date: "11 Aug 2026", category: "proxy", title: "Nginx version upgrade detected (1.24 -> 1.26.1)" },
    { date: "8 Aug 2026", category: "api", title: "New API endpoint route added (/api/v1/checkout/stripe)" },
    { date: "2 Aug 2026", category: "database", title: "Database migrated to PostgreSQL 16 Primary" }
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10 text-white/70">📜</span>
            <h3 className="text-sm font-semibold text-white">Architecture Discovery History & Timeline</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">Historical record of detected technology stack, version, & infrastructure shifts</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs">
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
              {item.date}
            </span>
            <div className="flex-1">
              <span className="font-bold text-white">{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
