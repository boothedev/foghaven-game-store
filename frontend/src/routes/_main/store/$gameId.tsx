import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/store/$gameId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/store/$gameId"!</div>
}
