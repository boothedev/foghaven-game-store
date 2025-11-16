import { DialogDescription } from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Link } from '@tanstack/react-router';

type LoginFormProps = ComponentProps<'div'>;

export function RegisterForm({
  className,
  ...props
}: LoginFormProps) {
  return (
    <Card className={cn('flex flex-col gap-6', className)} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id={'username'}
                type="text"
                placeholder="Username"
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Dialog>
                  <DialogTrigger className="ml-auto inline-block cursor-pointer text-sm underline-offset-4 hover:underline">
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
                id={'password'}
                type="password"
                placeholder="Password"
                required
              />
            </Field>
            <Field>
              <Button type="submit">Register</Button>
              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link to='/login'>
                  Login
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
