import { RegisterForm } from '@/components/RegisterForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RegisterForm />;
}
