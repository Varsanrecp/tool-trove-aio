import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { ToolCard } from "@/components/ToolCard";
import { tools as staticTools } from "@/lib/tools"; // fallback for random image

function getRandomToolImage() {
  const random = staticTools[Math.floor(Math.random() * staticTools.length)];
  return random.imageUrl;
}

const TOOL_CARD_CLASS = "w-full max-w-xs"; // adjust as needed to match your Tools page

const LearnAI = () => {
  const { isSignedIn, user } = useUser();
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

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
    fetchTools();
  }, []);

  async function fetchBlogs() {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setBlogs(data || []);
  }

  async function fetchTools() {
    const { data, error } = await supabase.from("tools").select("*");
    if (!error) setAllTools(data || []);
    else setAllTools(staticTools); // fallback to static tools if db fails
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const img = imageUrl || getRandomToolImage();
    if (editingBlog) {
      await supabase
        .from("blogs")
        .update({
          title,
          content,
          image_url: img,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBlog.id);
    } else {
      await supabase.from("blogs").insert([
        {
          title,
          content,
          image_url: img,
          user_id: user.id,
        },
      ]);
    }
    setOpen(false);
    resetForm();
    fetchBlogs();
  }

  async function handleDelete(blogId: string) {
    await supabase.from("blogs").delete().eq("id", blogId);
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
              className="bg-card border border-border rounded-lg shadow-sm p-6 transition hover:shadow-lg cursor-pointer flex items-center gap-4"
              onClick={() => setViewBlog(blog)}
            >
              <img
                src={blog.image_url || getRandomToolImage()}
                alt={blog.title}
                className="w-20 h-20 object-cover rounded"
              />
              <h2 className="text-xl font-semibold text-primary">{blog.title}</h2>
              {isSignedIn && user.id === blog.user_id && (
                <div className="ml-auto flex gap-2">
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
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={viewBlog.image_url || getRandomToolImage()}
                    alt={viewBlog.title}
                    className="w-32 h-32 object-cover rounded mb-4"
                  />
                  <h2 className="text-2xl font-bold text-primary mb-2">{viewBlog.title}</h2>
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(viewBlog.created_at).toLocaleString()}
                  </div>
                </div>
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

      {/* Add/Edit Blog Modal (Step 1: Title & Image) */}
      <Dialog open={open && !showContentEditor} onClose={() => setOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-card border border-border rounded-lg shadow-lg p-8 w-full max-w-lg">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editingBlog ? "Edit Blog" : "Add Blog"}
            </Dialog.Title>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
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
                <label className="block mb-1 font-medium">Image URL (optional)</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-primary"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
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