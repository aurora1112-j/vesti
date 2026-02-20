"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const mockNodes = [
  { id: 1, x: 420, y: 280, r: 22, color: "#10A37F", label: "React Virtual List", platform: "ChatGPT" },
  { id: 2, x: 580, y: 200, r: 18, color: "#D97757", label: "Rust Ownership", platform: "Claude" },
  { id: 3, x: 650, y: 340, r: 16, color: "#4285F4", label: "AI Papers 2024", platform: "Gemini" },
  { id: 4, x: 300, y: 200, r: 20, color: "#1565C0", label: "PostgreSQL Tuning", platform: "DeepSeek" },
  { id: 5, x: 500, y: 420, r: 24, color: "#10A37F", label: "Chrome Extension", platform: "ChatGPT" },
  { id: 6, x: 740, y: 260, r: 17, color: "#D97757", label: "TypeScript Migration", platform: "Claude" },
  { id: 7, x: 350, y: 380, r: 15, color: "#1565C0", label: "Docker Compose", platform: "DeepSeek" },
  { id: 8, x: 680, y: 440, r: 16, color: "#4285F4", label: "SwiftUI vs Flutter", platform: "Gemini" },
];

const mockEdges = [
  { source: 1, target: 5, weight: 0.87 },
  { source: 1, target: 6, weight: 0.74 },
  { source: 2, target: 6, weight: 0.65 },
  { source: 4, target: 7, weight: 0.78 },
  { source: 3, target: 8, weight: 0.61 },
  { source: 5, target: 6, weight: 0.55 },
  { source: 1, target: 4, weight: 0.42 },
];

const platformFilters = [
  { label: "All", value: "all" },
  { label: "ChatGPT", value: "chatgpt" },
  { label: "Claude", value: "claude" },
  { label: "Gemini", value: "gemini" },
  { label: "DeepSeek", value: "deepseek" },
];

export function NetworkTab() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedNode, setSelectedNode] = useState<typeof mockNodes[number] | null>(null);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 bg-bg-tertiary border-b border-border-subtle px-4 flex items-center gap-3">
        {platformFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={`px-3 py-1 rounded-full text-[11px] font-sans transition-all ${
              selectedFilter === filter.value
                ? "bg-accent-primary text-white"
                : "bg-bg-surface-card text-text-secondary hover:bg-bg-surface-card-hover"
            }`}
          >
            {filter.label}
          </button>
        ))}

        <button className="ml-auto px-3 py-1 rounded-md bg-bg-surface-card hover:bg-bg-surface-card-hover text-[11px] font-sans text-text-secondary transition-all flex items-center gap-1.5">
          Time Range
          <ChevronDown strokeWidth={1.5} className="w-3 h-3" />
        </button>
        <button className="px-3 py-1 rounded-md bg-bg-surface-card hover:bg-bg-surface-card-hover text-[11px] font-sans text-text-secondary transition-all">
          Reset View
        </button>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative bg-bg-tertiary overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 1040 580">
          {mockEdges.map((edge) => {
            const s = mockNodes.find((n) => n.id === edge.source);
            const t = mockNodes.find((n) => n.id === edge.target);
            if (!s || !t) return null;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="#E5E3DB"
                strokeWidth={edge.weight * 3}
                strokeOpacity={0.4 + edge.weight * 0.4}
              />
            );
          })}
          {mockNodes.map((node) => (
            <g
              key={node.id}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedNode(node)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={node.color}
                fillOpacity={0.85}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y + node.r + 14}
                textAnchor="middle"
                fontSize={11}
                fill="#6B6B6B"
                fontFamily="'Google Sans', sans-serif"
              >
                {node.label.length > 16 ? node.label.slice(0, 16) + "…" : node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-bg-surface-card rounded-lg px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
            <span className="text-[11px] font-sans text-text-secondary">ChatGPT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D97757]" />
            <span className="text-[11px] font-sans text-text-secondary">Claude</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <span className="text-[11px] font-sans text-text-secondary">Gemini</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
            <span className="text-[11px] font-sans text-text-secondary">DeepSeek</span>
          </div>
        </div>

        {/* Node Detail Drawer */}
        <div
          className={`fixed top-0 right-0 bottom-0 w-80 bg-bg-primary shadow-2xl z-50 overflow-y-auto transition-transform duration-200 ${
            selectedNode ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedNode && (
            <div className="p-6">
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs font-sans text-text-tertiary hover:text-text-primary mb-6"
              >
                ← Close
              </button>
              <h2 className="text-lg font-serif font-normal text-text-primary mb-3">
                {selectedNode.label}
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-sans text-text-tertiary mb-6">
                <span>{selectedNode.platform}</span>
                <span>·</span>
                <span>2yr ago</span>
              </div>

              {/* Summary Card */}
              <div className="mb-6 p-3 rounded-lg bg-bg-surface-card">
                <div className="text-sm font-sans text-text-primary mb-2">AI Summary</div>
                <div className="text-[13px] font-sans text-text-secondary">
                  Discussed key implementation details and trade-offs. Highlights include performance
                  optimizations and future scalability concerns.
                </div>
              </div>

              <button className="text-sm font-sans text-accent-primary flex items-center gap-1">
                View in Library
                <ArrowRight strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
