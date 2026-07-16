import React from "react";
import { Sparkles } from "lucide-react";

const STEPS = [
  { step: 1, label: "接收建議" },
  { step: 2, label: "Prompt優化" },
  { step: 3, label: "關鍵幀" },
  { step: 4, label: "圖審" },
  { step: 5, label: "影片" },
  { step: 6, label: "片審" },
  { step: 7, label: "輸出建議" },
] as const;

export function WorkflowStepper({
  workflowStep = 1,
  title = "七步製片工作流進度",
  subtitle,
  accent = "indigo",
}: {
  workflowStep?: number;
  title?: string;
  subtitle?: string;
  accent?: "indigo" | "purple" | "emerald";
}) {
  const step = Math.max(1, Math.min(7, workflowStep || 1));
  const ring =
    accent === "purple"
      ? "ring-purple-500/25 bg-purple-600"
      : accent === "emerald"
        ? "ring-emerald-500/25 bg-emerald-600"
        : "ring-indigo-500/25 bg-indigo-600";
  const bar =
    accent === "purple"
      ? "bg-purple-500"
      : accent === "emerald"
        ? "bg-emerald-500"
        : "bg-indigo-500";
  const activeText =
    accent === "purple"
      ? "text-purple-300"
      : accent === "emerald"
        ? "text-emerald-300"
        : "text-indigo-300";

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className={`w-3.5 h-3.5 shrink-0 ${activeText}`} />
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-200 tracking-wide truncate">{title}</div>
            {subtitle ? (
              <div className="text-[9px] text-slate-500 truncate">{subtitle}</div>
            ) : null}
          </div>
        </div>
        <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700 ${activeText}`}>
          STEP {step} / 7
        </div>
      </div>

      <div className="relative flex items-center justify-between w-full select-none py-1">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className={`absolute left-0 top-1/2 h-[2px] ${bar} transition-all duration-300 -translate-y-1/2 z-0`}
          style={{ width: `${((step - 1) / 6) * 100}%` }}
        />
        {STEPS.map((item) => {
          const isCompleted = step > item.step;
          const isActive = step === item.step;
          return (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-slate-950"
                    : isActive
                      ? `${ring} text-white ring-4 scale-110`
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                }`}
              >
                {isCompleted ? "✓" : item.step}
              </div>
              <span
                className={`text-[8px] mt-1 font-bold whitespace-nowrap ${
                  isActive ? activeText : isCompleted ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
