import { createFileRoute, Outlet } from '@tanstack/react-router'
import backgroundUrl from '/bg-auth.png';

export const Route = createFileRoute('/_main/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <img
        src={backgroundUrl}
        alt="Login background"
        className="absolute inset-0 h-full w-full object-cover brightness-100 -z-10"
      />
      <div className="z-10 w-full max-w-sm">
        <Outlet />
      </div>
    </div>)
}
