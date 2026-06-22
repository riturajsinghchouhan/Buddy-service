import { Loader } from "@googlemaps/js-api-loader"
import { getGoogleMapsApiKey } from "./googleMapsApiKey"

/** Drawing library removed in Maps JS 3.65 — use mapPolygonDraw instead. */
const REQUIRED_LIBRARIES = ["places", "geometry", "marker"]

let loadPromise = null

async function ensureMapLibraries() {
  if (!window.google?.maps?.importLibrary) return false

  try {
    await Promise.all(REQUIRED_LIBRARIES.map((lib) => window.google.maps.importLibrary(lib)))
    const maps = await window.google.maps.importLibrary("maps")
    return !!maps?.Map
  } catch {
    return false
  }
}

/**
 * Load Google Maps for Food zone/map pages (no deprecated drawing library).
 * @returns {Promise<typeof google | null>}
 */
export async function loadFoodGoogleMaps() {
  const apiKey = await getGoogleMapsApiKey()
  if (!apiKey) return null

  if (!loadPromise) {
    loadPromise = (async () => {
      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: REQUIRED_LIBRARIES,
      })

      await loader.load()

      const ready = await ensureMapLibraries()
      if (!ready) {
        throw new Error("Google Maps failed to load")
      }

      return window.google
    })().catch((error) => {
      loadPromise = null
      throw error
    })
  }

  try {
    return await loadPromise
  } catch {
    return null
  }
}

export async function getMapsLibrary() {
  if (!window.google?.maps?.importLibrary) return null
  try {
    return await window.google.maps.importLibrary("maps")
  } catch {
    return null
  }
}

export async function getPlacesLibrary() {
  if (!window.google?.maps?.importLibrary) return null
  try {
    return await window.google.maps.importLibrary("places")
  } catch {
    return null
  }
}
