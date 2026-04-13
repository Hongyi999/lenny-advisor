"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Plus,
  LogOut,
  ChevronLeft,
  Menu,
  History,
} from "lucide-react";
import { cn, truncate } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export default function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const loadUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || "");
  }, [supabase.auth]);

  const loadConversations = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (data) setConversations(data);
  }, [supabase]);

  useEffect(() => {
    loadConversations();
    loadUser();
  }, [loadConversations, loadUser]);

  // Refresh sidebar when navigating to a new conversation
  useEffect(() => {
    if (pathname.startsWith("/chat/")) {
      loadConversations();
    }
  }, [pathname, loadConversations]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const activeId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white border border-sand-200 shadow-sm flex items-center justify-center text-sand-600 hover:text-sand-900 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-sand-900/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-sand-200 flex flex-col transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sand-100">
          <Link
            href="/"
            className="font-serif text-lg font-bold text-sand-900 tracking-tight"
          >
            Lenny Advisor
          </Link>
        </div>

        {/* New chat */}
        <div className="p-3">
          <Link
            href="/chat"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-sand-200 text-sm font-medium text-sand-700 hover:bg-sand-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New conversation
          </Link>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-sand-400 text-sm">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    activeId === conv.id
                      ? "bg-accent-light text-accent font-medium"
                      : "text-sand-600 hover:bg-sand-50 hover:text-sand-900"
                  )}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="truncate">{truncate(conv.title, 40)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="p-3 border-t border-sand-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
              {userEmail?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-sand-600 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-lg hover:bg-sand-100 flex items-center justify-center text-sand-400 hover:text-sand-700 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
