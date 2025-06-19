"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-[#1a1b20] text-white">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-white">
                  Create an account
                </h1>
                <p className="text-[#94a1b2] text-balance">
                  Join the GETapi experience today
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@getapi.dev"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#7f5af0] hover:bg-[#6b4de6] text-white"
              >
                Create Account
              </Button>

              <div className="relative text-center text-sm text-[#94a1b2] after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-[#1a1b20] relative z-10 px-2">
                  Or sign up with
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border border-[#2e2f3e] bg-[#16181d] text-white hover:bg-[#1f2129]"
                >
                  <span></span>
                  <span className="sr-only">Sign up with Apple</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border border-[#2e2f3e] bg-[#16181d] text-white hover:bg-[#1f2129]"
                >
                  <span>G</span>
                  <span className="sr-only">Sign up with Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border border-[#2e2f3e] bg-[#16181d] text-white hover:bg-[#1f2129]"
                >
                  <span>f</span>
                  <span className="sr-only">Sign up with Meta</span>
                </Button>
              </div>

              <div className="text-center text-sm text-[#94a1b2]">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-[#2cb67d] underline underline-offset-4 hover:text-[#29d99f]"
                >
                  Log in
                </a>
              </div>
            </div>
          </form>
          <div className="bg-[#0e1013] relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
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
