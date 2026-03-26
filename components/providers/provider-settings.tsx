"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronsUpDown,
  CopyPlus,
  History,
  Loader2,
  PlugZap,
  Save,
  Search,
} from "lucide-react";
import { z } from "zod";

import { providerSaveSchema } from "@/lib/validations/provider";
import { capabilityLabels } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProviderFormValues = z.input<typeof providerSaveSchema>;

type ProviderModelRecord = {
  modelId: string;
  label: string;
  capabilities: Record<string, unknown>;
  roles: Record<string, unknown>;
  quality?: string | null;
  latency?: string | null;
  cost?: string | null;
  isAvailable: boolean;
  endpointSupport?: {
    imageGeneration: string;
    imageEdit: string;
    note?: string | null;
  };
  isDefaultAnalysis: boolean;
  isDefaultPlanning: boolean;
  isDefaultHeroImage: boolean;
  isDefaultDetailImage: boolean;
  isDefaultImageEdit: boolean;
};

type ProviderRecord = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  maskedApiKey: string;
  isActive: boolean;
  updatedAt: string | Date;
  models: ProviderModelRecord[];
};

interface ProviderSettingsProps {
  initialProviders: ProviderRecord[];
}

type DefaultAssignments = {
  analysisModelId: string;
  planningModelId: string;
  heroImageModelId: string;
  detailImageModelId: string;
  imageEditModelId: string;
};

type GenericModelRecord = Record<string, any>;

const roleFieldLabels: Array<[keyof DefaultAssignments, string]> = [
  ["analysisModelId", "商品分析模型"],
  ["planningModelId", "页面规划模型"],
  ["heroImageModelId", "头图生成模型"],
  ["detailImageModelId", "详情图生成模型"],
  ["imageEditModelId", "图像编辑模型"],
];

function buildDefaults(provider: ProviderRecord | null): DefaultAssignments {
  return {
    analysisModelId: provider?.models.find((item) => item.isDefaultAnalysis)?.modelId ?? "",
    planningModelId: provider?.models.find((item) => item.isDefaultPlanning)?.modelId ?? "",
    heroImageModelId: provider?.models.find((item) => item.isDefaultHeroImage)?.modelId ?? "",
    detailImageModelId: provider?.models.find((item) => item.isDefaultDetailImage)?.modelId ?? "",
    imageEditModelId: provider?.models.find((item) => item.isDefaultImageEdit)?.modelId ?? "",
  };
}

function getEndpointBadge(status: string) {
  if (status === "available") {
    return { text: "真实端点可用", variant: "success" as const };
  }
  if (status === "rate_limited") {
    return { text: "接口限流中", variant: "warning" as const };
  }
  if (status === "unavailable") {
    return { text: "真实端点不可用", variant: "destructive" as const };
  }
  if (status === "not_applicable") {
    return { text: "不适用", variant: "outline" as const };
  }
  return { text: "待确认", variant: "outline" as const };
}

function canUseForRole(model: GenericModelRecord, roleKey: keyof DefaultAssignments) {
  if (roleKey === "analysisModelId" || roleKey === "planningModelId") {
    return Boolean(model.capabilities?.text);
  }

  if (roleKey === "heroImageModelId" || roleKey === "detailImageModelId") {
    return Boolean(model.capabilities?.image_gen) && model.capabilities?.real_image_gen !== false;
  }

  if (roleKey === "imageEditModelId") {
    return (
      (Boolean(model.capabilities?.image_edit) && model.capabilities?.real_image_edit !== false) ||
      (Boolean(model.capabilities?.image_gen) && model.capabilities?.real_image_gen !== false)
    );
  }

  return true;
}

