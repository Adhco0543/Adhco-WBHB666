"use client";

import { Suspense } from "react";
import ChatContent from "./chat-content";

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
