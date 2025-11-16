import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/login"!</div>
}
