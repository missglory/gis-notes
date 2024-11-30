import React, { useEffect, useRef, useState } from "react";
import { PMTiles } from "pmtiles";
import maplibregl from "maplibre-gl";

const MapInitializer: React.FC = () => {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      fetch("path/to/your/file.pmtiles")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => new PMTiles(arrayBuffer))
        .then((pmtiles) => pmtiles.getHeader())
        .then((header) => {
          const mapInstance = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
              version: 8,
              sources: {
                "raster-tiles": {
                  type: "raster",
                  tiles: ["http://example.com/tiles/{z}/{x}/{y}.png"],
                  tileSize: 256,
                },
              },
              layers: [
                {
                  id: "simple-tiles",
                  type: "raster",
                  source: "raster-tiles",
                },
              ],
            },
            center: [header.center.lng, header.center.lat],
            zoom: header.zoom,
          });

          setMap(mapInstance);
        })
        .catch((error) => console.error("Error initializing map:", error));

      return () => {
        if (map) {
          map.remove();
        }
      };
    }
  }, []);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default MapInitializer;
