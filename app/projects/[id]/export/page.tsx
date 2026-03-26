import { notFound } from "next/navigation";

import { ExportPanel } from "@/components/export/export-panel";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectOutputConfigCard } from "@/components/shared/project-output-config-card";
import { getProjectDetail } from "@/lib/services/project-service";

export default async function ProjectExportPage({ params }: { params: { id: string } }) {
  const project = await getProjectDetail(params.id);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="导出中心"
        title={`${project.name} · 详情页导出`}
        description="一键导出当前商品页中的头图和详情页全部图像，也支持导出项目 JSON 并查看当前输出配置。"
      />
      <ProjectOutputConfigCard project={project} />
      <ExportPanel project={project} />
    </div>
  );
}
