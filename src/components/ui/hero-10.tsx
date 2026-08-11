'use client'

import * as React from 'react'
import { motion, type Variants } from 'framer-motion'

import { cn } from '@/lib/utils'

import { Cta, type CtaProps } from '@/components/ui/hero-10-utils/cta'

export interface Hero10Props {
  title: string
  titleLine2Prefix?: string
  titleHighlight?: string
  description: string
  socialProof?: string
  images: string[]
  imageAlts?: string[]
  animation?: 'none' | 'subtle'
  primaryCTA: CtaProps
  secondaryCTA?: CtaProps
  variant?: 'standard' | 'compact'
}

const variantStyles = {
  standard: {
    section: 'py-20 sm:py-28',
    title: 'text-3xl sm:text-4xl md:text-5xl',
    description: 'max-w-lg text-sm sm:text-base',
    header: 'gap-5',
    content: 'gap-8 sm:gap-10',
    fan: 'max-w-3xl',
    fanCard: 'aspect-4/5',
  },
  compact: {
    section: 'py-14 sm:py-20',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    description: 'max-w-md text-sm',
    header: 'gap-4',
    content: 'gap-6 sm:gap-8',
    fan: 'max-w-2xl',
    fanCard: 'aspect-4/5',
  },
} as const

const fanSlots = [
  { width: 'w-[50%]', layout: '-mr-16 z-10', rotate: -6, x: 48, ty: 24 },
  { width: 'w-[55%]', layout: 'z-20', rotate: 0, x: 0, ty: -8 },
  { width: 'w-[50%]', layout: '-ml-16 z-10', rotate: 6, x: -48, ty: 24 },
]

const fanContainer: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.4,
      delayChildren: 0.5,
      staggerChildren: 0.1,
    },
  },
}

const fanCard: Variants = {
  hidden: (slot: (typeof fanSlots)[number]) => ({
    x: slot.x,
    rotate: slot.rotate,
    y: slot.ty,
  }),
  visible: (slot: (typeof fanSlots)[number]) => ({
    x: 0,
    rotate: slot.rotate,
    y: slot.ty,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function Reveal({
  active,
  variants,
  className,
  children,
}: Readonly<{
  active: boolean
  variants?: Variants
  className?: string
  children: React.ReactNode
}>) {
  return (
    <motion.div variants={active ? (variants ?? item) : undefined} className={className}>
      {children}
    </motion.div>
  )
}

function ImageFan({
  images,
  imageAlts,
  cardAspect,
  animate,
}: Readonly<{
  images: string[]
  imageAlts?: string[]
  cardAspect: string
  animate: boolean
}>) {
  return (
    <motion.div
      className="relative flex w-full items-center justify-center"
      variants={fanContainer}
      initial={animate ? 'hidden' : false}
      animate={animate ? 'visible' : 'visible'}
      viewport={{ once: true, margin: '-80px' }}
    >
      {images.slice(0, 3).map((src, i) => {
        const slot = fanSlots[i] ?? fanSlots[1]
        return (
          <motion.div
            key={src}
            custom={slot}
            variants={fanCard}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-xl shadow-xl outline outline-black/10 dark:outline-white/10',
              cardAspect,
              slot.width,
              slot.layout,
            )}
          >
            <img
              src={src}
              alt={imageAlts?.[i] ?? ''}
              decoding="async"
              className="size-full object-cover"
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function Hero10({
  title,
  titleLine2Prefix,
  titleHighlight,
  description,
  socialProof,
  images,
  imageAlts,
  animation = 'none',
  primaryCTA,
  secondaryCTA,
  variant = 'standard',
}: Readonly<Hero10Props>) {
  const animate = animation === 'subtle'
  const vs = variantStyles[variant]

  const titleElement = title && (
    <h1
      className={cn(
        'text-[#0a0e27] font-[family-name:--font-script] font-normal tracking-wide text-balance leading-relaxed',
        'text-5xl sm:text-6xl md:text-7xl'
      )}
    >
      <span>{title}</span>
      {(titleLine2Prefix || titleHighlight) && (
        <>
          <br />
          <span>
            {titleLine2Prefix && <span>{titleLine2Prefix} </span>}
            {titleHighlight && (
              <span className="text-[#2aabb0] mx-2 text-[1.2em] inline-block pt-4" style={{ fontFamily: "'White Star', cursive" }}>{titleHighlight}</span>
            )}
          </span>
        </>
      )}
    </h1>
  )

  const descriptionElement = description && (
    <p className="text-[#0a0e27]/80 font-[family-name:--font-script] font-normal text-2xl sm:text-3xl leading-relaxed mt-2 max-w-2xl text-balance">
      <span>{description}</span>
    </p>
  )

  const ctasElement = (primaryCTA?.ctaEnabled || secondaryCTA?.ctaEnabled) && (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-3 mt-4">
      {primaryCTA?.ctaEnabled && <Cta cta={primaryCTA} />}
      {secondaryCTA?.ctaEnabled && (
        <Cta
          cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? 'outline' }}
        />
      )}
    </div>
  )

  const socialProofElement = socialProof && (
    <div className="inline-flex items-center rounded-full px-5 py-2 mb-2 border border-[#0a0e27]/10 bg-white/50 backdrop-blur-md shadow-sm">
      <span className="text-xs sm:text-sm font-bold text-[#2aabb0] tracking-wider uppercase">
        {socialProof}
      </span>
    </div>
  )

  const mediaElement = images?.length ? (
    <ImageFan
      images={images}
      imageAlts={imageAlts}
      cardAspect={vs.fanCard}
      animate={animate}
    />
  ) : null

  return (
    <section
      className="bg-transparent relative isolate w-full overflow-hidden"
      style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
    >
      <motion.div
        className={cn(
          'relative z-10 mx-auto flex max-w-7xl flex-col lg:flex-row items-center justify-between px-6 text-center lg:text-left gap-16 lg:gap-8',
          vs.section,
        )}
        variants={animate ? container : undefined}
        initial={animate ? 'hidden' : false}
        animate={animate ? 'visible' : undefined}
        viewport={{ once: true, margin: '-80px' }}
      >
        {/* Left Column */}
        <div className="flex flex-col items-center lg:items-start w-full lg:w-[55%] xl:w-1/2">
          <Reveal active={animate} className="flex flex-col items-center lg:items-start mb-6">
            {socialProofElement}
          </Reveal>

          <Reveal
            active={animate}
            className={cn(
              'flex w-full flex-col items-center lg:items-start',
              vs.header,
            )}
          >
            {titleElement}
            {descriptionElement}
          </Reveal>

          <Reveal active={animate} className="flex flex-col items-center lg:items-start mt-6">
            {ctasElement}
          </Reveal>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[45%] xl:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 lg:translate-x-8 xl:translate-x-12">
          <div className={cn('w-full', vs.fan)}>{mediaElement}</div>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero10;
