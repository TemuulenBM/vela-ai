export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-64 border-r p-4">
        <h2 className="text-lg font-semibold">Vela AI</h2>
        <nav className="mt-8 space-y-2">
          <a href="/analytics" className="block px-3 py-2 rounded hover:bg-gray-100">
            Аналитик
          </a>
          <a href="/products" className="block px-3 py-2 rounded hover:bg-gray-100">
            Бараа
          </a>
          <a href="/conversations" className="block px-3 py-2 rounded hover:bg-gray-100">
            Яриа
          </a>
          <a href="/settings" className="block px-3 py-2 rounded hover:bg-gray-100">
            Тохиргоо
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
