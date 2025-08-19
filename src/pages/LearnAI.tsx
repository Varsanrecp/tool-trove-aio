// LearnAI.tsx
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

const LearnAI = () => {
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
  // Create a temporary supabase client that includes Clerk's session token in Authorization header.
  // IMPORTANT: This uses Clerk's default session token (getToken() without a template).
  async function getAuthedSupabaseClient() {
    // make sure Clerk is loaded
    if (!isLoaded) {
      throw new Error("Auth not loaded yet. Wait for Clerk to finish loading.");
    }
    // get Clerk session token (default)
    const token = await getToken();
    if (!token) {
      throw new Error("No Clerk token found. Are you signed in?");
    }

    // use your Vite env vars (common defaults)
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      throw new Error(
        "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variables. If you use different names, tell me and I'll update the code."
      );
    }

    // create a temporary client that attaches Clerk token to Authorization header
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
    setContent((prev) => prev + ` [tool:${tool.id}] `);
    setShowToolPicker(false);
  }

  function parseContentWithTools(content: string) {
    const parts = content.split(/(\[tool:[^\]]+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[tool:(.+)\]/);
      if (match) {
        const toolId = match[1];
        const tool = allTools.find((t) => t.id === toolId);
        if (tool)
          return (
            <div key={idx} className="my-4 flex justify-center">
              <div className={TOOL_CARD_CLASS}>
                <ToolCard tool={tool} isBookmarked={false} toggleBookmark={() => {}} />
              </div>
            </div>
          );
        return <span key={idx} className="text-red-500">[Unknown Tool]</span>;
      }
      return <span key={idx}>{part}</span>;
    });
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
    setContent(blog.content);
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
              <h2 className="text-xl font-semibold text-primary mb-3">{blog.title}</h2>
              <img
                src={blog.image_url || getRandomToolImage()}
                alt={blog.title}
                className="w-full h-48 object-cover rounded"
              />
              {isSignedIn && user?.id === blog.user_id && (
                <div className="mt-4 flex gap-4">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={e => {
                      e.stopPropagation();
                      handleEdit(blog);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={e => {
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
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl p-8">
            {viewBlog && (
              <>
                <h2 className="text-2xl font-bold text-primary mb-2 text-center">{viewBlog.title}</h2>
                <div className="text-xs text-muted-foreground mb-4 text-center">
                  {new Date(viewBlog.created_at).toLocaleString()}
                </div>
                <img
                  src={viewBlog.image_url || getRandomToolImage()}
                  alt={viewBlog.title}
                  className="w-full h-64 object-cover rounded mb-6"
                />
                <div className="prose prose-invert max-w-none">
                  {parseContentWithTools(viewBlog.content)}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    className="px-4 py-2 rounded bg-muted text-foreground"
                    onClick={() => setViewBlog(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add/Edit Blog Modal (Title + Image) */}
      <Dialog open={open && !showContentEditor} onClose={() => setOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg p-8 w-full max-w-lg">
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

                    // create a simple safe filename and keep flat in bucket
                    const fileExt = file.name.split(".").pop();
                    const safeExt = fileExt ? fileExt.toLowerCase() : "jpg";
                    const fileName = `${Date.now()}.${safeExt}`;

                    try {
                      // create authed supabase client that includes Clerk session token in header
                      const sb = await getAuthedSupabaseClient();
                      console.log("Uploading to Supabase with Clerk token...");

                      const uploadResult = await sb.storage
                        .from("blog-public-images")
                        .upload(fileName, file, { upsert: true });

                      console.log("uploadResult:", uploadResult);

                      if (uploadResult.error) {
                        console.error("Supabase upload error:", uploadResult.error);
                        alert("Upload error: " + uploadResult.error.message);
                        return;
                      }

                      // get public URL
                      const publicUrlResult = sb.storage
                        .from("blog-public-images")
                        .getPublicUrl(uploadResult.data.path);

                      console.log("publicUrlResult:", publicUrlResult);

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
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl p-8">
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
                  placeholder="Write your blog here. Use the + Add Tool button to embed tools."
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
