import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="container-uco pb-10 pt-14 md:pt-20">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl">
        {title}
      </h1>
      {children && <div className="mt-5 max-w-2xl text-lg text-ink/70">{children}</div>}
    </section>
  )
}
