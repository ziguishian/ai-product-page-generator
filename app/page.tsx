import { QuickStartWorkspace } from "@/components/projects/quick-start-workspace";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <QuickStartWorkspace />
    </div>
  );
}
