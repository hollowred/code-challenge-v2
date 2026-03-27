import React, { useEffect, useState } from "react"

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ filterVal, setFilterVal }) {
  // Filter by the permit issue year for each restaurant
  const startYear = 2026
  const years = [...Array(11).keys()].map((increment) => {
    return startYear - increment
  })
  const options = years.map((year) => {
    return (
      <option value={year} key={year}>
        {year}
      </option>
    )
  })

  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        value={filterVal}
        onChange={(e) => setFilterVal(e.target.value)}
      >
        {options}
      </select>
    </>
  )
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]

  const [currentYearData, setCurrentYearData] = useState([])
  const [year, setYear] = useState(2026)
  const [totalPermits, setTotalPermits] = useState(0)
  const [maxPermits, setMaxPermits] = useState(0)
  const [permitDataMap, setPermitDataMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const yearlyDataEndpoint = `/map-data/?year=${year}`

  useEffect(() => {
    setIsLoading(true)
    
    // Fetch data when year changes
    fetch(yearlyDataEndpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        // Store the fetched data
        setCurrentYearData(data)
        
        // Create a mapping of area_id to permit count for quick lookup
        const permitMap = {}
        let total = 0
        let max = 0
        
        data.forEach(area => {
          // Map area_id to permit count
          permitMap[area.area_id] = area.num_permits
          total += area.num_permits
          if (area.num_permits > max) {
            max = area.num_permits
          }
        })
        
        setPermitDataMap(permitMap)
        setTotalPermits(total)
        setMaxPermits(max)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error fetching permit data:", error)
        setIsLoading(false)
        // Optionally show error message to user
      })
  }, [year]) // Re-fetch when year changes

  function getColor(areaId) {
    // Get the permit count for this area
    const permitCount = permitDataMap[areaId] || 0
    
    // Calculate percentage of max permits
    const percentageOfMax = maxPermits > 0 ? permitCount / maxPermits : 0
    
    // Return color based on percentage
    if (percentageOfMax === 0) return communityAreaColors[0]
    if (percentageOfMax < 0.33) return communityAreaColors[1]
    if (percentageOfMax < 0.66) return communityAreaColors[2]
    return communityAreaColors[3]
  }

  function setAreaInteraction(feature, layer) {
    // Get area_id from the GeoJSON feature
    // Note: Your GeoJSON might have area_id in different location
    const areaId = feature.properties.area_id || feature.properties.AREA_ID || feature.properties.area_numbe
    
    // Get permit count for this area
    const permitCount = permitDataMap[areaId] || 0
    
    // 1) Shade each community area according to what percentage of 
    // permits were issued there in the selected year
    layer.setStyle({
      fillColor: getColor(areaId),
      fillOpacity: 0.7,
      weight: 1,
      color: "#333",
      opacity: 0.8
    })
    
    // 2) On hover, display a popup with the community area's raw 
    // permit count for the year
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        // Get area name from feature properties
        const areaName = feature.properties.name || feature.properties.COMMUNITY || feature.properties.area_name
        layer.bindPopup(`
          <div style="font-family: Arial, sans-serif;">
            <strong>${areaName}</strong><br>
            <hr style="margin: 5px 0;">
            <span>📊 Permits in ${year}: </span>
            <strong>${permitCount}</strong>
          </div>
        `)
        layer.openPopup()
      },
      mouseout: (e) => {
        e.target.closePopup()
      }
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      
      {/* Display summary statistics */}
      <div className="container mt-3 mb-3">
        <div className="row">
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title">📋 Restaurant Permits</h5>
                <p className="fs-4 mb-0">
                  {isLoading ? "Loading..." : totalPermits}
                </p>
                <small className="text-muted">Total permits issued in {year}</small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title">🏆 Maximum Permits</h5>
                <p className="fs-4 mb-0">
                  {isLoading ? "Loading..." : maxPermits}
                </p>
                <small className="text-muted">Most permits in a single area in {year}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map container */}
      <MapContainer
        id="restaurant-map"
        center={[41.88, -87.62]}
        zoom={10}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        {RAW_COMMUNITY_AREAS && !isLoading && (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={year} // Force re-render when year changes to update colors
          />
        )}
      </MapContainer>
      
      {/* Legend */}
      <div className="container mt-3">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Color Legend</h6>
            <div className="d-flex justify-content-between">
              <div className="d-flex align-items-center">
                <div style={{ width: "30px", height: "20px", backgroundColor: "#eff3ff", marginRight: "5px" }}></div>
                <span>Lowest (0%)</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: "30px", height: "20px", backgroundColor: "#bdd7e7", marginRight: "5px" }}></div>
                <span>Low (1-33%)</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: "30px", height: "20px", backgroundColor: "#6baed6", marginRight: "5px" }}></div>
                <span>Medium (34-66%)</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: "30px", height: "20px", backgroundColor: "#2171b5", marginRight: "5px" }}></div>
                <span>Highest (67-100%)</span>
              </div>
            </div>
            <small className="text-muted mt-2 d-block">
              Colors represent percentage of maximum permits in a single area
            </small>
          </div>
        </div>
      </div>
    </>
  )
}