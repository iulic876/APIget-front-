"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
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
                <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                <p className="text-[#94a1b2] text-balance">
                  Login to your GETapi account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@sirius.dev"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <a
                    href=""
                    className="ml-auto text-sm text-[#2cb67d] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-[#16181d] text-white border border-[#2e2f3e]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#7f5af0] hover:bg-[#6b4de6] text-white"
              >
                Login
              </Button>
              <div className="relative text-center text-sm text-[#94a1b2] after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-[#1a1b20] relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border border-[#2e2f3e] bg-[#16181d] text-white hover:bg-[#1f2129]"
                >
                  <span></span>
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border border-[#2e2f3e] bg-[#16181d] text-white hover:bg-[#1f2129]"
                >
                  <span>G</span>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full border border-[#2e2f3e] bg-[#16181d] text-white hover:bg-[#1f2129]"
                >
                  <span>f</span>
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </div>
              <div className="text-center text-sm text-[#94a1b2]">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="text-[#2cb67d] underline underline-offset-4 hover:text-[#29d99f]"
                >
                  Sign up
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
        By clicking continue, you agree to our{" "}
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
