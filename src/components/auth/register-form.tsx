"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ApiService from "@/services/api";
import Cookies from "js-cookie";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      const response = await ApiService.post('/auth/register', data);
      
      console.log('Registration response:', response);
      
      if (response.ok && response.data?.user) {
        // Registration successful, redirect to login
        router.push('/login?status=registered');
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-[#1a1b20] text-white">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-white">
                  Create an account
                </h1>
                <p className="text-[#94a1b2] text-balance">
                  Join the GETapi experience today
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 rounded-md text-red-500">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@getapi.dev"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#7f5af0] hover:bg-[#6b4de6] text-white disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-[#94a1b2]">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-[#2cb67d] underline underline-offset-4 hover:text-[#29d99f]"
                >
                  Sign in
                </a>
              </div>
            </div>
          </form>
          <div className="bg-[#16181d] relative hidden md:block m-6">
            <Image
              src="/auth/Login.png"
              alt="Registration illustration"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-[#94a1b2] text-center text-xs">
        By signing up, you agree to our{" "}
        <a href="#" className="underline hover:text-[#2cb67d]">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-[#2cb67d]">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
