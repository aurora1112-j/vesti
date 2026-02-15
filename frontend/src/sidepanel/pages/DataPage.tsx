import { DataManagementPanel } from "../components/DataManagementPanel";

export function DataPage() {
  return (
    <div className="vesti-shell flex h-full flex-col overflow-y-auto vesti-scroll bg-bg-app">
      <header className="flex h-8 shrink-0 items-center px-4">
        <h1 className="vesti-page-title text-text-primary">Data</h1>
      </header>

      <div className="p-4">
        <DataManagementPanel />
      </div>
    </div>
  );
}
