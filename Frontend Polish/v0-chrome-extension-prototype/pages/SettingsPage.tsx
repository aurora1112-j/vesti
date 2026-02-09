// ============================================================
// --- pages/SettingsPage.tsx ---
// Capture mode, storage, export, clear, about
// ============================================================
"use client";

import { useEffect, useState } from "react";
import {
  Radio,
  HardDrive,
  Download,
  Trash2,
  Info,
} from "lucide-react";
import type { CaptureMode } from "@/types";
import {
  getStorageUsage,
  exportData,
  clearAllData,
} from "@/services/mockService";

const CAPTURE_MODES: {
  value: CaptureMode;
  label: string;
  description: string;
  available: boolean;
}[] = [
  {
    value: "full_mirror",
    label: "全量镜像",
    description: "自动捕获所有 AI 对话",
    available: true,
  },
  {
    value: "smart_denoise",
    label: "智能降噪",
    description: "自动过滤无意义短对话",
    available: false,
  },
  {
    value: "curator",
    label: "手动归档",
    description: "仅手动标记的对话会被保存",
    available: false,
  },
];

export function SettingsPage() {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("full_mirror");
  const [storage, setStorage] = useState<{ used: number; total: number } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    getStorageUsage().then(setStorage);
  }, []);

  const handleExport = async () => {
    const blob = await exportData("json");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vesti-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    await clearAllData();
    setShowClearConfirm(false);
  };

  const usedKB = storage ? (storage.used / 1024).toFixed(0) : "...";
  const totalGB = storage ? (storage.total / 1_000_000_000).toFixed(0) : "...";
  const usagePercent = storage ? (storage.used / storage.total) * 100 : 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto vesti-scroll bg-bg-tertiary">
      {/* Header */}
      <header className="flex h-8 shrink-0 items-center px-4">
        <h1 className="text-vesti-xl font-semibold text-text-primary">
          Settings
        </h1>
      </header>

      <div className="flex flex-col gap-5 p-4">
        {/* Capture Mode */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <Radio className="h-4 w-4" strokeWidth={1.75} />
            捕获模式
          </h2>
          <div className="flex flex-col gap-1.5">
            {CAPTURE_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                disabled={!mode.available}
                onClick={() => mode.available && setCaptureMode(mode.value)}
                className={`flex items-start gap-3 rounded-md p-3 text-left transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                  captureMode === mode.value
                    ? "bg-accent-primary-light border border-accent-primary"
                    : "bg-surface-card border border-transparent"
                } ${!mode.available ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {/* Radio indicator */}
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    captureMode === mode.value
                      ? "border-accent-primary"
                      : "border-border-default"
                  }`}
                >
                  {captureMode === mode.value && (
                    <div className="h-2 w-2 rounded-full bg-accent-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-vesti-base font-medium text-text-primary">
                      {mode.label}
                    </span>
                    {!mode.available && (
                      <span className="rounded-full bg-bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-vesti-xs text-text-secondary">
                    {mode.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Storage */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <HardDrive className="h-4 w-4" strokeWidth={1.75} />
            存储用量
          </h2>
          <div className="rounded-md bg-surface-card p-3">
            <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full rounded-full bg-accent-primary transition-all duration-300"
                style={{ width: `${Math.max(usagePercent, 1)}%` }}
              />
            </div>
            <p className="mt-2 text-vesti-xs text-text-secondary">
              {usedKB} KB / {totalGB} GB
            </p>
          </div>
        </section>

        {/* Export */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <Download className="h-4 w-4" strokeWidth={1.75} />
            导出数据
          </h2>
          <button
            type="button"
            onClick={handleExport}
            className="w-full rounded-sm border border-border-default bg-bg-primary px-4 py-2 text-vesti-sm font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            导出为 JSON
          </button>
        </section>

        {/* Clear Data */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            清空数据
          </h2>
          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full rounded-sm border border-danger/30 bg-bg-primary px-4 py-2 text-vesti-sm font-medium text-danger transition-colors duration-[120ms] hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
            >
              清空所有数据
            </button>
          ) : (
            <div className="rounded-md border border-danger/30 bg-danger/10 p-3">
              <p className="mb-3 text-vesti-sm text-text-primary">
                确定要清空所有数据吗？此操作不可撤销。
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 rounded-sm bg-danger px-3 py-1.5 text-vesti-sm font-medium text-text-inverse transition-colors duration-[120ms] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                >
                  确认清空
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-sm border border-border-default bg-bg-primary px-3 py-1.5 text-vesti-sm font-medium text-text-primary transition-colors duration-[120ms] hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-vesti-sm font-medium text-text-secondary">
            <Info className="h-4 w-4" strokeWidth={1.75} />
            关于
          </h2>
          <div className="rounded-md bg-surface-card p-3">
            <p className="text-vesti-sm text-text-primary">
              心迹 Vesti — AI Memory Hub
            </p>
            <p className="mt-1 text-vesti-xs text-text-tertiary">
              v0.1.0
            </p>
            <p className="mt-1 text-vesti-xs text-text-tertiary">
              作者：TBD · 项目链接：TBD
            </p>
            <p className="mt-1 text-vesti-xs text-text-secondary">
              自动捕获你在 ChatGPT / Claude / Gemini / DeepSeek 上的对话记录，提供统一的时间轴回顾与量化面板。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
