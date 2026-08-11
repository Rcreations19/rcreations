import * as React from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

export interface CtaProps extends VariantProps<typeof buttonVariants> {
  ctaEnabled?: boolean
  text?: string
  link?: string
}

export function Cta({ cta }: { cta: CtaProps }) {
  if (!cta.ctaEnabled || !cta.text) return null

  return (
    <Button asChild variant={cta.variant} size={cta.size}>
      <Link href={cta.link || "#"}>{cta.text}</Link>
    </Button>
  )
}
