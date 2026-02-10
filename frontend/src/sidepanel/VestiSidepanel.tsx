import { useEffect, useState } from "react";
import type { Conversation, PageId } from "~lib/types";
import { Dock } from "./components/Dock";
import { TimelinePage } from "./pages/TimelinePage";
import { InsightsPage } from "./pages/InsightsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReaderView } from "./containers/ReaderView";

export function VestiSidepanel() {
  const [currentPage, setCurrentPage] = useState<PageId>("timeline");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const handler = (message: unknown) => {
      if (!message || typeof message !== "object") return;
      const type = (message as { type?: string }).type;
      if (type === "VESTI_DATA_UPDATED") {
        setRefreshToken(Date.now());
      }
    };
    chrome?.runtime?.onMessage?.addListener(handler);
    return () => {
      chrome?.runtime?.onMessage?.removeListener?.(handler);
    };
  }, []);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen w-full bg-bg-tertiary">
      <div className="flex h-full flex-1 overflow-hidden bg-bg-primary">
        <main className="min-w-0 flex-1">
          {currentPage === "timeline" && selectedConversation ? (
            <ReaderView
              conversation={selectedConversation}
              onBack={handleBack}
              refreshToken={refreshToken}
            />
          ) : currentPage === "timeline" ? (
            <TimelinePage
              onSelectConversation={handleSelectConversation}
              refreshToken={refreshToken}
            />
          ) : currentPage === "insights" ? (
            <InsightsPage
              conversation={selectedConversation}
              refreshToken={refreshToken}
            />
          ) : currentPage === "settings" ? (
            <SettingsPage />
          ) : null}
        </main>

        <Dock currentPage={currentPage} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}

export default VestiSidepanel;
