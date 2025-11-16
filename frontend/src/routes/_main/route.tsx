import { createFileRoute, Outlet } from '@tanstack/react-router';
import { FloatingMenu } from '@/components/FloatingMenu';

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
      <FloatingMenu />
    </>
  );
}
