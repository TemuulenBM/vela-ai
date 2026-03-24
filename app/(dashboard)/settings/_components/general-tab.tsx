"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Button,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";

export function GeneralTab() {
  const storeQuery = trpc.tenants.getStore.useQuery();
  const utils = trpc.useUtils();
  const updateMutation = trpc.tenants.updateStore.useMutation({
    onSuccess: () => utils.tenants.getStore.invalidate(),
  });

  const store = storeQuery.data;
  const settings = (store?.settings as Record<string, unknown> | null) ?? {};

  const [name, setName] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const displayName = name ?? store?.name ?? "";
  const displaySlug = slug ?? store?.slug ?? "";
  const displayDesc = description ?? (settings.description as string) ?? "";

  const handleSave = () => {
    updateMutation.mutate({
      name: displayName || undefined,
      slug: displaySlug || undefined,
      description: displayDesc || undefined,
    });
  };

  if (storeQuery.isLoading) {
    return (
      <Card padding="md">
        <div className="h-48 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary" />
      </Card>
    );
  }

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Дэлгүүрийн мэдээлэл</CardTitle>
        <CardDescription>Дэлгүүрийн ерөнхий мэдээллийг засварлах</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex max-w-lg flex-col gap-4">
          <Input
            label="Дэлгүүрийн нэр"
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            placeholder="Дэлгүүрийн нэрийг оруулна уу"
          />
          <Input
            label="Slug"
            value={displaySlug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="vela-shop"
          />
          <Textarea
            label="Тайлбар"
            value={displayDesc}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Дэлгүүрийн тайлбарыг оруулна уу"
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Хадгалж байна..." : "Хадгалах"}
        </Button>
      </CardFooter>
    </Card>
  );
}
