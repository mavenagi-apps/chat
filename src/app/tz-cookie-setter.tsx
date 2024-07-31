'use client'

import {useEffect} from 'react'

export const TzCookieSetter = () => {
  useEffect(() => {
    document.cookie = 'tz=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '; path=/; Secure; SameSite=None'
  })
  return <></>
}
