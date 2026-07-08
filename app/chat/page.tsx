"use client";

import { Suspense } from "react";
import EnhancedChatContent from "./enhanced-chat";

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <EnhancedChatContent />
    </Suspense>
  );
}
