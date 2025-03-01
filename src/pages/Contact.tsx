
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we'll just show a success message
    // In a real app, this would send the feedback to a backend
    toast({
      title: "Thank you for your feedback!",
      description: "We'll get back to you soon.",
    });
    setFeedback("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Get in Touch</h2>
          <p className="text-gray-600">
            We'd love to hear from you! Reach out to us through:
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Email:</h3>
          <p className="text-blue-600">contact@example.com</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Phone:</h3>
          <p className="text-blue-600">+91 98765 43210</p>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                Your Message
              </label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>
            <Button type="submit">
              Send Feedback
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
