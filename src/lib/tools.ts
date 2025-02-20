
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  imageUrl: string;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "chatbots",
    name: "Chatbots",
    description: "AI-powered conversational agents",
    icon: "message-circle",
  },
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Create images with AI",
    icon: "image",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Tools to enhance workflow",
    icon: "zap",
  },
  {
    id: "writing",
    name: "Writing",
    description: "AI writing assistants",
    icon: "pen-tool",
  },
];

export const tools: Tool[] = [
  {
    id: "1",
    name: "ChatGPT",
    description: "Advanced language model for conversation and text generation",
    category: "chatbots",
    url: "https://chat.openai.com",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    featured: true,
  },
  {
    id: "2",
    name: "DALL-E",
    description: "Create imaginative images from textual descriptions",
    category: "image-generation",
    url: "https://labs.openai.com",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    featured: true,
  },
  {
    id: "3",
    name: "Notion AI",
    description: "AI-powered writing assistant integrated with Notion",
    category: "productivity",
    url: "https://notion.so",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    featured: true,
  },
];
