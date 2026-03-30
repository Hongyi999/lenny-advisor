import { Suspense } from "react";
import ChatView from "@/components/ChatView";

export const dynamic = "force-dynamic";

export default function NewChatPage() {
  return (
    <Suspense>
      <ChatView />
    </Suspense>
  );
}
