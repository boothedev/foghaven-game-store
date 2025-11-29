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
import { Link } from "@tanstack/react-router";
import { usernameOnInvalidHandler } from "./LoginForm";

type RegisterFormProps = ComponentProps<"div"> & {
  onSubmitHandler: (event: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  onSubmitHandler,
  className,
  ...props
}: RegisterFormProps) {
  return (
    <Card className={cn("flex flex-col gap-6", className)} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Provide information to register to a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field className="grid grid-cols-[max-content_1fr]">
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id={"username"}
                name="username"
                type="text"
                placeholder="Username"
                required
                pattern="[a-zA-Z0-9_]+"
                minLength={3}
                onInput={usernameOnInvalidHandler}
                autoFocus
              />

              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id={"password"}
                name="password"
                type="password"
                placeholder="Password"
                required
                minLength={3}
              />

              <FieldLabel htmlFor="re-password">Re-enter Password</FieldLabel>
              <Input
                id={"re-password"}
                name="re-password"
                type="password"
                placeholder="Re-enter Password"
                required
                minLength={3}
              />
            </Field>
            <Field>
              <Button type="submit">Register</Button>
              <FieldDescription className="text-center">
                Already have an account? <Link to="/login">Login</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
