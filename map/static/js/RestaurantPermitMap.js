import React, { useEffect, useState } from "react"

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ setFilterVal }) {
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

  const yearlyDataEndpoint = `/map-data/?year=${year}`

  useEffect(() => {
    fetch()
      .then((res) => res.json())
      .then((data) => {
        /**
         * TODO: Fetch the data needed to supply to map with data
         */
      })
  }, [yearlyDataEndpoint])


  function getColor(percentageOfPermits) {
    /**
     * TODO: Use this function in setAreaInteraction to set a community 
     * area's color using the communityAreaColors constant above
     */
  }

  function setAreaInteraction(feature, layer) {
    /**
     * TODO: Use the methods below to:
     * 1) Shade each community area according to what percentage of 
     * permits were issued there in the selected year
     * 2) On hover, display a popup with the community area's raw 
     * permit count for the year
     */
    layer.setStyle()
    layer.on("", () => {
      layer.bindPopup("")
      layer.openPopup()
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: {/* TODO: display this value */}
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area:
        {/* TODO: display this value */}
      </p>
      <MapContainer
        id="restaurant-map"
        center={[41.88, -87.62]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={maxNumPermits}
          />
        ) : null}
      </MapContainer>
    </>
  )
}
