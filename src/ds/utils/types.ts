import type { ComponentType, SVGProps } from 'react'

/** Any icon component (lucide-react or local SVG) that accepts a className. */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
