import {Analytics} from '@/lib/analytics'

export function useAnalytics() {
  return Analytics.getInstance()
}
