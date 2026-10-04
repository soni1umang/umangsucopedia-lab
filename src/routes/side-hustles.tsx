import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/side-hustles')({
  loader: () => {
    throw redirect({ to: '/workbench' })
  },
  component: () => null,
})
