import { Loader2, MapPin } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { searchAddresses, type GeocodeResult } from "../../lib/geocode";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LEN = 3;

export interface LocationAutocompleteProps {
  value: string;
  onChange: (text: string) => void;
  onSelectLocation: (result: { displayName: string; lat: number; lng: number } | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onSelectLocation,
  disabled = false,
  placeholder = "Search a place in the Philippines…",
}: LocationAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const committedValueRef = useRef<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedEmpty, setSearchedEmpty] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const handleInputChange = useCallback(
    (next: string) => {
      if (
        committedValueRef.current !== null &&
        next.trim() !== committedValueRef.current.trim()
      ) {
        committedValueRef.current = null;
        onSelectLocation(null);
      }
      onChange(next);
      setIsOpen(true);
      setSearchedEmpty(false);
    },
    [onChange, onSelectLocation]
  );

  const pickResult = useCallback(
    (r: GeocodeResult) => {
      committedValueRef.current = r.displayName;
      onChange(r.displayName);
      onSelectLocation({ displayName: r.displayName, lat: r.lat, lng: r.lng });
      setIsOpen(false);
      setResults([]);
      setSearchedEmpty(false);
      setHighlightIndex(0);
      inputRef.current?.blur();
    },
    [onChange, onSelectLocation]
  );

  useEffect(() => {
    if (value.trim().length < MIN_QUERY_LEN) {
      setResults([]);
      setIsLoading(false);
      setSearchedEmpty(false);
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(() => {
      setIsLoading(true);
      setResults([]);
      searchAddresses(value, ac.signal)
        .then((rows) => {
          setResults(rows);
          setSearchedEmpty(rows.length === 0);
          setHighlightIndex(0);
        })
        .catch(() => {
          /* aborted or network */
        })
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [value]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const showDropdown =
    isOpen &&
    !disabled &&
    value.trim().length >= MIN_QUERY_LEN &&
    (isLoading || results.length > 0 || searchedEmpty);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" && value.trim().length >= MIN_QUERY_LEN) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[highlightIndex];
      if (r) pickResult(r);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative mt-1.5">
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && results[highlightIndex]
              ? `${listId}-opt-${results[highlightIndex].id}`
              : undefined
          }
          autoComplete="off"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="input-shell w-full pr-10"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-aegis-accent" aria-hidden />
          ) : (
            <MapPin className="h-4 w-4" aria-hidden />
          )}
        </div>
      </div>

      {showDropdown && (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="card absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-aegis-border bg-aegis-surface py-1 shadow-card"
        >
          {isLoading && (
            <li className="px-3 py-2 text-[12px] text-slate-500">Searching…</li>
          )}
          {!isLoading && searchedEmpty && (
            <li className="px-3 py-2 text-[12px] text-slate-500">
              No matches found in the Philippines. Try a different spelling or barangay name.
            </li>
          )}
          {!isLoading &&
            results.map((r, idx) => (
              <li key={r.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-opt-${r.id}`}
                  role="option"
                  aria-selected={idx === highlightIndex}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-[13px] transition hover:bg-white/[0.06] ${
                    idx === highlightIndex ? "bg-white/[0.06]" : ""
                  }`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickResult(r)}
                >
                  <span className="font-medium text-slate-100">{r.shortLabel}</span>
                  <span className="line-clamp-2 text-[11px] leading-snug text-slate-500">
                    {r.displayName}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