function formatTimeLabel(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ProviderSettings({ initialProviders }: ProviderSettingsProps) {
  const [providers, setProviders] = useState(initialProviders);
  const activeProvider = useMemo(
    () => providers.find((item) => item.isActive) ?? providers[0] ?? null,
    [providers],
  );
  const [selectedProviderId, setSelectedProviderId] = useState(activeProvider?.id ?? "");
  const [loading, setLoading] = useState<null | "test" | "discover" | "save" | "saveAsNew">(null);
  const [switchingProviderId, setSwitchingProviderId] = useState<string | null>(null);
  const selectedProvider = useMemo(
    () => providers.find((item) => item.id === selectedProviderId) ?? activeProvider,
    [providers, selectedProviderId, activeProvider],
  );
  const [models, setModels] = useState<Array<GenericModelRecord>>(selectedProvider?.models ?? []);
  const [defaults, setDefaults] = useState<DefaultAssignments>(buildDefaults(selectedProvider ?? null));

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSaveSchema),
    defaultValues: {
      id: selectedProvider?.id ?? undefined,
      name: selectedProvider?.name ?? "默认模型服务",
      baseUrl: selectedProvider?.baseUrl ?? "",
      apiKey: selectedProvider?.apiKey ?? "",
      isActive: true,
      defaultAssignments: undefined,
    },
  });

  useEffect(() => {
    const nextProvider = selectedProvider ?? null;
    setModels(nextProvider?.models ?? []);
    setDefaults(buildDefaults(nextProvider));
    form.reset({
      id: nextProvider?.id ?? undefined,
      name: nextProvider?.name ?? "默认模型服务",
      baseUrl: nextProvider?.baseUrl ?? "",
      apiKey: nextProvider?.apiKey ?? "",
      isActive: true,
      defaultAssignments: undefined,
    });
  }, [selectedProvider, form]);

  const availableImageModels = useMemo(
    () => models.filter((model) => model.capabilities?.image_gen && model.capabilities?.real_image_gen !== false),
    [models],
  );

  function hydrateFromSavedProviders(nextProviders: ProviderRecord[], nextSelectedId?: string | null) {
    setProviders(nextProviders);
    const fallbackId = nextSelectedId ?? nextProviders.find((item) => item.isActive)?.id ?? nextProviders[0]?.id ?? "";
    setSelectedProviderId(fallbackId);
  }

  async function handleActivateProvider(providerId: string) {
    setSwitchingProviderId(providerId);
    try {
      const response = await fetch("/api/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? "切换历史服务失败");
      }

      hydrateFromSavedProviders(payload.data ?? [], providerId);
      toast.success("已切换为当前服务");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "切换历史服务失败");
    } finally {
      setSwitchingProviderId(null);
    }
  }

  const handleTest = form.handleSubmit(async (values) => {
    setLoading("test");
    try {
      const response = await fetch("/api/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? "连接测试失败");
      }
      toast.success("模型服务连接成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "连接测试失败");
    } finally {
      setLoading(null);
    }
  });

  const handleDiscover = form.handleSubmit(async (values) => {
    setLoading("discover");
    try {
      const response = await fetch("/api/providers/discover-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error?.message ?? "模型发现失败");
      }
      setModels(payload.data.models);
      setDefaults(payload.data.recommendations);
      toast.success(`已发现 ${payload.data.models.length} 个模型，并完成能力探测`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "模型发现失败");
    } finally {
      setLoading(null);
    }
  });

  async function saveProvider(overwriteExisting: boolean) {
    return form.handleSubmit(async (values) => {
      setLoading(overwriteExisting ? "save" : "saveAsNew");
      try {
        const response = await fetch("/api/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            id: overwriteExisting ? values.id : undefined,
            defaultAssignments: defaults,
          }),
        });
        const payload = await response.json();
        if (!payload.success) {
          throw new Error(payload.error?.message ?? "配置保存失败");
        }

        const nextProviders = payload.data?.providers ?? [];
        const savedProviderId = payload.data?.savedProviderId ?? values.id ?? "";
        hydrateFromSavedProviders(nextProviders, savedProviderId);
        toast.success(overwriteExisting ? "服务配置已保存" : "已另存为新的服务配置");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "配置保存失败");
      } finally {
        setLoading(null);
      }
    })();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>模型服务连接</CardTitle>
          <CardDescription>
            在这里可以直接读取已保存服务、测试连接、重新发现模型，并把当前配置覆盖保存或另存为新服务。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3 rounded-3xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">快捷读取已保存服务</h3>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="provider-history">历史服务</Label>
                <div className="relative">
                  <select
                    id="provider-history"
                    className="flex h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 pr-10 text-sm text-foreground dark:bg-black/30"
                    value={selectedProviderId}
                    onChange={(event) => setSelectedProviderId(event.target.value)}
                  >
                    {providers.length === 0 ? <option value="">暂无已保存服务</option> : null}
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} · {provider.baseUrl}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => selectedProviderId && setSelectedProviderId(selectedProviderId)}
                  disabled={!selectedProviderId}
                >
                  读取到表单
                </Button>
                <Button
                  type="button"
                  variant={selectedProvider?.isActive ? "secondary" : "default"}
                  onClick={() => selectedProviderId && handleActivateProvider(selectedProviderId)}
                  disabled={!selectedProviderId || selectedProvider?.isActive || switchingProviderId !== null}
                >
                  {switchingProviderId === selectedProviderId ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {selectedProvider?.isActive ? "当前使用中" : "切换为当前服务"}
                </Button>
              </div>
            </div>
            {selectedProvider ? (
              <div className="rounded-2xl border border-border bg-background p-4 dark:bg-black/20">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{selectedProvider.name}</p>
                  {selectedProvider.isActive ? <Badge variant="success">当前服务</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{selectedProvider.baseUrl}</p>
                <p className="mt-1 text-xs text-muted-foreground">Key：{selectedProvider.maskedApiKey || "未显示"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  最近更新：{formatTimeLabel(selectedProvider.updatedAt)}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                还没有保存过服务配置。首次保存后，这里就可以直接读取并快捷切换。
              </div>
            )}
          </div>

          <form autoComplete="off" className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="provider-name">服务名称</Label>
              <Input
                id="provider-name"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                placeholder="例如：OpenRouter / Gemini Gateway / 自建兼容网关"
                {...form.register("name")}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="provider-base-url">baseURL</Label>
              <Input
                id="provider-base-url"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                placeholder="https://your-provider.example/v1"
                {...form.register("baseUrl")}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="provider-api-key">API Key</Label>
              <Input
                id="provider-api-key"
                type="password"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                placeholder="可留空；系统会自动复用当前服务已保存的 API Key"
                {...form.register("apiKey")}
              />
              <p className="text-xs text-muted-foreground">
                选择历史服务后，名字、URL 和 Key 会直接回填到表单；修改后可以覆盖保存，也可以另存为新的服务配置。
              </p>
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={handleTest} disabled={loading !== null}>
              {loading === "test" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlugZap className="mr-2 h-4 w-4" />}
              测试连接
            </Button>
            <Button type="button" variant="secondary" onClick={handleDiscover} disabled={loading !== null}>
              {loading === "discover" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              发现模型并探测
            </Button>
            <Button type="button" onClick={() => saveProvider(true)} disabled={loading !== null || models.length === 0}>
              {loading === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {selectedProvider ? "覆盖保存当前服务" : "保存当前配置"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => saveProvider(false)}
              disabled={loading !== null || models.length === 0}
            >
              {loading === "saveAsNew" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CopyPlus className="mr-2 h-4 w-4" />
              )}
              另存为新服务
            </Button>
          </div>

          {models.length > 0 ? (
            <div className="space-y-4 rounded-3xl bg-muted/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">默认模型角色分配</h3>
                <Badge>{models.length} 个模型</Badge>
              </div>

              {availableImageModels.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                  当前 Provider 尚未探测到可用于真实出图的模型，头图和详情图角色会被禁用。
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {roleFieldLabels.map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground dark:bg-black/30"
                      value={defaults[key] ?? ""}
                      onChange={(event) => setDefaults((current) => ({ ...current, [key]: event.target.value }))}
                    >
                      <option value="">未选择</option>
                      {models.map((model) => {
                        const disabled = !canUseForRole(model, key);
                        const unavailableSuffix =
                          key === "heroImageModelId" || key === "detailImageModelId" || key === "imageEditModelId"
                            ? disabled
                              ? "（不适合作为真实图片默认模型）"
                              : ""
                            : "";

                        return (
                          <option key={model.modelId} value={model.modelId} disabled={disabled}>
                            {model.label}
                            {unavailableSuffix}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>模型能力归一化结果</CardTitle>
          <CardDescription>能力标签来自模型列表、命名启发式，以及真实图片端点探测结果。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {models.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              先测试并发现模型，系统会在这里展示能力标签、真实图片端点可用性和默认推荐结果。
            </div>
          ) : (
            models.map((model) => {
              const imageGenBadge = getEndpointBadge(model.endpointSupport?.imageGeneration ?? "unknown");
              const imageEditBadge = getEndpointBadge(model.endpointSupport?.imageEdit ?? "unknown");

              return (
                <div key={model.modelId} className="rounded-3xl border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{model.label}</p>
                      <p className="text-xs text-muted-foreground">{model.modelId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(model.capabilities ?? {})
                        .filter(([capability, enabled]) => Boolean(enabled) && capabilityLabels[capability as keyof typeof capabilityLabels])
                        .map(([capability]) => (
                          <Badge key={capability} variant="outline">
                            {capabilityLabels[capability as keyof typeof capabilityLabels] ?? capability}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {model.capabilities?.image_gen ? (
                      <Badge variant={imageGenBadge.variant}>{`出图端点：${imageGenBadge.text}`}</Badge>
                    ) : null}
                    {model.capabilities?.image_edit ? (
                      <Badge variant={imageEditBadge.variant}>{`编辑端点：${imageEditBadge.text}`}</Badge>
                    ) : null}
                    {model.capabilities?.image_gen && model.capabilities?.real_image_gen === false ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                        不建议设为头图 / 详情图默认模型
                      </Badge>
                    ) : null}
                    {model.capabilities?.image_gen && model.capabilities?.real_image_gen !== false ? (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        可用于真实图片生成
                      </Badge>
                    ) : null}
                  </div>

                  {model.endpointSupport?.note ? (
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">
                      {model.endpointSupport.note}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
