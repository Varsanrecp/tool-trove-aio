
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [feedback, setFeedback] = useState('');
  const { isSignedIn, user } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please sign in to submit feedback", {
        description: "You need to be signed in to submit feedback.",
        action: {
          label: "Sign In",
          onClick: () => document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click(),
        },
      });
      return;
    }
    
    if (feedback.trim()) {
      // Here you would typically send the feedback to your backend
      toast.success("Thank you for your feedback!");
      setFeedback('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We'd love to hear from you. Please get in touch with us using the information below.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg">
              <Phone className="h-6 w-6 mb-4 text-primary" />
              <h3 className="font-semibold">Phone</h3>
              <p className="text-sm text-muted-foreground mt-2">+91 98765 43210</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-card rounded-lg">
              <Mail className="h-6 w-6 mb-4 text-primary" />
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-muted-foreground mt-2">contact@aitools.com</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-card rounded-lg">
              <MapPin className="h-6 w-6 mb-4 text-primary" />
              <h3 className="font-semibold">Address</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                123 Tech Park<br />
                Bangalore, Karnataka<br />
                India
              </p>
            </div>
          </div>

          <div className="bg-card p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Send us your feedback</h2>
            {isSignedIn ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Your feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                <Button type="submit">Submit Feedback</Button>
              </form>
            ) : (
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Please sign in to submit feedback
                </p>
                <Button
                  onClick={() => 
                    document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click()
                  }
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
