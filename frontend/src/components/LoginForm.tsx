import { DialogDescription } from "@radix-ui/react-dialog";
import type { ComponentProps, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Link } from "@tanstack/react-router";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type LoginFormProps = ComponentProps<"div"> & {
  onSubmitHandler: (event: FormEvent<HTMLFormElement>) => void;
};

export const usernameOnInvalidHandler = (
  event: FormEvent<HTMLInputElement>
) => {
  const username = event.currentTarget;
  if (username.validity.patternMismatch) {
    username.setCustomValidity("Letters, digits, and underscores only");
  } else {
    username.setCustomValidity("");
  }
};

export function LoginForm({
  onSubmitHandler,
  className,
  ...props
}: LoginFormProps) {
  return (
    <Card className={cn("flex flex-col gap-6", className)} {...props}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your username below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id={"username"}
                type="text"
                name="username"
                placeholder="Username"
                required
                pattern="[a-zA-Z0-9_]+"
                minLength={3}
                onInput={usernameOnInvalidHandler}
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Dialog>
                  <DialogTrigger
                    className="ml-auto inline-block cursor-pointer text-sm underline-offset-4 hover:underline"
                    tabIndex={-1}
                  >
                    Forgot your password?
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Oops!</DialogTitle>
                      <DialogDescription>
                        You can't ask us to fix your problem. Your fault, your
                        responsibility.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id={"password"}
                type="password"
                name="password"
                placeholder="Password"
                required
                minLength={3}
              />
              <div className="ml-1 flex items-center gap-3">
                <Checkbox id="remember" name="remember" />
                <Label htmlFor="remember">Remember</Label>
              </div>
            </Field>
            <Field>
              <Button type="submit">Login</Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link to="/register">Register</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
