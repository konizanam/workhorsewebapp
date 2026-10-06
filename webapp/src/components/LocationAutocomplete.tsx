import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

type LocationAutocompleteProps = {
  id: string;
  name: string;
  initialAddress: string;
  initialLatitude?: string;
  initialLongitude?: string;
  initialPlaceId?: string;
};

type SelectedLocation = {
  latitude: string;
  longitude: string;
  placeId: string;
};

let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | undefined;

function loadPlacesLibrary() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return Promise.reject(new Error("Google Places API key is not configured."));

  if (!placesLibraryPromise) {
    setOptions({ key: apiKey, v: "weekly", language: "en", region: "NA" });
    placesLibraryPromise = importLibrary("places");
  }

  return placesLibraryPromise;
}

function LocationAutocomplete({
  id,
  name,
  initialAddress,
  initialLatitude = "",
  initialLongitude = "",
  initialPlaceId = "",
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    placeId: initialPlaceId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestId = useRef(0);
  const apiKeyConfigured = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim());

  useEffect(() => {
    if (!apiKeyConfigured || query.trim().length < 3 || (selectedLocation.latitude && selectedLocation.longitude)) return;

    const activeRequestId = ++requestId.current;
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      void loadPlacesLibrary()
        .then(async (places) => {
          sessionToken.current ??= new places.AutocompleteSessionToken();
          return places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query.trim(),
            includedRegionCodes: ["na"],
            language: "en",
            sessionToken: sessionToken.current,
          });
        })
        .then(({ suggestions: results }) => {
          if (activeRequestId !== requestId.current) return;
          setSuggestions(results.filter((suggestion) => suggestion.placePrediction !== null));
          setError("");
        })
        .catch(() => {
          if (activeRequestId === requestId.current) {
            setSuggestions([]);
            setError("Google Places could not load. Check the API key and Places API settings.");
          }
        })
        .finally(() => {
          if (activeRequestId === requestId.current) setIsLoading(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      requestId.current += 1;
    };
  }, [apiKeyConfigured, query, selectedLocation.latitude, selectedLocation.longitude]);

  const selectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;

    setIsLoading(true);
    setError("");
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["formattedAddress", "location", "id"] });
      const location = place.location;
      if (!location) {
        setError("Google did not return coordinates for this place. Choose another result.");
        return;
      }

      setQuery(place.formattedAddress ?? prediction.text.toString());
      setSelectedLocation({
        latitude: String(location.lat()),
        longitude: String(location.lng()),
        placeId: place.id ?? "",
      });
      setSuggestions([]);
      sessionToken.current = null;
    } catch {
      setError("Could not retrieve this place. Please choose another result.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="location-autocomplete">
      <input
        id={id}
        name={name}
        type="text"
        value={query}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        aria-controls={`${id}-suggestions`}
        placeholder="Search for an address or place"
        required
        onChange={(event) => {
          setQuery(event.target.value);
          setSelectedLocation({ latitude: "", longitude: "", placeId: "" });
          setSuggestions([]);
          setIsLoading(false);
          setError("");
        }}
      />
      <input type="hidden" name={`${name} Latitude`} value={selectedLocation.latitude} readOnly />
      <input type="hidden" name={`${name} Longitude`} value={selectedLocation.longitude} readOnly />
      <input type="hidden" name={`${name} Place ID`} value={selectedLocation.placeId} readOnly />
      {suggestions.length > 0 && (
        <ul className="location-suggestions" id={`${id}-suggestions`} role="listbox">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction;
            if (!prediction) return null;
            return (
              <li key={`${prediction.placeId}-${index}`} role="presentation">
                <button
                  className="location-suggestion"
                  type="button"
                  role="option"
                  onClick={() => void selectSuggestion(suggestion)}
                >
                  {prediction.text.toString()}
                </button>
              </li>
            );
          })}
          <li className="location-attribution">Powered by <strong>Google</strong></li>
        </ul>
      )}
      {!apiKeyConfigured ? (
        <span className="location-help">Enter an address manually. Add a Google Maps API key to attach coordinates.</span>
      ) : isLoading ? (
        <span className="location-help" role="status">Searching places...</span>
      ) : error ? (
        <span className="location-error" role="alert">{error}</span>
      ) : selectedLocation.latitude && selectedLocation.longitude ? (
        <span className="location-help">Coordinates saved: {selectedLocation.latitude}, {selectedLocation.longitude}</span>
      ) : null}
    </div>
  );
}

export default LocationAutocomplete;
