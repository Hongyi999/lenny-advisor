"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  MoreHorizontal,
  Pin,
  PinOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn, truncate } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  is_pinned?: boolean;
}

export default function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
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
      .select("id, title, updated_at, is_pinned")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpenId]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleTogglePin(conv: Conversation) {
    setMenuOpenId(null);
    const newPinned = !conv.is_pinned;
    // Optimistic update
    setConversations((prev) =>
      prev
        .map((c) => (c.id === conv.id ? { ...c, is_pinned: newPinned } : c))
        .sort((a, b) => {
          if ((b.is_pinned ? 1 : 0) !== (a.is_pinned ? 1 : 0)) {
            return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
          }
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        })
    );
    const res = await fetch(`/api/conversations/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_pinned: newPinned }),
    });
    if (!res.ok) loadConversations();
  }

  async function handleDelete(conv: Conversation) {
    setMenuOpenId(null);
    if (!confirm(`Delete "${conv.title}"? This cannot be undone.`)) return;
    // Optimistic remove
    setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    const res = await fetch(`/api/conversations/${conv.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      loadConversations();
      return;
    }
    // If currently viewing deleted conversation, navigate away
    if (pathname === `/chat/${conv.id}`) {
      router.push("/chat");
    }
  }

  function startRename(conv: Conversation) {
    setMenuOpenId(null);
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  }

  async function commitRename(conv: Conversation) {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed || trimmed === conv.title) return;
    // Optimistic update
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, title: trimmed } : c))
    );
    const res = await fetch(`/api/conversations/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (!res.ok) loadConversations();
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
              {conversations.map((conv) => {
                const isActive = activeId === conv.id;
                const isRenaming = renamingId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-xl text-sm transition-colors",
                      isActive
                        ? "bg-accent-light text-accent font-medium"
                        : "text-sand-600 hover:bg-sand-50 hover:text-sand-900"
                    )}
                  >
                    {isRenaming ? (
                      <div className="flex items-center gap-2 px-3 py-2 w-full">
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(conv)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename(conv);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="flex-1 min-w-0 bg-white border border-sand-300 rounded-md px-2 py-1 text-sm text-sand-900 focus:outline-none focus:border-accent"
                        />
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/chat/${conv.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 pl-3 pr-1 py-2.5 flex-1 min-w-0"
                        >
                          {conv.is_pinned ? (
                            <Pin className="w-4 h-4 shrink-0 opacity-60 fill-current" />
                          ) : (
                            <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                          )}
                          <span className="truncate">
                            {truncate(conv.title, 36)}
                          </span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuOpenId(
                              menuOpenId === conv.id ? null : conv.id
                            );
                          }}
                          className={cn(
                            "mr-1.5 w-7 h-7 shrink-0 rounded-md flex items-center justify-center transition-opacity cursor-pointer",
                            menuOpenId === conv.id
                              ? "opacity-100 bg-sand-200/60"
                              : "opacity-0 group-hover:opacity-100 hover:bg-sand-200/60"
                          )}
                          aria-label="Conversation options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {menuOpenId === conv.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-1 top-full mt-1 z-20 w-44 rounded-xl bg-white border border-sand-200 shadow-lg py-1"
                      >
                        <button
                          onClick={() => handleTogglePin(conv)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50 cursor-pointer"
                        >
                          {conv.is_pinned ? (
                            <>
                              <PinOff className="w-4 h-4" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="w-4 h-4" />
                              Pin to top
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => startRename(conv)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          Rename
                        </button>
                        <div className="h-px bg-sand-100 my-1" />
                        <button
                          onClick={() => handleDelete(conv)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
