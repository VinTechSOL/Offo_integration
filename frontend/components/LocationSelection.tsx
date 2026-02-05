/// <reference types="vite/client" />

import { useEffect, useRef } from "react";

declare global {
  interface ImportMetaEnv {
    VITE_GOOGLE_MAPS_API_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    google: any;
  }
}

export default function LocationSelection() {
  const mapRef = useRef<HTMLDivElement>(null);

  // ✅ define initMap first
  const initMap = () => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 12.9716, lng: 77.5946 }, // Bangalore
      zoom: 15,
    });

    const input = document.getElementById("autocomplete") as HTMLInputElement;
    const autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      map.setCenter(place.geometry.location);
      new window.google.maps.Marker({
        position: place.geometry.location,
        map,
      });
    });
  };

  // ✅ then load the script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key missing");
      return;
    }

    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Select Your Location</h2>
      <input
        id="autocomplete"
        type="text"
        placeholder="Search your office or location"
        className="border p-2 w-full rounded"
      />
      <div
        ref={mapRef}
        className="w-full h-[400px] mt-4 rounded-lg border border-gray-300"
      ></div>
    </div>
  );
}
