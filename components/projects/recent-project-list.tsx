"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Layers3, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { platformLabels, styleLabels } from "@/types/domain";

interface RecentProjectListProps {
  initialProjects: Array<{
    id: string;
    name: string;
    status: string;
    platform: string;
    style: string;
    sectionCount: number;
    updatedAt: string | Date;
    coverImageUrl?: string | null;
  }>;
}

export function RecentProjectList({ initialProjects }: RecentProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    const response = await fetch(`/api/projects/${pendingDelete.id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!payload.success) {
      toast.error(payload.error?.message ?? "项目删除失败");
      setDeleting(false);
      return;
    }

    setProjects((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    setDeleting(false);
    toast.success("项目已删除");
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
        还没有历史项目，先从上方上传一张主商品图开始。
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
      {projects.map((project) => (
        <article
          key={project.id}
          className="group mb-4 break-inside-avoid overflow-hidden rounded-[28px] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="relative overflow-hidden rounded-t-[28px] bg-muted">
            {project.coverImageUrl ? (
              <img
                src={project.coverImageUrl}
                alt={project.name}
                className="block h-auto w-full rounded-t-[28px] transition duration-300 group-hover:scale-[1.02]"
                suppressHydrationWarning
              />
            ) : (
              <div className="flex min-h-[280px] w-full items-center justify-center rounded-t-[28px] bg-gradient-to-br from-white via-slate-100 to-zinc-100 text-slate-500 dark:from-white/[0.08] dark:via-white/[0.04] dark:to-black dark:text-slate-400">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Layers3 className="h-8 w-8" />
                  <p className="text-sm font-medium">暂无封面图</p>
                </div>
              </div>
            )}

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <StatusBadge value={project.status} />
              <Badge variant="outline" className="bg-white/90 backdrop-blur dark:bg-black/35">
                {project.sectionCount} 个模块
              </Badge>
            </div>

            <button
              type="button"
              onClick={() => setPendingDelete({ id: project.id, name: project.name })}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-black/45 dark:text-slate-200 dark:hover:bg-black/60"
              aria-label={`删除项目 ${project.name}`}
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-slate-900 dark:text-white">{project.name}</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                平台：{platformLabels[project.platform as keyof typeof platformLabels] ?? project.platform}
                <br />
                风格：{styleLabels[project.style as keyof typeof styleLabels] ?? project.style}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
              最近更新：{formatDate(project.updatedAt)}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href={`/projects/${project.id}/analysis`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                分析
              </Link>
              <Link href={`/projects/${project.id}/planner`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                规划
              </Link>
            </div>

            <Link
              href={`/projects/${project.id}/editor`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full justify-center")}
            >
              进入预览与编辑
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        loading={deleting}
        title={pendingDelete ? `删除项目「${pendingDelete.name}」？` : "删除项目？"}
        description="这会同时删除该项目的关联素材、生成结果与版本记录，操作不可恢复。"
        confirmText="确认删除"
        cancelText="暂不删除"
        destructive
        icon={<Trash2 className="h-5 w-5" />}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
