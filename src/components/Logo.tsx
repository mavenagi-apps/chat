import imgMaven from '@/assets/logo/mavenagi_logo_wide_on_light.svg'
import Image from 'next/image'
import * as React from 'react'

export function Logo({
  className = 'h-8',
  width = 110,
  height = 32,
}: {
  className?: string
  width?: number
  height?: number
}) {
  return <Image alt="Maven AGI Logo" className={className} width={width} height={height} src={imgMaven} />
}
