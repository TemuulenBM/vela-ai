"use client";

import { useState } from "react";
import { Search, Globe, Smartphone, Sparkles } from "lucide-react";
import { Input, Avatar, Badge, AnimateList, FadeIn } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  status: "active" | "closed";
  channel: "web" | "mobile";
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Болд",
    lastMessage: "Баярлалаа, захиалга өгье!",
    time: "5 мин",
    status: "active",
    channel: "web",
    messages: [
      {
        id: 1,
        role: "user",
        text: "Сайн байна уу! Cashmere цамцны талаар мэдээлэл авч болох уу?",
        time: "14:23",
      },
      {
        id: 2,
        role: "assistant",
        text: "Сайн байна уу! Мэдээж болно. Gobi Cashmere-ийн цамц манайд хэд хэдэн загвартай байна. Та эрэгтэй эсвэл эмэгтэй цамц сонирхож байна уу?",
        time: "14:23",
      },
      { id: 3, role: "user", text: "Эрэгтэй, L хэмжээтэй байна уу?", time: "14:24" },
      {
        id: 4,
        role: "assistant",
        text: "Тийм, L хэмжээ байна. Gobi Cashmere эрэгтэй V хүзүүтэй цамц 289,000₮-ээр, мөн дугуй хүзүүтэй загвар 265,000₮-ээр худалдаалж байна. Аль нь таалагдаж байна?",
        time: "14:24",
      },
      {
        id: 5,
        role: "user",
        text: "V хүзүүтэйг нь авъя. Хүргэлтийн хугацаа хэд хоног вэ?",
        time: "14:25",
      },
      {
        id: 6,
        role: "assistant",
        text: "Маш сайн сонголт! Улаанбаатар хот доторх хүргэлт 1-2 ажлын хоног. Хөдөө орон нутаг руу 3-5 ажлын хоног болно. Захиалга өгөх үү?",
        time: "14:25",
      },
      { id: 7, role: "user", text: "Баярлалаа, захиалга өгье!", time: "14:26" },
      {
        id: 8,
        role: "assistant",
        text: "Захиалга амжилттай бүртгэгдлээ! Захиалгын дугаар: #VL-20240323-0847. QPay-ээр төлбөр төлнө үү. Баярлалаа!",
        time: "14:26",
      },
    ],
  },
  {
    id: 2,
    name: "Сарнай",
    lastMessage: "Ойлголоо, баярлалаа!",
    time: "12 мин",
    status: "active",
    channel: "mobile",
    messages: [
      { id: 1, role: "user", text: "Сайн уу, Samsung Galaxy S24-ийн үнэ хэд вэ?", time: "14:10" },
      {
        id: 2,
        role: "assistant",
        text: "Сайн байна уу! Samsung Galaxy S24 Ultra 256GB загвар 4,560,000₮, 512GB загвар 5,120,000₮-ээр байна.",
        time: "14:10",
      },
      { id: 3, role: "user", text: "Хуваарийн төлбөр боломжтой юу?", time: "14:11" },
      {
        id: 4,
        role: "assistant",
        text: "Тийм, 6 сар хүртэл хуваарийн төлбөр хийх боломжтой. Хас, Голомт, ХХБ-ны картаар сар бүр 760,000₮ төлөх нөхцөлтэй.",
        time: "14:12",
      },
      { id: 5, role: "user", text: "Ойлголоо, баярлалаа!", time: "14:12" },
    ],
  },
  {
    id: 3,
    name: "Батаа",
    lastMessage: "Маш их баярлалаа!",
    time: "34 мин",
    status: "closed",
    channel: "web",
    messages: [
      { id: 1, role: "user", text: "Буцаалтын нөхцөл ямар байдаг вэ?", time: "13:45" },
      {
        id: 2,
        role: "assistant",
        text: "Бараа хүлээн авснаас хойш 14 хоногийн дотор буцаалт хийх боломжтой. Бараа ашиглаагүй, шошготой байх шаардлагатай.",
        time: "13:46",
      },
      {
        id: 3,
        role: "user",
        text: "Өчигдөр авсан гутлаа буцаах боломжтой юу? Хэмжээ тохирсонгүй.",
        time: "13:47",
      },
      {
        id: 4,
        role: "assistant",
        text: "Мэдээж! Буцаалтын хүсэлт бүртгэлээ. Захиалгын дугаараа оруулна уу, би шалгаад өгье.",
        time: "13:47",
      },
      { id: 5, role: "user", text: "#VL-20240322-0512", time: "13:48" },
      {
        id: 6,
        role: "assistant",
        text: "Баталгаажлаа! Nike Air Max 90, 43 хэмжээ. Буцаалтын хүсэлт амжилттай илгээгдлээ. 2-3 ажлын хоногт шийдвэрлэнэ.",
        time: "13:49",
      },
      { id: 7, role: "user", text: "Маш их баярлалаа!", time: "13:49" },
    ],
  },
  {
    id: 4,
    name: "Оюунаа",
    lastMessage: "За, дараа дахин ирнэ!",
    time: "1 цаг",
    status: "closed",
    channel: "mobile",
    messages: [
      { id: 1, role: "user", text: "Гэрийн тавилгын хөнгөлөлт байна уу?", time: "13:15" },
      {
        id: 2,
        role: "assistant",
        text: "Одоогоор гэрийн тавилгын ангилалд 10-20% хямдрал зарлаж байна. Буйдан, ширээ, сандал зэрэг бараанууд хамрагдана.",
        time: "13:16",
      },
      { id: 3, role: "user", text: "Буйдангийн загвар юу байна?", time: "13:17" },
      {
        id: 4,
        role: "assistant",
        text: "Дараах загварууд байна: L хэлбэрийн буйдан 1,890,000₮ → 1,512,000₮, Шулуун буйдан 1,450,000₮ → 1,232,500₮. Хоёулаа өндөр чанарын арьсан бүрээстэй.",
        time: "13:18",
      },
      { id: 5, role: "user", text: "За, дараа дахин ирнэ!", time: "13:20" },
    ],
  },
  {
    id: 5,
    name: "Дорж",
    lastMessage: "Хүлээж байна, баярлалаа.",
    time: "2 цаг",
    status: "active",
    channel: "web",
    messages: [
      { id: 1, role: "user", text: "Монгол арьсан гутал захиалсан, хэзээ ирэх вэ?", time: "12:30" },
      {
        id: 2,
        role: "assistant",
        text: "Захиалгын дугаараа хэлнэ үү, би шалгаад өгье.",
        time: "12:31",
      },
      { id: 3, role: "user", text: "#VL-20240321-0234", time: "12:31" },
      {
        id: 4,
        role: "assistant",
        text: "Таны захиалга одоогоор бэлтгэгдэж байна. Маргааш хүргэлтэнд гарна. Хүргэлтийн мэдэгдлийг мессежээр илгээнэ.",
        time: "12:32",
      },
      { id: 5, role: "user", text: "Хүлээж байна, баярлалаа.", time: "12:33" },
    ],
  },
  {
    id: 6,
    name: "Цэцэгмаа",
    lastMessage: "Авах болсон, баярлалаа!",
    time: "3 цаг",
    status: "closed",
    channel: "web",
    messages: [
      { id: 1, role: "user", text: "Ноосон хөнжил нөөцөд байна уу?", time: "11:45" },
      {
        id: 2,
        role: "assistant",
        text: "Уучлаарай, одоогоор ноосон хөнжил (2 хүний) нөөцөнд байхгүй байна. Дахин нийлүүлэлт ирэхэд мэдэгдэл авах уу?",
        time: "11:46",
      },
      { id: 3, role: "user", text: "Нэг хүний нь яаж байна?", time: "11:47" },
      {
        id: 4,
        role: "assistant",
        text: "Нэг хүний ноосон хөнжил байгаа шүү! 280,000₮-ээр. 100% монгол ноосон, маш зөөлөн чанартай.",
        time: "11:48",
      },
      { id: 5, role: "user", text: "Авах болсон, баярлалаа!", time: "11:49" },
    ],
  },
];

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const selected = conversations.find((c) => c.id === selectedId)!;
  const activeCount = conversations.filter((c) => c.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-[calc(100vh-theme(spacing.32))] overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-primary shadow-xs">
        {/* Left panel - conversation list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border-default">
          {/* List header */}
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Яриа</h2>
              <p className="text-[11px] text-text-tertiary">
                {activeCount} идэвхтэй / {conversations.length} нийт
              </p>
            </div>
          </div>

          <div className="p-3">
            <Input
              placeholder="Яриа хайх..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimateList stagger={0.04}>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
                    "hover:bg-surface-secondary",
                    conv.id === selectedId
                      ? "border-l-2 border-brand-500 bg-surface-secondary"
                      : "border-l-2 border-transparent",
                  )}
                >
                  <Avatar size="sm" fallback={conv.name.charAt(0)} alt={conv.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate text-sm font-medium text-text-primary">
                          {conv.name}
                        </span>
                        {conv.channel === "mobile" ? (
                          <Smartphone className="h-3 w-3 shrink-0 text-text-tertiary" />
                        ) : (
                          <Globe className="h-3 w-3 shrink-0 text-text-tertiary" />
                        )}
                        <Badge variant={conv.status === "active" ? "success" : "default"} size="sm">
                          {conv.status === "active" ? "Идэвхтэй" : "Хаагдсан"}
                        </Badge>
                      </div>
                      <span className="shrink-0 text-[11px] text-text-tertiary">{conv.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-secondary">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </AnimateList>
          </div>
        </div>

        {/* Right panel - conversation detail */}
        <div className="flex flex-1 flex-col">
          {/* Header — simplified */}
          <div className="flex items-center gap-3 border-b border-border-default px-5 py-3">
            <Avatar size="sm" fallback={selected.name.charAt(0)} alt={selected.name} />
            <div>
              <span className="text-sm font-semibold text-text-primary">{selected.name}</span>
              <p className="text-[11px] text-text-tertiary">
                {selected.channel === "web" ? "Вэб" : "Мобайл"} / {selected.messages.length} мессеж
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimateList key={selectedId} stagger={0.03} className="flex flex-col gap-3">
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {/* Bot avatar for assistant messages */}
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[70%] rounded-[var(--radius-lg)] px-4 py-2.5",
                      msg.role === "user"
                        ? "rounded-br-[var(--radius-sm)] border border-brand-100 bg-brand-50 text-text-primary"
                        : "rounded-bl-[var(--radius-sm)] bg-surface-tertiary text-text-primary",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        msg.role === "user" ? "text-right text-brand-600/60" : "text-text-tertiary",
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </AnimateList>
          </div>
        </div>
      </div>
    </div>
  );
}
