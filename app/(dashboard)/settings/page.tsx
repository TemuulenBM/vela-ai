"use client";

import { Key, Plus, Trash2, UserPlus } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Button,
  Badge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FadeIn,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

const apiKeys = [
  {
    id: 1,
    name: "Үйлдвэрлэлийн түлхүүр",
    key: "sk_live_4f8a...x9k2",
    created: "2024-01-15",
    lastUsed: "2024-03-23",
  },
  {
    id: 2,
    name: "Тест түлхүүр",
    key: "sk_test_7b3d...m4p1",
    created: "2024-02-20",
    lastUsed: "2024-03-22",
  },
  {
    id: 3,
    name: "Webhook түлхүүр",
    key: "sk_live_9e1c...h6j8",
    created: "2024-03-01",
    lastUsed: "2024-03-21",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Ганбаатар Эрдэнэ",
    email: "ganbaatar@velashop.mn",
    role: "owner" as const,
  },
  {
    id: 2,
    name: "Анхбаяр Мөнхбат",
    email: "ankhbayar@velashop.mn",
    role: "admin" as const,
  },
  {
    id: 3,
    name: "Солонго Батболд",
    email: "solongo@velashop.mn",
    role: "member" as const,
  },
  {
    id: 4,
    name: "Тэмүүлэн Ганзориг",
    email: "temuulen@velashop.mn",
    role: "member" as const,
  },
];

const roleLabels: Record<string, string> = {
  owner: "Эзэмшигч",
  admin: "Админ",
  member: "Гишүүн",
};

const roleBadgeVariant: Record<string, "brand" | "info" | "default"> = {
  owner: "brand",
  admin: "info",
  member: "default",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader title="Тохиргоо" description="Дэлгүүрийн тохиргоог удирдах" />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Ерөнхий</TabsTrigger>
            <TabsTrigger value="api-keys">API түлхүүр</TabsTrigger>
            <TabsTrigger value="team">Баг</TabsTrigger>
            <TabsTrigger value="billing">Төлбөр</TabsTrigger>
          </TabsList>

          {/* General tab */}
          <TabsContent value="general">
            <Card padding="md">
              <CardHeader>
                <CardTitle>Дэлгүүрийн мэдээлэл</CardTitle>
                <CardDescription>Дэлгүүрийн ерөнхий мэдээллийг засварлах</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 max-w-lg">
                  <Input
                    label="Дэлгүүрийн нэр"
                    defaultValue="Vela Shop"
                    placeholder="Дэлгүүрийн нэрийг оруулна уу"
                  />
                  <Input label="Slug" defaultValue="vela-shop" placeholder="vela-shop" />
                  <Textarea
                    label="Тайлбар"
                    defaultValue="Монголын шилдэг цахим худалдааны платформ. Cashmere, электроник, хувцас, гэр ахуйн бараа."
                    placeholder="Дэлгүүрийн тайлбарыг оруулна уу"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Хадгалах</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* API Keys tab */}
          <TabsContent value="api-keys">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 pt-5 pb-0">
                <div className="flex flex-col gap-1.5">
                  <CardTitle>API түлхүүрүүд</CardTitle>
                  <CardDescription>
                    API түлхүүрүүдийг удирдах. Түлхүүрүүдийг нууцаар хадгална уу.
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Шинэ түлхүүр үүсгэх
                </Button>
              </div>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-default">
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Нэр
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Түлхүүр
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Үүсгэсэн
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Сүүлд ашигласан
                        </th>
                        <th className="w-20 px-5 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {apiKeys.map((apiKey) => (
                        <tr key={apiKey.id}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-text-tertiary" />
                              <span className="text-sm font-medium text-text-primary">
                                {apiKey.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <code className="rounded-[var(--radius-sm)] bg-surface-tertiary px-2 py-1 text-xs font-mono text-text-secondary">
                              {apiKey.key}
                            </code>
                          </td>
                          <td className="px-5 py-3 text-sm text-text-secondary">
                            {apiKey.created}
                          </td>
                          <td className="px-5 py-3 text-sm text-text-secondary">
                            {apiKey.lastUsed}
                          </td>
                          <td className="px-5 py-3">
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3.5 w-3.5" />
                              Устгах
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team tab */}
          <TabsContent value="team">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 pt-5 pb-0">
                <div className="flex flex-col gap-1.5">
                  <CardTitle>Багийн гишүүд</CardTitle>
                  <CardDescription>Дэлгүүрийн удирдлагын багийг удирдах</CardDescription>
                </div>
                <Button size="sm">
                  <UserPlus className="h-4 w-4" />
                  Гишүүн урих
                </Button>
              </div>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-default">
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Гишүүн
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Имэйл
                        </th>
                        <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Үүрэг
                        </th>
                        <th className="w-20 px-5 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="sm"
                                fallback={member.name.charAt(0)}
                                alt={member.name}
                              />
                              <span className="text-sm font-medium text-text-primary">
                                {member.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-text-secondary">{member.email}</td>
                          <td className="px-5 py-3">
                            <Badge variant={roleBadgeVariant[member.role]} size="md">
                              {roleLabels[member.role]}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            {member.role !== "owner" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                              >
                                Хасах
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing tab */}
          <TabsContent value="billing">
            <div className="flex flex-col gap-6">
              <Card padding="md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <CardTitle>Одоогийн багц</CardTitle>
                      <CardDescription>Таны идэвхтэй захиалгын багц</CardDescription>
                    </div>
                    <Badge variant="brand" size="lg">
                      Pro
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-primary font-semibold">Pro багц</span>
                      <span className="text-sm text-text-primary font-semibold">99,000₮/сар</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      <li className="text-sm text-text-secondary">1,000 яриа / сар</li>
                      <li className="text-sm text-text-secondary">500 бараа хүртэл</li>
                      <li className="text-sm text-text-secondary">Аналитик дашбоард</li>
                      <li className="text-sm text-text-secondary">Имэйл дэмжлэг</li>
                      <li className="text-sm text-text-secondary">5 багийн гишүүн</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary">Шинэчлэх</Button>
                </CardFooter>
              </Card>

              <Card padding="md">
                <CardHeader>
                  <CardTitle>Ашиглалтын мэдээлэл</CardTitle>
                  <CardDescription>Энэ сарын ашиглалтын статистик</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">Яриа ашигласан</span>
                        <span className="text-sm text-text-secondary">847 / 1,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-tertiary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: "84.7%" }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">Бараа</span>
                        <span className="text-sm text-text-secondary">156 / 500</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-tertiary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: "31.2%" }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">Багийн гишүүн</span>
                        <span className="text-sm text-text-secondary">4 / 5</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-tertiary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: "80%" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
