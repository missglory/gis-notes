import React, { useState, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PMTiles, Protocol } from "pmtiles";
import * as DECK from "deck.gl";
import { MapboxOverlay } from "@deck.gl/mapbox";

const AIR_PORTS =
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson";

const App: React.FC = () => {
  const [notes, setNotes] = useState<
    { id: number; lat: number; lng: number; text: string }[]
  >([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  let map: maplibregl.Map | null = null;
  const markers: { [key: number]: maplibregl.Marker } = {};

  const addNote = (e: maplibregl.MapMouseEvent) => {
    if (!map) return;
    const { lngLat } = e;
    const note = {
      id: Date.now(),
      lat: lngLat.lat,
      lng: lngLat.lng,
      text: `Note at ${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`,
    };
    // const marker = new maplibregl.Marker()
    //   .setLngLat([note.lng, note.lat])

    // const popup = new maplibregl.Popup({ offset: 25 })
    //   .setText(note.text)
    //   .setMaxWidth("300px")
    //   .addTo(map);

    // marker.setPopup(popup);
    // markers[note.id] = marker;
    // marker.addTo(map);

    setNotes((notes) => [...notes, note]);
  };

  useEffect(() => {
    // add the
    // if (map) {
    //   map.remove();
    // }
    // const protocol = new Protocol();
    // maplibregl.addProtocol("pmtiles", protocol.tile);

    // const PMTILES_URL =
    //   import.meta.env.VITE_PMTILES_URL ??
    //   "https://127.0.0.1:5000/download/central-fed-district-shortbread-1.0.pmtiles";
    // [0];
    // const p = new PMTiles(PMTILES_URL);

    // // this is so we share one instance across the JS code and the map renderer
    // protocol.add(p);

    // // we first fetch the header so we can get the center lon, lat of the map.
    // // p.getHeader().then((h) => {
    // const styleDocument = {
    //   version: 8,
    //   name: "Generic MapLibre Styling Document",
    //   sources: {
    //     boundaryline: {
    //       type: "vector",
    //       tiles: [`pmtiles://${PMTILES_URL}/{z}/{x}/{y}.mvt`],
    //     },
    //   },
    //   layers: [
    //     {
    //       id: "westminster_const",
    //       type: "line",
    //       source: "boundaryline",
    //       "source-layer": "westminster_const",
    //       layout: {},
    //       paint: {
    //         "line-color": "#ef2199",
    //       },
    //     },
    //   ],
    // };

    map = new maplibregl.Map({
      container: "map",
      // zoom: h.maxZoom - 2,
      zoom: 9,
      // center: [56.6, 36.6],
      center: [2.350482835553536, 48.84864178400558],
      // center: [h.centerLon, h.centerLat],
      // style: styleDocument
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // 20 + 1 random colors for all the districts of Paris and outside of the districts
    const limit = 100;
    // Sample data source = https://data.iledefrance.fr
    const parisSights = `https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/principaux-sites-touristiques-en-ile-de-france0/records?limit=${limit}`;

    let layerControl;

    const deckOverlay = new MapboxOverlay({
      // interleaved: true,
      layers: [
        new DECK.GeoJsonLayer({
          id: "airports",
          data: AIR_PORTS,
          // Styles
          filled: true,
          pointRadiusMinPixels: 2,
          pointRadiusScale: 2000,
          getPointRadius: (f) => 11 - f.properties.scalerank,
          getFillColor: [200, 0, 80, 180],
          // Interactive props
          pickable: true,
          autoHighlight: true,
          onClick: (info) =>
            // eslint-disable-next-line
            info.object &&
            alert(
              `${info.object.properties.name} (${info.object.properties.abbrev})`
            ),
          // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
        }),
        new DECK.ArcLayer({
          id: "arcs",
          data: AIR_PORTS,
          dataTransform: (d) =>
            d.features.filter((f) => f.properties.scalerank < 4),
          // Styles
          getSourcePosition: (f) => [-0.4531566, 51.4709959], // London
          getTargetPosition: (f) => f.geometry.coordinates,
          getSourceColor: [0, 128, 200],
          getTargetColor: [200, 0, 80],
          getWidth: 1,
        }),
      ],
    });

    map.addControl(deckOverlay);

    return () => {
      // if (map) {
      //   map.remove();
      // }
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Remove existing markers
    Object.values(markers).forEach((marker) => marker.remove());

    notes.forEach((note) => {
      const marker = new maplibregl.Marker()
        .setLngLat([note.lng, note.lat])
        .addTo(map);

      const popup = new maplibregl.Popup({ offset: 25 })
        .setText(note.text)
        .setMaxWidth("300px")
        .addTo(map);

      marker.setPopup(popup);
      markers[note.id] = marker;
    });
  }, [notes]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
      }}
    >
      <div id="map-container">
        <div id="map" />
        <button className="add-note-button" onClick={toggleMenu}>
          {isMenuOpen ? "Hide Notes" : "Show Notes"}
        </button>
      </div>
      <div className={`notes-menu ${isMenuOpen ? "" : "closed"}`}>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {note.text} - ({note.lat.toFixed(4)}, {note.lng.toFixed(4)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
