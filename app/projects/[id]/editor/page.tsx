import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectOutputConfigCard } from "@/components/shared/project-output-config-card";
import { Button } from "@/components/ui/button";
import { getProjectDetail } from "@/lib/services/project-service";

export default async function ProjectEditorPage({ params }: { params: { id: string } }) {
  const project = await getProjectDetail(params.id);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="预览与编辑"
        title={`${project.name} 的商品页工作台`}
        description="左侧选择模块，中间查看手机商品页预览，右侧逐段编辑标题、文案和双语视觉 Prompt，并支持单独生成、重绘与版本切换。"
        actions={
          <>
            <Link href={`/projects/${project.id}/export`}>
              <Button variant="outline">进入导出中心</Button>
            </Link>
            <a href={`/api/projects/${project.id}/export/images`}>
              <Button>一键导出详情页图像</Button>
            </a>
          </>
        }
      />
      <ProjectOutputConfigCard project={project} />
      <EditorWorkspace project={project} />
    </div>
  );
}
