import { notFound } from "next/navigation";

import { ResourceManager } from "@/components/saas/resource-manager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTableConfig, listResource } from "@/lib/saas-admin/api";
import { getResourceByPath } from "@/lib/saas-admin/catalog";
import { requireServerSession } from "@/lib/saas-admin/session";
import type { ResourceFieldConfig, ResourceFormGroupConfig } from "@/lib/saas-admin/types";

function applyFieldOverrides(resource: NonNullable<ReturnType<typeof getResourceByPath>>, tableConfig: Awaited<ReturnType<typeof fetchTableConfig>>) {
  if (!resource.fieldOverrides) return tableConfig;
  const mergeField = (field: ResourceFieldConfig): ResourceFieldConfig => ({
    ...field,
    ...(resource.fieldOverrides?.[field.field] ?? {}),
  });
  return {
    ...tableConfig,
    search: tableConfig.search
      ? {
          ...tableConfig.search,
          fields: tableConfig.search.fields?.map(mergeField),
        }
      : tableConfig.search,
    form: tableConfig.form
      ? {
          ...tableConfig.form,
          groups: tableConfig.form.groups?.map((group: ResourceFormGroupConfig) => ({
            ...group,
            fields: group.fields.map(mergeField),
          })),
        }
      : tableConfig.form,
  };
}

interface Props {
  params: Promise<{ slug: string[] }>;
}
export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const resourcePath = slug.join("/");
  const resource = getResourceByPath(resourcePath);
  if (!resource) notFound();

  const session = await requireServerSession();
  const loaded = await Promise.all([
    fetchTableConfig(resource.path, session),
    listResource(resource.path, session),
  ])
    .then(([tableConfig, listPayload]) => ({
      ok: true as const,
      tableConfig: applyFieldOverrides(resource, tableConfig),
      listPayload,
    }))
    .catch((error: unknown) => ({ ok: false as const, error }));

  if (!loaded.ok) {
    return (
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{resource.title}</CardTitle>
          <CardDescription>{resource.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {loaded.error instanceof Error ? loaded.error.message : "资源加载失败"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const clientResource = {
    model: resource.model,
    title: resource.title,
    description: resource.description,
    moduleCode: resource.moduleCode,
    path: resource.path,
    createPath: resource.createPath,
    readOnly: resource.readOnly,
    defaultValues: resource.defaultValues,
    createExtraFields: resource.createExtraFields,
    actionLinks: resource.actionLinks,
  };

  return (
    <ResourceManager
      session={session}
      resource={clientResource}
      tableConfig={loaded.tableConfig}
      initialRows={loaded.listPayload.data.data ?? []}
      initialCount={Number(loaded.listPayload.data.count ?? 0)}
    />
  );
}
