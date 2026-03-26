"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";

export function DeleteUsageEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(searchParams.toString());
      query.set("id", entryId);

      const response = await fetch(`/api/monitor/usage?${query.toString()}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!payload.success || !payload.data?.deleted) {
        throw new Error(payload.error?.message ?? "删除调用记录失败");
      }

      toast.success("调用记录已删除");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除调用记录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-8 w-8 rounded-full p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">删除这条调用记录</span>
      </Button>
      <ConfirmDialog
        open={open}
        loading={loading}
        title="删除这条调用记录？"
        description="这只会删除当前这条监控记录，不影响其他调用历史。"
        confirmText="确认删除"
        cancelText="取消"
        destructive
        icon={<Trash2 className="h-5 w-5" />}
        onCancel={() => {
          if (!loading) {
            setOpen(false);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
