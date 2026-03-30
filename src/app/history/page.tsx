import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl font-bold text-sand-900 mb-2">
          Conversation History
        </h1>
        <p className="text-sand-500 mb-8">
          Your past conversations with Lenny Advisor
        </p>

        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-sand-300 mx-auto mb-4" />
            <p className="text-sand-500">
              No conversations yet. Start by{" "}
              <Link href="/chat" className="text-accent hover:underline">
                asking a question
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-sand-200 bg-white hover:border-accent/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-sand-900 truncate">
                    {conv.title}
                  </h3>
                  <p className="text-xs text-sand-500 mt-0.5">
                    {new Date(conv.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
