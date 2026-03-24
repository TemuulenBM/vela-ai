"use client";

import {
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FadeIn,
} from "@/shared/components/ui";
import { GeneralTab } from "./_components/general-tab";
import { ApiKeysTab } from "./_components/api-keys-tab";
import { TeamTab } from "./_components/team-tab";
import { BillingTab } from "./_components/billing-tab";

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

          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysTab />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
