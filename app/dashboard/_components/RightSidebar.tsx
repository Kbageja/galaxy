"use client";

import { useWorkflowStore } from "@/lib/store";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export function RightSidebar() {
  const workflowHistory = useWorkflowStore((state) => state.workflowHistory);

  const isMediaUrl = (text: any) => {
    if (typeof text !== "string") return false;
    // Check for common image/video prefixes or extensions
    return (
      text.startsWith("data:image") ||
      text.startsWith("data:video") ||
      text.startsWith("blob:") ||
      text.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm)$/i)
    );
  };

  const getMediaLabel = (text: string) => {
    if (
      text.startsWith("data:video") ||
      text.endsWith(".mp4") ||
      text.endsWith(".webm")
    ) {
      return "View Video";
    }
    return "View Image";
  };

  return (
    <div className="w-80 border-l border-gray-800 bg-[#141415] flex flex-col h-full font-dm-sans">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Tasks History
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {workflowHistory.map((run) => (
          <div key={run.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200">
                Run #{run.id.split("-").pop()?.substring(0, 4)} —{" "}
                {run.timestamp}
              </span>
            </div>

            <div className="space-y-4 ml-2 border-l border-gray-800 pl-4">
              {run.logs.map((log) => (
                <div key={log.id} className="relative">
                  {/* Connector line */}
                  <div className="absolute -left-4 top-3 w-4 h-px bg-gray-800"></div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300 font-medium">
                          {log.nodeLabel}
                        </span>
                        {log.status === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className="text-[10px] text-gray-500">
                          {log.duration}s
                        </span>
                      </div>
                    </div>

                    {log.status === "success" && log.output && (
                      <div className="flex items-start gap-2 ml-2">
                        <div className="mt-1 w-3 h-3 border-l border-b border-gray-800 rounded-bl-sm"></div>
                        <div className="flex-1 bg-[#1e1e20] rounded-lg p-2 border border-gray-800/50">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FileText className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-500 font-medium uppercase">
                              Output
                            </span>
                          </div>

                          {isMediaUrl(log.output) ? (
                            <a
                              href={log.output}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 transition-colors mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {getMediaLabel(log.output)}
                            </a>
                          ) : (
                            <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed break-all">
                              {typeof log.output === "string"
                                ? log.output
                                : JSON.stringify(log.output)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {log.status === "error" && log.error && (
                      <div className="flex items-start gap-2 ml-2">
                        <div className="mt-1 w-3 h-3 border-l border-b border-gray-800 rounded-bl-sm"></div>
                        <div className="flex-1 bg-red-500/5 rounded-lg p-2 border border-red-500/10">
                          <div className="flex items-center gap-1.5 mb-1">
                            <XCircle className="w-3 h-3 text-red-500/60" />
                            <span className="text-[10px] text-red-500/60 font-medium uppercase">
                              Error
                            </span>
                          </div>
                          <p className="text-[11px] text-red-400/80 line-clamp-3 leading-relaxed">
                            {log.error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {workflowHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 bg-gray-800/30 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">No execution history yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Run a node to see results here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
