import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { createClient } from "@supabase/supabase-js";
import { supabase as baseSupabase } from "@/integrations/supabase/client";
import { useUser, useAuth } from "@clerk/clerk-react";
import { ToolCard } from "@/components/ToolCard";
import { tools as staticTools } from "@/lib/tools"; // fallback for random image

function getRandomToolImage() {
  const random = staticTools[Math.floor(Math.random() * staticTools.length)];
  return random.imageUrl;
}

const TOOL_CARD_CLASS = "w-full max-w-xs";

const LearnAI: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const { getToken, isLoaded } = useAuth();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // Blog form state
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [allTools, setAllTools] = useState<any[]>([]);
  const [showContentEditor, setShowContentEditor] = useState(false);

  // Blog view modal
  const [viewBlog, setViewBlog] = useState<any>(null);

  // ---------- data fetching ----------
  useEffect(() => {
    fetchBlogs();
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBlogs() {
    const { data, error } = await baseSupabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("fetchBlogs error:", error);
      return;
    }
    setBlogs(data || []);
  }

  async function fetchTools() {
    const { data, error } = await baseSupabase.from("tools").select("*");
    if (error) {
      console.error("fetchTools error:", error);
      setAllTools(staticTools);
      return;
    }
    setAllTools(data || []);
  }

  // ---------- helpers ----------
  async function getAuthedSupabaseClient() {
    if (!isLoaded) {
      throw new Error("Auth not loaded yet. Wait for Clerk to finish loading.");
    }
    const token = await getToken();
    if (!token) {
      throw new Error("No Clerk token found. Are you signed in?");
    }

    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      throw new Error(
        "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variables."
      );
    }

    return createClient(url, anon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  function resetForm() {
    setTitle("");
    setImageUrl("");
    setContent("");
    setEditingBlog(null);
    setShowContentEditor(false);
  }

  function handleAddTool(tool: any) {
    // place tool as its own block (surrounded by blank lines)
    setContent((prev) => prev + `\n\n[tool:${tool.id}]\n\n`);
    setShowToolPicker(false);
  }

  /**
   * parseContentWithTools
   * - normalizes newlines
   * - produces a flat stack of blocks
   * - tool block -> full-width centered tool card
   * - if a tool is followed by a text block, that text is rendered below the tool
   * - single newline inside a paragraph becomes <br/>
   */
  function parseContentWithTools(contentStr: string) {
    if (!contentStr) return null;

    // Normalize CRLF -> LF
    const content = contentStr.replace(/\r\n/g, "\n");

    // Split into parts and preserve [tool:...] tokens
    const parts = content.split(/(\[tool:[^\]]+\])/g);

    type Block =
      | { type: "text"; text: string }
      | { type: "tool"; toolId: string };

    const blocks: Block[] = [];
    let textBuffer = "";

    const flushTextBuffer = () => {
      if (textBuffer.trim() !== "") {
        blocks.push({ type: "text", text: textBuffer });
      }
      textBuffer = "";
    };

    for (const p of parts) {
      const m = p.match(/^\[tool:(.+)\]$/);
      if (m) {
        flushTextBuffer();
        blocks.push({ type: "tool", toolId: m[1].trim() });
      } else {
        textBuffer += p;
      }
    }
    flushTextBuffer();

    // Render helper: text -> paragraph elements, preserve single line breaks as <br/>
    const renderParagraphs = (text: string, keyBase: string) => {
      const paras = text
        .split(/\n{2,}/g) // paragraphs split by 2+ newlines
        .map((p) => p.trim())
        .filter(Boolean);

      return paras.map((p, idx) => {
        const lines = p.split(/\n/g); // single newline => line break
        return (
          <p key={`${keyBase}-p-${idx}`} className="mb-4 text-base leading-7 text-muted-foreground">
            {lines.map((line, li) => (
              <React.Fragment key={`${keyBase}-p-${idx}-l-${li}`}>
                {line}
                {li < lines.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </p>
        );
      });
    };

    const rendered: React.ReactNode[] = [];

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "text") {
        rendered.push(...renderParagraphs(b.text, `text-${i}`));
        continue;
      }

      // b.type === "tool"
      const tool = allTools.find((t) => String(t.id) === String(b.toolId));
      // render the tool as full-width (centered)
      if (tool) {
        rendered.push(
          <div key={`tool-full-${i}`} className="my-6 flex justify-center">
            <div className={TOOL_CARD_CLASS}>
              <ToolCard tool={tool} isBookmarked={false} toggleBookmark={() => {}} />
            </div>
          </div>
        );
      } else {
        rendered.push(
          <div key={`tool-unknown-${i}`} className="my-4 text-red-500">
            [Unknown Tool: {b.toolId}]
          </div>
        );
      }

      // If next block is text, render it **below** the tool (not side-by-side)
      const next = blocks[i + 1];
      if (next && next.type === "text") {
        rendered.push(...renderParagraphs(next.text, `tool-${i}-text`));
        i++; // consume the text block so it doesn't get processed again
      }
    }

    return rendered;
  }

  // ---------- submit / CRUD ----------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const img = imageUrl || getRandomToolImage();

    try {
      if (editingBlog) {
        await baseSupabase
          .from("blogs")
          .update({
            title,
            content,
            image_url: img,
            user_id: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBlog.id);
      } else {
        await baseSupabase.from("blogs").insert([
          {
            title,
            content,
            image_url: img,
            user_id: user?.id,
          },
        ]);
      }
      setOpen(false);
      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error("handleSubmit error:", err);
      alert("Error saving blog. Check console.");
    }
  }

  async function handleDelete(blogId: string) {
    await baseSupabase.from("blogs").delete().eq("id", blogId);
    fetchBlogs();
  }

  function handleEdit(blog: any) {
    setEditingBlog(blog);
    setTitle(blog.title);
    setImageUrl(blog.image_url || "");
    setContent(blog.content || "");
    setOpen(true);
    setShowContentEditor(true);
  }

  // ---------- UI ----------
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8 relative">
          <h1 className="text-3xl font-bold text-primary text-center flex-1">Learn AI</h1>
          {isSignedIn && (
            <button
              className="absolute right-0 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
            >
              Add Blog
            </button>
          )}
        </div>

        {/* Blog List */}
        <div className="grid gap-8">
          {blogs.length === 0 && (
            <div className="text-center text-muted-foreground">No blogs yet.</div>
          )}
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-card border border-border rounded-lg shadow-sm p-6 transition hover:shadow-lg cursor-pointer"
              onClick={() => setViewBlog(blog)}
            >
              <div className="mb-4">
                <img
                  src={blog.image_url || getRandomToolImage()}
                  alt={blog.title}
                  className="w-full h-44 object-cover rounded"
                />
              </div>
              <h2 className="text-xl font-semibold text-primary mb-2">{blog.title}</h2>
              <div className="text-sm text-muted-foreground mb-3">{new Date(blog.created_at).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {String(blog.content || "")
                  .replace(/\[tool:[^\]]+\]/g, "")
                  .slice(0, 220)
                  .trim()}
                {String(blog.content || "").replace(/\[tool:[^\]]+\]/g, "").length > 220 ? "..." : ""}
              </div>

              {isSignedIn && user?.id === blog.user_id && (
                <div className="mt-4 flex gap-4">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(blog);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(blog.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blog View Modal */}
      <Dialog open={!!viewBlog} onClose={() => setViewBlog(null)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl p-6 md:p-8 overflow-auto">
            {viewBlog && (
              <article>
                <header className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">{viewBlog.title}</h2>
                  <div className="text-xs text-muted-foreground">
                    {new Date(viewBlog.created_at).toLocaleString()}
                  </div>
                </header>

                <div className="mb-6">
                  <img
                    src={viewBlog.image_url || getRandomToolImage()}
                    alt={viewBlog.title}
                    className="w-full h-64 object-cover rounded"
                  />
                </div>

                <div className="max-w-prose mx-auto">
                  {parseContentWithTools(viewBlog.content || "")}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    className="px-4 py-2 rounded bg-muted text-foreground"
                    onClick={() => setViewBlog(null)}
                  >
                    Close
                  </button>
                </div>
              </article>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add/Edit Blog Modal (Title + Image) */}
      <Dialog open={open && !showContentEditor} onClose={() => setOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-lg">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editingBlog ? "Edit Blog" : "Add Blog"}
            </Dialog.Title>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-primary"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const fileExt = file.name.split(".").pop();
                    const safeExt = fileExt ? fileExt.toLowerCase() : "jpg";
                    const fileName = `${Date.now()}.${safeExt}`;

                    try {
                      const sb = await getAuthedSupabaseClient();
                      const uploadResult = await sb.storage
                        .from("blog-public-images")
                        .upload(fileName, file, { upsert: true });

                      if (uploadResult.error) {
                        console.error("Supabase upload error:", uploadResult.error);
                        alert("Upload error: " + uploadResult.error.message);
                        return;
                      }

                      const publicUrlResult = sb.storage
                        .from("blog-public-images")
                        .getPublicUrl(uploadResult.data.path);

                      const publicUrl =
                        (publicUrlResult.data as any)?.publicUrl ||
                        (publicUrlResult as any)?.data?.publicUrl;

                      if (!publicUrl) {
                        console.warn("No public URL returned, but upload succeeded.");
                        alert("Uploaded but couldn't get public URL. Check storage.");
                        return;
                      }

                      setImageUrl(publicUrl);
                    } catch (err: any) {
                      console.error("Upload exception:", err);
                      alert(err?.message || "Unexpected upload error");
                    }
                  }}
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="mt-2 w-full h-40 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className={`px-4 py-2 rounded bg-primary text-white ${!title ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!title}
                  onClick={() => setShowContentEditor(true)}
                >
                  Write
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Fullscreen Blog Content Editor */}
      <Dialog open={open && showContentEditor} onClose={() => setOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editingBlog ? "Edit Blog Content" : "Write Your Blog"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Content</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[300px] bg-background text-foreground placeholder:text-muted-foreground focus:outline-primary"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write your blog here. Use the + Add Tool button to embed tools. After a tool, text will appear below it."
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-primary underline"
                  onClick={() => setShowToolPicker(true)}
                >
                  + Add Tool
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-muted text-foreground"
                  onClick={() => {
                    setShowContentEditor(false);
                    if (!editingBlog) resetForm();
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-white"
                >
                  {editingBlog ? "Update" : "Submit"}
                </button>
              </div>
            </form>

            {/* Tool Picker Modal */}
            {showToolPicker && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Pick a Tool</h3>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {allTools.map((tool) => (
                      <button
                        key={tool.id}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-muted"
                        onClick={() => handleAddTool(tool)}
                      >
                        <img src={tool.imageUrl} alt={tool.name} className="w-8 h-8 rounded" />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="mt-4 px-4 py-2 rounded bg-muted text-foreground"
                    onClick={() => setShowToolPicker(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  );
};

export default LearnAI;
