
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

const Contact = () => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <p className="text-blue-600">support@example.com</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Phone:</h3>
          <p className="text-blue-600">+91 98765 43210</p>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
          <SignedIn>
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
          </SignedIn>
          <SignedOut>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Sign in to Share Feedback</h3>
              <p className="text-gray-600 mb-4">Please sign in to share your feedback with us.</p>
              <SignInButton mode="modal">
                <Button>
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Contact;
