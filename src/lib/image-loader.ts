import {type ImageLoaderProps} from 'next/image'
import {z} from 'zod'

const getOrigin = () => {
  if (typeof window === 'undefined') {
    const {headers} = require('next/headers')
    const {'x-forwarded-proto': proto, 'x-forwarded-host': host} = z
      .object({
        'x-forwarded-proto': z.enum(['http', 'https']),
        'x-forwarded-host': z.string(),
      })
      .parse(Object.fromEntries(headers().entries()))
    return `${proto}://${host}`
  } else {
    return window.location.origin
  }
}

export default function cloudflareLoader({src, width, quality}: ImageLoaderProps) {
  const image = new URL(src, getOrigin())
  return `${
    process.env.NEXT_PUBLIC_CF_ACCESS_PROXY_URL !== undefined &&
    process.env.NEXT_PUBLIC_CF_ACCESS_CLIENT_ID !== undefined &&
    process.env.NEXT_PUBLIC_CF_ACCESS_CLIENT_SECRET !== undefined
      ? `${process.env.NEXT_PUBLIC_CF_ACCESS_PROXY_URL}/${process.env.NEXT_PUBLIC_CF_ACCESS_CLIENT_ID}/${process.env.NEXT_PUBLIC_CF_ACCESS_CLIENT_SECRET}/https%3A%2F%2F`
      : 'https://'
  }www.mavenagi-static.com/image/?${new URLSearchParams({
    image: image.toString(),
    width: width.toString(),
    ...(quality ? {quality: quality.toString()} : {}),
  }).toString()}`
}
