const DEFAULT_POLYGON_STYLE = {
  fillColor: "#9333ea",
  fillOpacity: 0.35,
  strokeWeight: 2,
  strokeColor: "#9333ea",
  strokeOpacity: 0.8,
  clickable: false,
  editable: true,
  draggable: false,
  zIndex: 1,
}

const DEFAULT_DRAFT_STYLE = {
  strokeColor: "#9333ea",
  strokeOpacity: 0.9,
  strokeWeight: 2,
  clickable: false,
}

function latLngToCoord(latLng) {
  return {
    latitude: parseFloat(latLng.lat().toFixed(6)),
    longitude: parseFloat(latLng.lng().toFixed(6)),
  }
}

function coordsFromPath(path) {
  if (!path || typeof path.getLength !== "function") {
    return []
  }

  const coords = []
  const pathLength = path.getLength()

  for (let i = 0; i < pathLength; i++) {
    const latLng = path.getAt(i)

    if (i === pathLength - 1 && pathLength > 1) {
      const firstPoint = path.getAt(0)
      if (latLng.lat() === firstPoint.lat() && latLng.lng() === firstPoint.lng()) {
        break
      }
    }

    coords.push(latLngToCoord(latLng))
  }

  return coords
}

function coordsToLatLngs(google, coords) {
  return coords
    .map((coord) => {
      const lat = typeof coord === "object" ? (coord.latitude ?? coord.lat) : null
      const lng = typeof coord === "object" ? (coord.longitude ?? coord.lng) : null
      if (lat === null || lng === null) return null
      return new google.maps.LatLng(lat, lng)
    })
    .filter(Boolean)
}

function createVertexMarker(google, map, latLng, index) {
  return new google.maps.Marker({
    position: latLng,
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#9333ea",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
    zIndex: 1000,
    title: `Point ${index + 1}`,
  })
}

/**
 * Future-proof polygon drawing without deprecated DrawingManager.
 * Click map to add vertices, then finish when at least 3 points exist.
 */
export function createPolygonDrawController({
  google,
  map,
  polygonStyle = {},
  draftStyle = {},
  onCoordinatesChange = () => {},
  onDraftChange = () => {},
}) {
  const style = { ...DEFAULT_POLYGON_STYLE, ...polygonStyle }
  const draftLineStyle = { ...DEFAULT_DRAFT_STYLE, ...draftStyle }

  let isDrawing = false
  let draftPath = []
  let draftPolyline = null
  let polygon = null
  let markers = []
  let clickListener = null
  let pathListeners = []

  const clearPathListeners = () => {
    pathListeners.forEach((listener) => google.maps.event.removeListener(listener))
    pathListeners = []
  }

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null))
    markers = []
  }

  const syncMarkers = (path) => {
    if (!path || typeof path.getLength !== "function") return
    clearMarkers()
    for (let i = 0; i < path.getLength(); i++) {
      markers.push(createVertexMarker(google, map, path.getAt(i), i))
    }
  }

  const emitCoordinates = (path) => {
    onCoordinatesChange(coordsFromPath(path))
  }

  const attachPolygonEditListeners = (poly) => {
    clearPathListeners()
    const path = poly.getPath()
    if (!path) return

    const handleEdit = () => {
      emitCoordinates(path)
      syncMarkers(path)
    }

    pathListeners = [
      google.maps.event.addListener(path, "set_at", handleEdit),
      google.maps.event.addListener(path, "insert_at", handleEdit),
      google.maps.event.addListener(path, "remove_at", handleEdit),
    ]
  }

  const removePolygon = () => {
    if (polygon) {
      polygon.setMap(null)
      polygon = null
    }
    clearPathListeners()
  }

  const clearDraft = () => {
    draftPath = []
    onDraftChange(0)
    if (draftPolyline) {
      draftPolyline.setMap(null)
      draftPolyline = null
    }
  }

  const startDrawing = () => {
    if (isDrawing) return true

    isDrawing = true
    clearDraft()

    draftPolyline = new google.maps.Polyline({
      map,
      path: draftPath,
      ...draftLineStyle,
    })

    clickListener = map.addListener("click", (event) => {
      draftPath.push(event.latLng)
      draftPolyline.setPath(draftPath)
      onDraftChange(draftPath.length)
    })

    return true
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    isDrawing = false

    if (clickListener) {
      google.maps.event.removeListener(clickListener)
      clickListener = null
    }
  }

  const cancelDrawing = () => {
    stopDrawing()
    clearDraft()
  }

  const finishDrawing = () => {
    if (draftPath.length < 3) {
      return false
    }

    const completedPath = draftPath.map((latLng) => latLng)

    stopDrawing()
    clearDraft()
    removePolygon()
    clearMarkers()

    polygon = new google.maps.Polygon({
      paths: completedPath,
      map,
      ...style,
    })

    const path = polygon.getPath()
    if (!path) return false

    emitCoordinates(path)
    syncMarkers(path)
    attachPolygonEditListeners(polygon)
    return true
  }

  const setPolygonFromCoords = (coords, { fitBounds = true } = {}) => {
    if (!coords || coords.length < 3) return false

    cancelDrawing()
    removePolygon()
    clearMarkers()

    const path = coordsToLatLngs(google, coords)
    if (path.length < 3) return false

    polygon = new google.maps.Polygon({
      paths: path,
      map,
      ...style,
      strokeWeight: 3,
    })

    const polygonPath = polygon.getPath()
    if (!polygonPath) return false

    emitCoordinates(polygonPath)
    syncMarkers(polygonPath)
    attachPolygonEditListeners(polygon)

    if (fitBounds) {
      const bounds = new google.maps.LatLngBounds()
      path.forEach((latLng) => bounds.extend(latLng))
      map.fitBounds(bounds)
    }

    return true
  }

  const clear = () => {
    cancelDrawing()
    removePolygon()
    clearMarkers()
    onCoordinatesChange([])
  }

  const destroy = () => {
    cancelDrawing()
    removePolygon()
    clearMarkers()
  }

  return {
    startDrawing,
    stopDrawing,
    cancelDrawing,
    finishDrawing,
    setPolygonFromCoords,
    clear,
    destroy,
    getPolygon: () => polygon,
    isDrawing: () => isDrawing,
    getDraftPointCount: () => draftPath.length,
  }
}
