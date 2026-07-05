import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminOption, ResourceFieldConfig } from "@/lib/saas-admin/types";
import { cn } from "@/lib/utils";

import { renderCellValue } from "./resource-manager-utils";

interface Props {
  field: ResourceFieldConfig;
  mode: "create" | "edit" | "view";
  value: string;
  options?: AdminOption[];
  loadingOptions?: boolean;
  pending?: boolean;
  onChange: (field: string, value: string) => void;
  onUpload: (field: ResourceFieldConfig, file: File) => Promise<void>;
}

const ANY_FIELD = {} as Record<string, unknown>;

function getFieldProp(field: ResourceFieldConfig, key: string): unknown {
  return { ...ANY_FIELD, ...field }[key];
}

function isFileField(field: ResourceFieldConfig): boolean {
  const type = field.type;
  return type === "file" || type === ("image" as ResourceFieldConfig["type"]) || type === ("upload" as ResourceFieldConfig["type"]);
}

function isImageField(field: ResourceFieldConfig): boolean {
  return field.type === ("image" as ResourceFieldConfig["type"]);
}

function inputType(field: ResourceFieldConfig): string {
  if (field.type === "number") return "number";
  if (field.type === "password") return "password";
  if (field.type === ("email" as ResourceFieldConfig["type"])) return "email";
  if (field.type === "datetime") return "datetime-local";
  return "text";
}

export function ResourceFormField({ field, mode, value, options, loadingOptions, pending, onChange, onUpload }: Props) {
  const span = getFieldProp(field, "span") as number | undefined;
  const description = getFieldProp(field, "description") as string | undefined;
  const placeholder = getFieldProp(field, "placeholder") as string | undefined;
  const accept = getFieldProp(field, "accept") as string | undefined;
  const readOnly = (getFieldProp(field, "readOnly") as boolean | undefined) ?? field.readonly;

  return (
    <div className={cn("space-y-2", span === 2 && "md:col-span-2")}>
      <Label htmlFor={field.field}>{field.title}</Label>
      {description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
      {mode === "view" ? (
        <div className="min-h-10 rounded-md border bg-muted/30 px-3 py-2 text-sm">{renderCellValue(value)}</div>
      ) : field.type === "textarea" || field.type === "json" ? (
        <Textarea id={field.field} value={value} onChange={(event) => onChange(field.field, event.target.value)} rows={field.type === "json" ? 8 : 4} placeholder={placeholder} />
      ) : field.type === "select" ? (
        <Select value={value} onValueChange={(nextValue) => onChange(field.field, nextValue)}>
          <SelectTrigger>
            <SelectValue placeholder={loadingOptions ? `加载${field.title}...` : placeholder ?? `请选择${field.title}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? options ?? []).map((option) => (
              <SelectItem key={`${field.field}-${option.value}`} value={String(option.value)}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isFileField(field) ? (
        <div className="space-y-2">
          <Input id={field.field} value={value} onChange={(event) => onChange(field.field, event.target.value)} readOnly={readOnly} placeholder={placeholder ?? "上传后自动回填 URL，也可直接粘贴 URL"} />
          <Input
            type="file"
            accept={accept ?? (isImageField(field) ? "image/*" : undefined)}
            disabled={pending || readOnly}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              await onUpload(field, file);
              event.currentTarget.value = "";
            }}
          />
          {pending ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" />上传中...</p> : null}
        </div>
      ) : (
        <Input id={field.field} type={inputType(field)} value={value} onChange={(event) => onChange(field.field, event.target.value)} readOnly={readOnly} placeholder={placeholder} />
      )}
    </div>
  );
}
