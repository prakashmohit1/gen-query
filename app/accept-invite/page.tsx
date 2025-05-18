"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { usersService } from "@/lib/services/users";
import { Users, Mail, Building2, ArrowRight } from "lucide-react";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteToken = searchParams.get("token");

  if (!inviteToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-50">
        <div className="mx-auto max-w-md text-center px-6">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Invalid Invitation
            </h1>
            <p className="text-gray-600">
              This invitation link is invalid or has expired. Please contact
              your team administrator for a new invitation.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await usersService.acceptInvite({
        name: name.trim(),
        token: inviteToken,
      });

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account has been successfully set up.",
      });

      router.push("/");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-50 to-indigo-50">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Your Team
            </h1>
            <p className="text-gray-600">
              Complete your profile to get started
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? (
                  "Setting up your account..."
                ) : (
                  <>
                    Join Team
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-center p-12 bg-gradient-to-br from-primary-600 to-indigo-700">
        <div className="max-w-md mx-auto text-white">
          <Building2 className="h-12 w-12 mb-8" />
          <h2 className="text-3xl font-bold mb-6">Welcome to the team!</h2>
          <div className="space-y-6">
            <FeatureItem
              title="Collaborate"
              description="Work together with your team in real-time"
            />
            <FeatureItem
              title="Stay Updated"
              description="Get notified about important updates and changes"
            />
            <FeatureItem
              title="Access Anywhere"
              description="Use the platform from any device, anywhere"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-500 bg-opacity-25">
          <ArrowRight className="h-5 w-5 text-primary-100" />
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-primary-100">{description}</p>
      </div>
    </div>
  );
}
