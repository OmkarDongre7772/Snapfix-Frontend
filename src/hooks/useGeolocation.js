import { useState, useCallback } from "react";

/**
 * useGeolocation — wraps browser Geolocation API.
 * Returns { lat, lng, loading, error, fetch }
 * Call fetch() to trigger a position lookup. fetch() resolves to { lat, lng }.
 */
export function useGeolocation() {
  const [state, setState] = useState({ lat: null, lng: null, loading: false, error: null });

  const fetch = useCallback(() => {
    if (!navigator.geolocation) {
      const error = "Geolocation is not supported by your browser.";
      setState((s) => ({ ...s, error }));
      return Promise.reject(new Error(error));
    }
    setState((s) => ({ ...s, loading: true, error: null }));

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setState({ ...next, loading: false, error: null });
          resolve(next);
        },
        (err) => {
          const msg =
            err.code === 1 ? "Location access denied. Please enable it in your browser settings." :
            err.code === 2 ? "Could not determine your location. Please try again." :
            "Location request timed out. Please try again.";
          setState({ lat: null, lng: null, loading: false, error: msg });
          reject(new Error(msg));
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { ...state, fetch };
}
