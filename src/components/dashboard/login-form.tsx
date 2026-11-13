"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/users/login", {
        body: JSON.stringify({ email, password }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (response.ok) {
        // A full load, so the dashboard gets its own security headers.
        window.location.assign(next);
      } else {
        setError("Wrong email or password.");
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Etenesh HR sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[15px]" htmlFor="login-email">
              Email
            </Label>
            <Input
              autoComplete="username"
              className="h-10 text-[15px]"
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[15px]" htmlFor="login-password">
              Password
            </Label>
            <Input
              autoComplete="current-password"
              className="h-10 text-[15px]"
              id="login-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="h-11 text-[15px]" disabled={pending} type="submit">
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
