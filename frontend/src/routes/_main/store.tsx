import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/store')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/store"!</div>
}
