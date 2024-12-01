import React, { useState, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PMTiles, Protocol } from "pmtiles";

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
    if (map) { map.remove();}
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const PMTILES_URL = process.env.REACT_APP_PMTILES_URL || "https://pmtiles.io/protomaps(vector)ODbL_firenze.pmtiles";
    [0];
    const p = new PMTiles(PMTILES_URL);

    // this is so we share one instance across the JS code and the map renderer
    protocol.add(p);

    // we first fetch the header so we can get the center lon, lat of the map.
    p.getHeader().then((h) => {
      map = new maplibregl.Map({
        container: "map",
        zoom: h.maxZoom - 2,
        center: [h.centerLon, h.centerLat],
        style: {
          version: 8,
          sources: {
            example_source: {
              type: "vector",
              url: `pmtiles://${PMTILES_URL}`,
              attribution:
                '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
            },
          },
          layers: [
            {
              id: "buildings",
              source: "example_source",
              "source-layer": "landuse",
              type: "fill",
              paint: {
                "fill-color": "steelblue",
              },
            },
            {
              id: "roads",
              source: "example_source",
              "source-layer": "roads",
              type: "line",
              paint: {
                "line-color": "black",
              },
            },
            {
              id: "mask",
              source: "example_source",
              "source-layer": "mask",
              type: "fill",
              paint: {
                "fill-color": "white",
              },
            },
          ],
        },
      });

      // map = new maplibregl.Map({
      //   container: 'map',
      //   style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
      //   center: [55.757967, 37.567249], // starting position [lng, lat]
      //   zoom: 9 // starting zoom
      // });

      map.on("click", addNote);

    });

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
