'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'

import { cn } from '@/lib/utils'

import { Cta, type CtaProps } from '@/components/ui/hero-10-utils/cta'
import dynamic from 'next/dynamic'

const ShaderBackground = dynamic(() => import('@/components/ui/shader-background'), { ssr: false })

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
    section: 'pt-4 pb-20 sm:pt-12 sm:pb-28',
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
              'relative shrink-0 overflow-hidden rounded-xl shadow-xl outline outline-black/10',
              cardAspect,
              slot.width,
              slot.layout,
            )}
          >
            <Image
              src={src}
              alt={imageAlts?.[i] ?? ''}
              width={600}
              height={800}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={i === 0}
              className="object-cover w-full h-full"
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
        'text-primary font-serif-heading font-normal tracking-tight text-balance leading-tight',
        'text-4xl sm:text-5xl md:text-7xl lg:text-[4.5rem]'
      )}
    >
      <span>{title}</span>
      {(titleLine2Prefix || titleHighlight) && (
        <>
          <br />
            <span>
              {titleLine2Prefix && <span>{titleLine2Prefix} </span>}
              {titleHighlight && (
                <span 
                  className="text-gold-accent mx-2 text-[1.3em] inline-block pt-2 drop-shadow-[0_1px_8px_rgba(250,195,76,0.35)] font-dancing font-semibold"
                >
                  {titleHighlight}
                </span>
              )}
            </span>
        </>
      )}
    </h1>
  )

  const descriptionElement = description && (
    <p className="text-primary/70 font-body font-normal text-base sm:text-lg md:text-xl leading-relaxed mt-4 max-w-xl text-balance">
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
    <div className="inline-flex items-center rounded-full px-5 py-2 mb-2 border border-primary/10 bg-white/80 shadow-sm">
      <span className="text-xs sm:text-sm font-bold text-accent tracking-wider uppercase">
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
      <ShaderBackground />
      <motion.div
        className={cn(
          'relative z-10 mx-auto flex max-w-7xl flex-col lg:flex-row items-center justify-between px-6 text-center lg:text-left gap-8 lg:gap-8',
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
