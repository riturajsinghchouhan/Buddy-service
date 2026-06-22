import { restaurantAPI } from "@food/api"

const OUTLET_TIMINGS_CACHE_TTL_MS = 5 * 60 * 1000

/** @type {Map<string, { ts: number, outletTimings: object | null }>} */
const timingsCache = new Map()
/** @type {Map<string, Promise<object | null>>} */
const timingsInFlight = new Map()

function readCached(id) {
  const key = String(id || "").trim()
  if (!key) return undefined

  const hit = timingsCache.get(key)
  if (!hit) return undefined
  if (Date.now() - hit.ts > OUTLET_TIMINGS_CACHE_TTL_MS) {
    timingsCache.delete(key)
    return undefined
  }
  return hit.outletTimings
}

function writeCached(id, outletTimings, aliasIds = []) {
  const entry = { ts: Date.now(), outletTimings }
  const keys = new Set(
    [id, ...aliasIds]
      .filter(Boolean)
      .map((value) => String(value).trim())
      .filter(Boolean),
  )
  keys.forEach((key) => {
    timingsCache.set(key, entry)
  })
}

function extractOutletTimings(response) {
  return (
    response?.data?.data?.outletTimings ||
    response?.data?.outletTimings ||
    null
  )
}

/**
 * Fetch outlet timings once per restaurant per session (deduped + TTL).
 */
export async function fetchOutletTimingsCached(
  restaurantId,
  { force = false, aliasIds = [] } = {},
) {
  const id = String(restaurantId || "").trim()
  if (!id) return null

  if (!force) {
    const cached = readCached(id)
    if (cached !== undefined) return cached
    if (timingsInFlight.has(id)) return timingsInFlight.get(id)
  }

  const request = (async () => {
    try {
      const response = await restaurantAPI.getOutletTimingsByRestaurantId(id)
      const outletTimings = extractOutletTimings(response)
      writeCached(id, outletTimings, aliasIds)
      return outletTimings
    } catch (error) {
      if (error?.response?.status === 404) {
        writeCached(id, null, aliasIds)
        return null
      }
      throw error
    } finally {
      timingsInFlight.delete(id)
    }
  })()

  timingsInFlight.set(id, request)
  return request
}

export function clearOutletTimingsCache() {
  timingsCache.clear()
  timingsInFlight.clear()
}
