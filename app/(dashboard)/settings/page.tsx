"use client";

import { useState } from "react";
import { FadeIn, PageHeader } from "@/shared/components/ui";
import { GeneralTab } from "./_components/general-tab";
import { ApiKeysTab } from "./_components/api-keys-tab";
import { TeamTab } from "./_components/team-tab";
import { BillingTab } from "./_components/billing-tab";
import { ImportTab } from "./_components/import-tab";

type TabKey = "general" | "api-keys" | "team" | "billing" | "import";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "general", label: "ЕРӨНХИЙ", icon: "tune" },
  { key: "api-keys", label: "API ТҮЛХҮҮР", icon: "key" },
  { key: "team", label: "БАГ", icon: "group" },
  { key: "billing", label: "ТӨЛБӨР", icon: "account_balance_wallet" },
  { key: "import", label: "ИМПОРТ", icon: "cloud_download" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("billing");

  return (
    <div className="px-8 py-10 max-w-[1600px] mx-auto flex flex-col gap-10">
      {/* Header */}
      <FadeIn>
        <PageHeader
          title="Тохиргоо"
          description="Дэлгүүрийн тохиргоо, API холболт, төлбөрийн удирдлага"
        />
      </FadeIn>

      {/* Layout: left tabs + right content */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-12 gap-8">
          {/* Left vertical tabs */}
          <div className="col-span-3">
            <nav className="flex flex-col gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center justify-between rounded-3xl px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black shadow-lg shadow-white/10"
                        : "glass-card text-white/60 hover:text-white/80"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? "text-black/70" : "text-white/40"
                      }`}
                    >
                      {isActive && tab.key !== "general"
                        ? tab.icon
                        : tab.key === "general"
                          ? "chevron_right"
                          : tab.icon}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right content */}
          <div className="col-span-9">
            {activeTab === "general" && <GeneralTab />}
            {activeTab === "api-keys" && <ApiKeysTab />}
            {activeTab === "team" && <TeamTab />}
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "import" && <ImportTab />}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
