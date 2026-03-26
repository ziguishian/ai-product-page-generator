"use client";

import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  icon?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  icon,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭确认弹窗"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative z-[121] w-full max-w-md rounded-[28px] border border-border bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#111214]">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-white/8 dark:text-slate-100">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 space-y-2">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
            {description ? <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading} className="rounded-xl">
            {cancelText}
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "rounded-xl",
              destructive && "bg-black text-white hover:bg-black/90",
            )}
          >
            {loading ? "处理中..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
