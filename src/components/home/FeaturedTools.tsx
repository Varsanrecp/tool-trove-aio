// src/components/home/FeaturedTools.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useInView } from "./hooks";
import { Tool } from "@/lib/tools";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { useBookmark } from "@/hooks/useBookmark";

export default function FeaturedTools() {
  const navigate = useNavigate();
  const { ref, inView } = useInView<HTMLDivElement>();
  const { isBookmarked, toggleBookmark } = useBookmark();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchFeatured() {
      setLoading(true);
      try {
        // Fetch top 3 tools from Supabase by popularity
        const { data, error } = await supabase
          .from("tools")
          .select("*")
          .order("popularity", { ascending: false })
          .limit(3);

        if (error) {
          console.error("FeaturedTools: supabase error:", error);
          if (mounted) setTools([]);
        } else {
          // Normalize tags to avoid runtime .map errors if tags null
          const normalized = (data || []).map((t: any) => ({
            ...t,
            tags: t.tags ?? [],
          })) as Tool[];
          if (mounted) setTools(normalized);
        }
      } catch (err) {
        console.error("FeaturedTools: unexpected error:", err);
        if (mounted) setTools([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFeatured();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Featured tools</h2>
        <Button variant="secondary" onClick={() => navigate("/tools")}>
          See all
        </Button>
      </div>

      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && (
          // lightweight placeholders while loading
          [0, 1, 2].map((n) => (
            <div
              key={`ph-${n}`}
              className={`group overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-700 opacity-100 translate-y-0`}
              style={{ transitionDelay: `${n * 70}ms` }}
            >
              <div className="h-28 w-full rounded-xl bg-white/5 animate-pulse" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                <div className="mt-4 h-8 w-28 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))
        )}

        {!loading && tools.length === 0 && (
          // show placeholders if nobody in DB
          [0, 1, 2].map((n) => (
            <div
              key={`empty-${n}`}
              className={`group overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
              style={{ transitionDelay: `${n * 70}ms` }}
            >
              <div className="h-28 w-full rounded-xl bg-white/5" />
              <div className="mt-4">
                <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
                <div className="mt-4 h-8 w-28 bg-white/5 rounded" />
              </div>
            </div>
          ))
        )}

        {!loading && tools.length > 0 && tools.map((tool, idx) => (
          <div
            key={tool.id}
            className={`group overflow-hidden rounded-2xl border bg-card p-0 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            style={{ transitionDelay: `${idx * 70}ms` }}
          >
            {/* render your existing ToolCard (keeps look & behavior) */}
            <div className="p-4">
              <ToolCard
                tool={tool}
                isBookmarked={isBookmarked(tool.id)}
                toggleBookmark={() => toggleBookmark(tool)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
