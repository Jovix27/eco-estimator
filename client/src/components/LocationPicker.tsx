import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2, Target } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; city: string; lat: number; lng: number }) => void;
  apiKey: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, apiKey }) => {
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const autoCompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (isMounted) initAutocomplete();
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) initAutocomplete();
      };
      script.onerror = () => {
        if (isMounted) {
          setError('MAPS_LOAD_FAILURE');
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      try {
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "IN" },
          fields: ["address_components", "geometry", "formatted_address"],
          types: ["address"],
        });

        autoCompleteRef.current.addListener("place_changed", () => {
          const place = autoCompleteRef.current?.getPlace();
          if (!place || !place.geometry || !place.geometry.location) return;

          const address = place.formatted_address || '';
          let city = 'Other';
          
          place.address_components?.forEach((comp: any) => {
            if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
              city = comp.long_name;
            }
          });

          onLocationSelect({
            address,
            city,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          setInputValue(address);
        });

        setLoading(false);
      } catch (e) {
        console.error('Autocomplete init error:', e);
        setError('INIT_FAILURE');
        setLoading(false);
      }
    };

    loadGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [apiKey, onLocationSelect]);

  return (
    <div className="relative w-full">
      <div className="flex items-center bg-[var(--nothing-bg)] border border-[var(--nothing-border)] hover:border-[var(--nothing-lime)]/40 focus-within:border-[var(--nothing-lime)] transition-all group overflow-hidden">
        <div className="pl-6 flex items-center gap-4">
          <div className="w-1.5 h-1.5 bg-[var(--nothing-lime)] group-focus-within:animate-pulse"></div>
          <div className="text-[var(--nothing-lime)]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin opacity-50" /> : <Target className="w-4 h-4" />}
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={error || "GEO_LOCATION_INPUT (E.G. MUMBAI, BLR...)"}
          disabled={!!error}
          className="w-full px-6 py-6 bg-transparent text-[var(--nothing-text)] placeholder-[var(--nothing-text-dim)] opacity-40 focus:opacity-100 focus:outline-none font-mono text-[10px] font-black uppercase tracking-[0.2em]"
        />
        
        <div className="pr-6 flex items-center gap-4">
          {inputValue && (
            <button 
              onClick={() => setInputValue('')}
              className="text-[var(--nothing-text-dim)] opacity-20 hover:opacity-100 hover:text-[var(--nothing-lime)] transition-all p-1"
            >
              <Search className="w-3.5 h-3.5 rotate-90" />
            </button>
          )}
          <div className="h-8 w-[1px] bg-[var(--nothing-border)]"></div>
          <div className="text-[9px] font-black text-[var(--nothing-text-dim)] opacity-20 uppercase tracking-[0.3em] group-focus-within:text-[var(--nothing-lime)] group-focus-within:opacity-100 transition-all">
            // LOCK_SITE
          </div>
        </div>
      </div>

      {/* Industrial Visual Element */}
      <div className="absolute top-0 right-0 p-2 pointer-events-none opacity-20">
        <div className="text-[8px] font-black text-white italic tracking-tighter">NODE_V4</div>
      </div>
    </div>
  );
};

export default LocationPicker;

