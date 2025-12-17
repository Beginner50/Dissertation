import Header from '@/components/header.component'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Header showNavlinks={false} />
      <Outlet />
    </div>
  )
}
