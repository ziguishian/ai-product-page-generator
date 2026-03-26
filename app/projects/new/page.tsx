import { ProjectCreator } from "@/components/projects/project-creator";
import { PageHeader } from "@/components/shared/page-header";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="高级创建"
        title="高级创建项目"
        description="如果你希望在创建前一次性填写平台、风格并批量上传全部素材，可以使用这个高级入口。默认推荐还是从首页先上传头图开始。"
      />
      <ProjectCreator />
    </div>
  );
}
