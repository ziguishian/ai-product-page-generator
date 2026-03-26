"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { NoticeCard } from "@/components/shared/notice-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assetTypeLabels, platformLabels, platformOptions, styleLabels, styleOptions } from "@/types/domain";

interface AnalysisWorkspaceProps {
  project: any;
  autoRunOnLoad?: boolean;
  initialNotice?: string;
  initialErrorCode?: string;
  source?: string;
}

function arrayToText(value?: string[]) {
  return (value ?? []).join("\n");
}

function textToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AnalysisWorkspace({
  project,
  autoRunOnLoad = false,
  initialNotice,
  initialErrorCode,
  source,
}: AnalysisWorkspaceProps) {
  const [projectState, setProjectState] = useState(project);
  const [analysis, setAnalysis] = useState(project.analysis?.normalizedResult ?? null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const autoStartedRef = useRef(false);
  const analysisInFlightRef = useRef(false);

  const refreshProject = async () => {
    const response = await fetch(`/api/projects/${project.id}`);
    const payload = await response.json();
    if (payload.success) {
      setProjectState(payload.data);
      setAnalysis(payload.data.analysis?.normalizedResult ?? null);
    }
  };

  const updateField = (key: string, value: unknown) => {
    setAnalysis((current: Record<string, unknown>) => ({
      ...(current ?? {}),
      [key]: value,
    }));
  };

  const updateProjectField = (key: string, value: unknown) => {
    setProjectState((current: any) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveProjectMeta = async () => {
    setSavingProject(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectState.name,
          platform: projectState.platform,
          style: projectState.style,
          description: projectState.description ?? "",
        }),
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? "项目信息保存失败");
      }
      toast.success("项目信息已保存");
      await refreshProject();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "项目信息保存失败");
    } finally {
      setSavingProject(false);
    }
  };

  const runAnalysis = async (options?: { silentSuccess?: boolean }) => {
    if (analysisInFlightRef.current) {
      return;
    }
    analysisInFlightRef.current = true;
    setRunning(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? "商品分析失败");
      }
      setAnalysis(payload.data.normalizedResult);
      await refreshProject();
      if (!options?.silentSuccess) {
        toast.success("AI 商品分析完成");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "商品分析失败");
    } finally {
      analysisInFlightRef.current = false;
      setRunning(false);
    }
  };

  useEffect(() => {
    if (initialNotice) {
      toast.warning(initialNotice);
    }
  }, [initialNotice]);

  useEffect(() => {
    if (!autoRunOnLoad || autoStartedRef.current || analysis || running) {
      return;
    }

    autoStartedRef.current = true;
    toast.message(
      source === "quick-start"
        ? initialErrorCode === "PROVIDER_TIMEOUT"
          ? "上一次分析超时，正在自动重试…"
          : "已进入分析页，正在继续自动分析…"
        : "正在自动分析…",
    );
    void runAnalysis({ silentSuccess: true });
  }, [analysis, autoRunOnLoad, initialErrorCode, running, source]);

  const reorderAsset = async (assetId: string, direction: -1 | 1) => {
    const currentIndex = projectState.assets.findIndex((asset: any) => asset.id === assetId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= projectState.assets.length) {
      return;
    }

    const reordered = [...projectState.assets];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    setProjectState((current: any) => ({ ...current, assets: reordered }));

    await Promise.all(
      reordered.map((asset: any, index: number) =>
        fetch(`/api/assets/${asset.id}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: index }),
        }),
      ),
    );
    await refreshProject();
  };

  const deleteAsset = async (assetId: string) => {
    const response = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
    const payload = await response.json();
    if (!payload.success) {
      toast.error(payload.error?.message ?? "素材删除失败");
      return;
    }
    toast.success("素材已删除");
    await refreshProject();
  };

  const setMainAsset = async (assetId: string) => {
    const response = await fetch(`/api/assets/${assetId}/set-main`, { method: "PATCH" });
    const payload = await response.json();
    if (!payload.success) {
      toast.error(payload.error?.message ?? "主图设置失败");
      return;
    }
    toast.success("主图已更新");
    await refreshProject();
  };

  const saveAnalysis = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/analysis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          normalizedResult: analysis,
        }),
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? "分析结果保存失败");
      }
      toast.success("分析结果已保存");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "分析结果保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>第 2 步：完善项目信息</CardTitle>
          <CardDescription>头图上传后，先把项目名称、平台、风格和备注补齐，后面的规划和生成都会使用这些信息。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>项目名称</Label>
              <Input value={projectState.name ?? ""} onChange={(event) => updateProjectField("name", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>平台</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
                value={projectState.platform}
                onChange={(event) => updateProjectField("platform", event.target.value)}
              >
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {platformLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>风格</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
                value={projectState.style}
                onChange={(event) => updateProjectField("style", event.target.value)}
              >
                {styleOptions.map((option) => (
                  <option key={option} value={option}>
                    {styleLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>备注</Label>
              <Textarea
                value={projectState.description ?? ""}
                onChange={(event) => updateProjectField("description", event.target.value)}
              />
            </div>
          </div>

          <Button onClick={saveProjectMeta} disabled={savingProject}>
            {savingProject ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            保存项目信息
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>第 3 步：素材与自动分析</CardTitle>
            <CardDescription>主图已经作为起点上传。这里可以继续调整主图、排序和补充素材，然后重新运行 AI 分析。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {projectState.assets.map((asset: any, index: number) => (
                <div key={asset.id} className="overflow-hidden rounded-2xl border border-border bg-muted/60">
                  <div className="aspect-square bg-slate-100">
                    {asset.url ? <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{assetTypeLabels[asset.type as keyof typeof assetTypeLabels] ?? asset.type}</Badge>
                      {asset.isMain ? <Badge variant="success">主图</Badge> : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{asset.fileName}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" onClick={() => reorderAsset(asset.id, -1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reorderAsset(asset.id, 1)}
                        disabled={index === projectState.assets.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      {!asset.isMain ? (
                        <Button variant="ghost" size="sm" onClick={() => setMainAsset(asset.id)}>
                          <Star className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="sm" onClick={() => deleteAsset(asset.id)}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => void runAnalysis()} disabled={running} className="w-full">
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              重新运行 AI 商品分析
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析结果确认</CardTitle>
            <CardDescription>这里是结构化商品分析结果。确认后就可以继续进入页面规划。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!analysis ? (
              <>
              <NoticeCard
                variant="info"
                title="当前还没有分析结果"
                description="你可以点击左侧按钮重新发起 AI 商品分析。分析完成后，这里会显示结构化字段，并可以继续进入页面规划。"
              />
              <div className="hidden">
                当前还没有分析结果，你可以点击左侧按钮重新发起 AI 商品分析。
              </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["productName", "商品名称"],
                    ["category", "品类"],
                    ["subcategory", "子类目"],
                    ["material", "材质"],
                    ["color", "颜色"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input value={(analysis as any)[key] ?? ""} onChange={(event) => updateField(key, event.target.value)} />
                    </div>
                  ))}
                </div>

                {[
                  ["styleTags", "风格标签"],
                  ["targetAudience", "目标人群"],
                  ["usageScenarios", "使用场景"],
                  ["coreSellingPoints", "核心卖点"],
                  ["differentiationPoints", "差异化亮点"],
                  ["userConcerns", "用户顾虑"],
                  ["recommendedFocusPoints", "推荐重点"],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Textarea
                      value={arrayToText((analysis as any)[key])}
                      onChange={(event) => updateField(key, textToArray(event.target.value))}
                    />
                  </div>
                ))}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={saveAnalysis} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    保存分析结果
                  </Button>
                  <Link
                    href={`/projects/${project.id}/planner`}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-muted hover:text-slate-900 dark:border-white/10 dark:bg-[#141416] dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/8 dark:hover:text-white"
                  >
                    进入页面规划
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
