export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  imageUrl: string;
  featured: boolean;
  pricing: "free" | "paid" | "trial";
  tags: string[];
  rating: number;
  popularity: number;
  ratingCount: number;
  totalRating: number;
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
    pricing: "free",
    tags: ["language", "conversation", "writing"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "2",
    name: "DALL-E",
    description: "Create imaginative images from textual descriptions",
    category: "image-generation",
    url: "https://labs.openai.com",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    featured: true,
    pricing: "paid",
    tags: ["images", "art", "creative"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "3",
    name: "Notion AI",
    description: "AI-powered writing assistant integrated with Notion",
    category: "productivity",
    url: "https://notion.so",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    featured: true,
    pricing: "trial",
    tags: ["productivity", "writing", "organization"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "4",
    name: "Midjourney",
    description: "Create stunning artwork and illustrations using AI",
    category: "image-generation",
    url: "https://midjourney.com",
    imageUrl: "https://images.unsplash.com/photo-1519638399535-1b036603ac77",
    featured: true,
    pricing: "paid",
    tags: ["art", "images", "creative", "illustrations"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "5",
    name: "Jasper",
    description: "AI writing assistant for marketing and content creation",
    category: "writing",
    url: "https://jasper.ai",
    imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
    featured: true,
    pricing: "paid",
    tags: ["writing", "marketing", "content"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "6",
    name: "Claude",
    description: "Advanced AI assistant for research and analysis",
    category: "chatbots",
    url: "https://claude.ai",
    imageUrl: "https://images.unsplash.com/photo-1525373698358-041e3a460346",
    featured: false,
    pricing: "free",
    tags: ["research", "analysis", "writing"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "7",
    name: "AutoGPT",
    description: "Autonomous AI agent for complex tasks",
    category: "productivity",
    url: "https://auto.git",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692",
    featured: false,
    pricing: "free",
    tags: ["automation", "productivity", "AI"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "8",
    name: "Stable Diffusion",
    description: "Open-source image generation model",
    category: "image-generation",
    url: "https://stability.ai",
    imageUrl: "https://images.unsplash.com/photo-1548048026-5a1a941d93d3",
    featured: true,
    pricing: "free",
    tags: ["images", "art", "open-source"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "9",
    name: "Copy.ai",
    description: "AI copywriting tool for marketing and sales",
    category: "writing",
    url: "https://copy.ai",
    imageUrl: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f",
    featured: false,
    pricing: "trial",
    tags: ["copywriting", "marketing", "content"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  },
  {
    id: "10",
    name: "GitHub Copilot",
    description: "AI pair programmer for software development",
    category: "productivity",
    url: "https://github.com/features/copilot",
    imageUrl: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3",
    featured: true,
    pricing: "paid",
    tags: ["coding", "development", "productivity"],
    rating: 0,
    popularity: 0,
    ratingCount: 0,
    totalRating: 0
  }
];
