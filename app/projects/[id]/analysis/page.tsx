import { notFound } from "next/navigation";

import { AnalysisWorkspace } from "@/components/analysis/analysis-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectOutputConfigCard } from "@/components/shared/project-output-config-card";
import { getProjectDetail } from "@/lib/services/project-service";

export default async function ProjectAnalysisPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: {
    autoRun?: string;
    source?: string;
    analysisErrorCode?: string;
    analysisErrorMessage?: string;
  };
}) {
  const project = await getProjectDetail(params.id);
  if (!project) notFound();
  const analysisErrorCode = searchParams?.analysisErrorCode
    ? decodeURIComponent(searchParams.analysisErrorCode)
    : undefined;
  const shouldAutoRun =
    searchParams?.autoRun === "1" &&
    (!analysisErrorCode || ["PROVIDER_TIMEOUT", "INTERNAL_ERROR", "UNKNOWN_ERROR"].includes(analysisErrorCode));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="分析与配置"
        title={`${project.name} 的项目信息与商品分析`}
        description="这里承接头图上传后的下一步：先完善项目信息，再确认结构化分析结果，最后继续进入页面规划。"
      />
      <ProjectOutputConfigCard project={project} editable />
      <AnalysisWorkspace
        project={project}
        autoRunOnLoad={shouldAutoRun}
        source={searchParams?.source}
        initialErrorCode={analysisErrorCode}
        initialNotice={
          searchParams?.analysisErrorMessage ? decodeURIComponent(searchParams.analysisErrorMessage) : undefined
        }
      />
    </div>
  );
}
