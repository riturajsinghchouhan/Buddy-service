import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { MapPin, ArrowLeft, Save, X, Shapes } from "lucide-react"
import { adminAPI } from "@food/api"
import { getGoogleMapsApiKey } from "@food/utils/googleMapsApiKey"
import { loadFoodGoogleMaps, getMapsLibrary, getPlacesLibrary } from "@food/utils/googleMapsLoader"
import { createPolygonDrawController } from "@food/utils/mapPolygonDraw"
const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}


export default function AddZone() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id && !window.location.pathname.includes('/view/')
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const polygonDrawControllerRef = useRef(null)
  const polygonRef = useRef(null)
  
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("")
  const [mapLoading, setMapLoading] = useState(true)
  const [drawingToolsReady, setDrawingToolsReady] = useState(false)
  const [mapError, setMapError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    country: "India",
    zoneName: "",
    unit: "kilometer",
  })
  
  const [coordinates, setCoordinates] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [draftPointCount, setDraftPointCount] = useState(0)
  const [existingZones, setExistingZones] = useState([])
  const placeSearchContainerRef = useRef(null)
  const mapInitSessionRef = useRef(0)
  const existingZonesPolygonsRef = useRef([])

  const destroyMapArtifacts = () => {
    polygonDrawControllerRef.current?.destroy()
    polygonDrawControllerRef.current = null
    polygonRef.current = null
    existingZonesPolygonsRef.current.forEach((polygon) => polygon?.setMap(null))
    existingZonesPolygonsRef.current = []
    mapInstanceRef.current = null
    setDrawingToolsReady(false)
    setIsDrawing(false)
    setDraftPointCount(0)
    if (mapRef.current) {
      mapRef.current.replaceChildren()
    }
    if (placeSearchContainerRef.current) {
      placeSearchContainerRef.current.replaceChildren()
      placeSearchContainerRef.current.removeAttribute("data-place-search-ready")
    }
  }

  useEffect(() => {
    fetchExistingZones()
    if (isEditMode && id) {
      fetchZone()
    }
  }, [id, isEditMode])

  useEffect(() => {
    const session = ++mapInitSessionRef.current
    let cancelled = false

    const start = async () => {
      await loadGoogleMaps(() => cancelled || session !== mapInitSessionRef.current)
    }

    start()

    return () => {
      cancelled = true
      destroyMapArtifacts()
    }
  }, [id, isEditMode])

  // Center map on India when country is selected
  useEffect(() => {
    if (formData.country === "India" && mapInstanceRef.current) {
      const indiaCenter = { lat: 20.5937, lng: 78.9629 }
      mapInstanceRef.current.setCenter(indiaCenter)
      mapInstanceRef.current.setZoom(5)
    }
  }, [formData.country])

  // Initialize Places search when map is loaded
  useEffect(() => {
    if (mapLoading || !mapInstanceRef.current || !placeSearchContainerRef.current) return

    let cancelled = false

    const initPlaceSearch = async () => {
      const placesLib = await getPlacesLibrary()
      const container = placeSearchContainerRef.current
      if (cancelled || !placesLib?.PlaceAutocompleteElement || !container) return
      if (container.getAttribute("data-place-search-ready") === "true") return

      container.replaceChildren()

      const placeAutocomplete = new placesLib.PlaceAutocompleteElement({
        includedRegionCodes: ["in"],
        placeholder: "Search location on map...",
      })

      placeAutocomplete.style.width = "100%"
      placeAutocomplete.style.backgroundColor = "#ffffff"
      placeAutocomplete.style.border = "1px solid #cbd5e1"
      placeAutocomplete.style.borderRadius = "0.5rem"
      placeAutocomplete.style.colorScheme = "light"

      placeAutocomplete.addEventListener("gmp-select", async (event) => {
        const map = mapInstanceRef.current
        if (!map || !event?.placePrediction) return

        try {
          const place = event.placePrediction.toPlace()
          await place.fetchFields({
            fields: ["location", "formattedAddress", "displayName", "viewport"],
          })

          if (place.viewport) {
            map.fitBounds(place.viewport)
          } else if (place.location) {
            map.setCenter(place.location)
            map.setZoom(15)
          }
        } catch (error) {
          debugError("Place search selection error:", error)
        }
      })

      container.appendChild(placeAutocomplete)
      container.setAttribute("data-place-search-ready", "true")
    }

    initPlaceSearch()

    return () => {
      cancelled = true
      if (placeSearchContainerRef.current) {
        placeSearchContainerRef.current.replaceChildren()
        placeSearchContainerRef.current.removeAttribute("data-place-search-ready")
      }
    }
  }, [mapLoading])

  // Draw existing polygon when in edit mode and coordinates are loaded
  useEffect(() => {
    if (isEditMode && coordinates.length >= 3 && polygonDrawControllerRef.current && !mapLoading) {
      setTimeout(() => {
        const controller = polygonDrawControllerRef.current
        if (!controller) return
        controller.cancelDrawing()
        setIsDrawing(false)
        controller.setPolygonFromCoords(coordinates)
        polygonRef.current = controller.getPolygon()
      }, 300)
    }
  }, [isEditMode, coordinates.length, mapLoading])


  const fetchExistingZones = async () => {
    try {
      const response = await adminAPI.getZones({ limit: 1000 })
      if (response.data?.success && response.data.data?.zones) {
        // Filter out the current zone if in edit mode
        const zones = isEditMode && id 
          ? response.data.data.zones.filter(zone => zone._id !== id)
          : response.data.data.zones
        setExistingZones(zones)
      }
    } catch (error) {
      debugError("Error fetching existing zones:", error)
      setExistingZones([])
    }
  }

  const fetchZone = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getZoneById(id)
      if (response.data?.success && response.data.data?.zone) {
        const zoneData = response.data.data.zone
        setFormData({
          country: zoneData.country || "India",
          zoneName: zoneData.name || zoneData.zoneName || "",
          unit: zoneData.unit || "kilometer",
        })
        
        if (zoneData.coordinates && zoneData.coordinates.length > 0) {
          setCoordinates(zoneData.coordinates)
        }
      }
    } catch (error) {
      debugError("Error fetching zone:", error)
      alert("Failed to load zone")
      navigate("/admin/food/zone-setup")
    } finally {
      setLoading(false)
    }
  }

  const loadGoogleMaps = async (isCancelled = () => false) => {
    try {
      setMapError("")
      setDrawingToolsReady(false)

      const apiKey = await getGoogleMapsApiKey()
      if (isCancelled()) return

      setGoogleMapsApiKey(apiKey || "")

      if (!apiKey) {
        setMapError("Google Maps API key not found. Set VITE_GOOGLE_MAPS_API_KEY in Frontend/.env")
        setMapLoading(false)
        return
      }

      for (let i = 0; i < 50 && !mapRef.current; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        if (isCancelled()) return
      }

      if (!mapRef.current) {
        setMapError("Map container failed to initialize. Please refresh the page.")
        setMapLoading(false)
        return
      }

      const google = await loadFoodGoogleMaps()
      if (isCancelled()) return

      if (!google?.maps) {
        setMapError("Failed to load Google Maps. Check your API key and enabled APIs.")
        setMapLoading(false)
        return
      }

      await initializeMap(google, isCancelled)
    } catch (error) {
      if (isCancelled()) return
      debugError("Error loading Google Maps:", error)
      setMapError(error?.message || "Failed to load Google Maps. Please refresh and try again.")
      setMapLoading(false)
      setDrawingToolsReady(false)
    }
  }

  const initializeMap = async (google, isCancelled = () => false) => {
    try {
      if (isCancelled() || !mapRef.current) {
        setMapLoading(false)
        return
      }

      if (mapInstanceRef.current) {
        setDrawingToolsReady(true)
        setMapLoading(false)
        return
      }

      const mapsLib = await getMapsLibrary()

      if (isCancelled() || !mapsLib?.Map) {
        setMapError("Google Maps failed to initialize.")
        setMapLoading(false)
        setDrawingToolsReady(false)
        return
      }

      const Map = mapsLib.Map
      const initialLocation = { lat: 20.5937, lng: 78.9629 }

      const map = new Map(mapRef.current, {
        center: initialLocation,
        zoom: 5,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE],
        },
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        scrollwheel: true,
        gestureHandling: "greedy",
        disableDoubleClickZoom: false,
      })

      mapInstanceRef.current = map

      polygonDrawControllerRef.current = createPolygonDrawController({
        google,
        map,
        onCoordinatesChange: (coords) => {
          setCoordinates(coords)
          polygonRef.current = polygonDrawControllerRef.current?.getPolygon() || null
        },
        onDraftChange: setDraftPointCount,
      })

      setDrawingToolsReady(true)
      setMapLoading(false)

      if (isEditMode && coordinates.length >= 3) {
        polygonDrawControllerRef.current.setPolygonFromCoords(coordinates)
        polygonRef.current = polygonDrawControllerRef.current.getPolygon()
      }
    } catch (error) {
      if (isCancelled()) return
      debugError("Error initializing map:", error)
      setMapError(error?.message || "Failed to initialize the map. Please refresh and try again.")
      setMapLoading(false)
      setDrawingToolsReady(false)
    }
  }

  // Draw existing zones on the map
  const drawExistingZonesOnMap = (google, map) => {
    if (!existingZones || existingZones.length === 0) return

    // Clear previous existing zone polygons
    existingZonesPolygonsRef.current.forEach(polygon => {
      if (polygon) polygon.setMap(null)
    })
    existingZonesPolygonsRef.current = []

    existingZones.forEach((zone, index) => {
      if (!zone.coordinates || zone.coordinates.length < 3) return

      // Convert coordinates to LatLng array
      const path = zone.coordinates.map(coord => {
        const lat = typeof coord === 'object' ? (coord.latitude || coord.lat) : null
        const lng = typeof coord === 'object' ? (coord.longitude || coord.lng) : null
        if (lat === null || lng === null) return null
        return new google.maps.LatLng(lat, lng)
      }).filter(Boolean)

      if (path.length < 3) return

      // Create polygon for existing zone with different color (gray/blue)
      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: "#3b82f6", // Blue color for existing zones
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.15, // Lighter opacity so new zone stands out
        editable: false, // Not editable
        draggable: false,
        clickable: true,
        zIndex: 0 // Lower z-index so new zone appears on top
      })

      polygon.setMap(map)
      existingZonesPolygonsRef.current.push(polygon)

      // Add info window on click
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>${zone.name || zone.zoneName || 'Unnamed Zone'}</strong><br/>
            <small>Country: ${zone.country || 'N/A'}</small>
          </div>
        `
      })

      polygon.addListener('click', () => {
        infoWindow.setPosition(polygon.getPath().getAt(0))
        infoWindow.open(map)
      })
    })
  }

  // Redraw existing zones when zones data changes or map is ready
  useEffect(() => {
    if (!mapLoading && mapInstanceRef.current && existingZones.length > 0 && window.google) {
      drawExistingZonesOnMap(window.google, mapInstanceRef.current)
    }
  }, [existingZones, mapLoading])

  const startDrawing = () => {
    const controller = polygonDrawControllerRef.current
    if (!controller) return
    controller.startDrawing()
    setIsDrawing(true)
  }

  const finishDrawing = () => {
    const controller = polygonDrawControllerRef.current
    if (!controller) return

    if (controller.getDraftPointCount() < 3) {
      alert("Add at least 3 points on the map to finish the zone.")
      return
    }

    controller.finishDrawing()
    polygonRef.current = controller.getPolygon()
    setIsDrawing(false)
    setDraftPointCount(0)
  }

  const cancelDrawing = () => {
    polygonDrawControllerRef.current?.cancelDrawing()
    setIsDrawing(false)
    setDraftPointCount(0)
  }

  const clearDrawing = () => {
    polygonDrawControllerRef.current?.clear()
    polygonRef.current = null
    setIsDrawing(false)
    setDraftPointCount(0)
    setCoordinates([])
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.zoneName) {
      alert("Please enter a zone name")
      return
    }

    if (!formData.country) {
      alert("Please select a country")
      return
    }

    if (coordinates.length < 3) {
      alert("Please draw at least 3 points on the map to create a zone")
      return
    }

    try {
      setLoading(true)
      
      // Validate coordinates format
      if (!coordinates || coordinates.length < 3) {
        alert("Please draw at least 3 points on the map")
        setLoading(false)
        return
      }

      // Ensure coordinates have correct format
      const validCoordinates = coordinates.map(coord => {
        if (typeof coord === 'object' && coord.latitude !== undefined && coord.longitude !== undefined) {
          return {
            latitude: parseFloat(coord.latitude),
            longitude: parseFloat(coord.longitude)
          }
        }
        return coord
      })

      const zoneData = {
        name: formData.zoneName,
        zoneName: formData.zoneName,
        country: formData.country,
        unit: formData.unit || "kilometer",
        coordinates: validCoordinates,
        isActive: true
      }

      debugLog("Sending zone data:", zoneData)

      if (isEditMode && id) {
        // Update existing zone
        const response = await adminAPI.updateZone(id, zoneData)
        debugLog("Zone updated successfully:", response)
        alert("Zone updated successfully!")
      } else {
        // Create new zone
        const response = await adminAPI.createZone(zoneData)
        debugLog("Zone created successfully:", response)
        alert("Zone created successfully!")
      }
      navigate("/admin/food/zone-setup")
    } catch (error) {
      debugError("Error creating zone:", error)
      
      // Handle different types of errors
      let errorMessage = "Failed to create zone. Please try again."
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        // Network error - backend not running or CORS issue
        errorMessage = "Cannot connect to server. Please make sure the backend server is running."
        debugError("Network error: Backend server might not be running")
      } else if (error.response) {
        // API error with response
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      error.message || 
                      `Server error: ${error.response.status}`
        debugError("API error:", error.response.data)
        debugError("Error status:", error.response.status)
      } else {
        // Other errors
        errorMessage = error.message || errorMessage
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/food/zone-setup")}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEditMode ? "Edit Zone" : "Add New Zone"}
              </h1>
              <p className="text-sm text-slate-600">
                {isEditMode ? "Update delivery zone for customer" : "Create a delivery zone for customer"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Zone Details</h2>
                
                <div className="space-y-4">
                  {/* Country Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  {/* Zone Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Create Zone name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zoneName}
                      onChange={(e) => handleInputChange("zoneName", e.target.value)}
                      placeholder="Enter zone name"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Select Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => handleInputChange("unit", e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="kilometer">Kilometers (km)</option>
                      <option value="miles">Miles (mi)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Draw Zone on Map</h2>
                <div className="flex items-center gap-2">
                  {!isDrawing ? (
                    <button
                      type="button"
                      onClick={startDrawing}
                      disabled={mapLoading || !drawingToolsReady}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Shapes className="w-4 h-4" />
                      <span>{mapLoading ? "Loading Map..." : "Start Drawing"}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={finishDrawing}
                        disabled={draftPointCount < 3}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
                      >
                        <Shapes className="w-4 h-4" />
                        <span>Finish Zone</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelDrawing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-slate-500 text-white hover:bg-slate-600"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  {coordinates.length > 0 && (
                    <button
                      type="button"
                      onClick={clearDrawing}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div ref={placeSearchContainerRef} className="w-full" />
                {mapError && (
                  <p className="text-xs text-red-600 mt-2">{mapError}</p>
                )}
                {isDrawing && (
                  <p className="text-xs text-blue-700 mt-2">
                    Click on the map to add boundary points.
                    {draftPointCount > 0 && (
                      <span> Points placed: <strong>{draftPointCount}</strong></span>
                    )}
                    {draftPointCount > 0 && draftPointCount < 3 && (
                      <span className="text-red-600 ml-1">(minimum 3 required)</span>
                    )}
                  </p>
                )}
                {coordinates.length > 0 && (
                  <p className="text-xs text-slate-600 mt-2">
                    Points drawn: <strong>{coordinates.length}</strong>
                    {coordinates.length < 3 && (
                      <span className="text-red-600 ml-2">(Minimum 3 points required)</span>
                    )}
                  </p>
                )}
              </div>

              <div className="relative" style={{ height: "600px" }}>
                <div ref={mapRef} className="w-full h-full rounded-lg" />
                
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading map...</p>
                    </div>
                  </div>
                )}

                {!googleMapsApiKey && !mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                    <div className="text-center p-6">
                      <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-sm text-slate-600">Google Maps API key not found</p>
                      <p className="text-xs text-slate-500 mt-2">Set VITE_GOOGLE_MAPS_API_KEY in Frontend/.env</p>
                    </div>
                  </div>
                )}

                {mapError && !mapLoading && googleMapsApiKey && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                    <div className="text-center p-6 max-w-sm">
                      <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-sm text-red-600">{mapError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/food/zone-setup")}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || coordinates.length < 3 || !formData.zoneName || !formData.country}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Zone</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



