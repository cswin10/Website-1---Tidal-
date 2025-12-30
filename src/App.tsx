import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';

// ============================================================================
// Types
// ============================================================================

interface Location {
  name: string;
  slug: string;
}

interface TideEvent {
  time: Date;
  height: number;
  type: 'high' | 'low';
}

interface DayData {
  date: Date;
  tides: TideEvent[];
  sunrise?: string;
  sunset?: string;
}

interface MoonPhase {
  phase: string;
  illumination: number;
  age: number;
}

// ============================================================================
// Location Data
// ============================================================================

const LOCATIONS: Location[] = [
  { name: "Aberdeen", slug: "aberdeen" },
  { name: "Aberystwyth", slug: "aberystwyth" },
  { name: "Appledore", slug: "appledore" },
  { name: "Bangor (Wales)", slug: "bangor" },
  { name: "Barmouth", slug: "barmouth" },
  { name: "Barrow-in-Furness", slug: "barrow-in-furness" },
  { name: "Barry", slug: "barry" },
  { name: "Berwick-upon-Tweed", slug: "berwick-upon-tweed" },
  { name: "Blackpool", slug: "blackpool" },
  { name: "Blyth", slug: "blyth" },
  { name: "Bognor Regis", slug: "bognor-regis" },
  { name: "Bournemouth", slug: "bournemouth" },
  { name: "Bridlington", slug: "bridlington" },
  { name: "Brighton Marina", slug: "brighton-marina" },
  { name: "Bristol (Avonmouth)", slug: "avonmouth" },
  { name: "Broadstairs", slug: "broadstairs" },
  { name: "Bude", slug: "bude" },
  { name: "Burnham-on-Sea", slug: "burnham-on-sea" },
  { name: "Cardiff", slug: "cardiff" },
  { name: "Clacton-on-Sea", slug: "clacton-on-sea" },
  { name: "Clevedon", slug: "clevedon" },
  { name: "Clovelly", slug: "clovelly" },
  { name: "Cromer", slug: "cromer" },
  { name: "Dartmouth", slug: "dartmouth" },
  { name: "Deal", slug: "deal" },
  { name: "Dover", slug: "dover" },
  { name: "Eastbourne", slug: "eastbourne" },
  { name: "Edinburgh (Leith)", slug: "leith" },
  { name: "Exmouth", slug: "exmouth" },
  { name: "Falmouth", slug: "falmouth" },
  { name: "Filey", slug: "filey" },
  { name: "Fishguard", slug: "fishguard" },
  { name: "Fleetwood", slug: "fleetwood" },
  { name: "Folkestone", slug: "folkestone" },
  { name: "Fowey", slug: "fowey" },
  { name: "Great Yarmouth", slug: "great-yarmouth" },
  { name: "Hartlepool", slug: "hartlepool" },
  { name: "Hastings", slug: "hastings" },
  { name: "Hayling Island", slug: "hayling-island" },
  { name: "Holyhead", slug: "holyhead" },
  { name: "Hunstanton", slug: "hunstanton" },
  { name: "Ilfracombe", slug: "ilfracombe" },
  { name: "Inverness", slug: "inverness" },
  { name: "Isle of Wight (Cowes)", slug: "cowes" },
  { name: "Isle of Wight (Ventnor)", slug: "ventnor" },
  { name: "King's Lynn", slug: "kings-lynn" },
  { name: "Liverpool", slug: "liverpool" },
  { name: "Littlehampton", slug: "littlehampton" },
  { name: "Llandudno", slug: "llandudno" },
  { name: "Looe", slug: "looe" },
  { name: "Lowestoft", slug: "lowestoft" },
  { name: "Lyme Regis", slug: "lyme-regis" },
  { name: "Lymington", slug: "lymington" },
  { name: "Lynmouth", slug: "lynmouth" },
  { name: "Margate", slug: "margate" },
  { name: "Milford Haven", slug: "milford-haven" },
  { name: "Minehead", slug: "minehead" },
  { name: "Morecambe", slug: "morecambe" },
  { name: "Newlyn", slug: "newlyn" },
  { name: "Newquay", slug: "newquay" },
  { name: "North Berwick", slug: "north-berwick" },
  { name: "Oban", slug: "oban" },
  { name: "Padstow", slug: "padstow" },
  { name: "Paignton", slug: "paignton" },
  { name: "Penzance", slug: "penzance" },
  { name: "Plymouth", slug: "plymouth" },
  { name: "Poole", slug: "poole" },
  { name: "Porthcawl", slug: "porthcawl" },
  { name: "Portland", slug: "portland" },
  { name: "Portsmouth", slug: "portsmouth" },
  { name: "Ramsgate", slug: "ramsgate" },
  { name: "Redcar", slug: "redcar" },
  { name: "Rhyl", slug: "rhyl" },
  { name: "Salcombe", slug: "salcombe" },
  { name: "Scarborough", slug: "scarborough" },
  { name: "Seaham", slug: "seaham" },
  { name: "Seaton", slug: "seaton" },
  { name: "Sidmouth", slug: "sidmouth" },
  { name: "Skegness", slug: "skegness" },
  { name: "Southampton", slug: "southampton" },
  { name: "Southend-on-Sea", slug: "southend-on-sea" },
  { name: "Southport", slug: "southport" },
  { name: "Southsea", slug: "southsea" },
  { name: "Southwold", slug: "southwold" },
  { name: "St Ives", slug: "st-ives-cornwall" },
  { name: "Sunderland", slug: "sunderland" },
  { name: "Swanage", slug: "swanage" },
  { name: "Swansea", slug: "swansea" },
  { name: "Teignmouth", slug: "teignmouth" },
  { name: "Tenby", slug: "tenby" },
  { name: "Torquay", slug: "torquay" },
  { name: "Tynemouth", slug: "tynemouth" },
  { name: "Weston-super-Mare", slug: "weston-super-mare" },
  { name: "Weymouth", slug: "weymouth" },
  { name: "Whitby", slug: "whitby" },
  { name: "Whitstable", slug: "whitstable" },
  { name: "Worthing", slug: "worthing" }
];

const DEFAULT_LOCATION = LOCATIONS.find(l => l.slug === 'exmouth') || LOCATIONS[0];

// ============================================================================
// Utility Functions
// ============================================================================

function getMoonPhase(date: Date): MoonPhase {
  // Known new moon: January 6, 2000 at 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const lunarCycle = 29.53058867;

  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const age = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;

  // Calculate illumination (0 to 1)
  const illumination = (1 - Math.cos((age / lunarCycle) * 2 * Math.PI)) / 2;

  // Determine phase name
  let phase: string;
  if (age < 1.84566) phase = 'New Moon';
  else if (age < 5.53699) phase = 'Waxing Crescent';
  else if (age < 9.22831) phase = 'First Quarter';
  else if (age < 12.91963) phase = 'Waxing Gibbous';
  else if (age < 16.61096) phase = 'Full Moon';
  else if (age < 20.30228) phase = 'Waning Gibbous';
  else if (age < 23.99361) phase = 'Last Quarter';
  else if (age < 27.68493) phase = 'Waning Crescent';
  else phase = 'New Moon';

  return { phase, illumination, age };
}

function parseTimeToDate(timeStr: string, baseDate: Date): Date {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return baseDate;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getDayName(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { weekday: 'short' });
}

// Cosine interpolation for realistic tide curves
function interpolateTideHeight(time: Date, tideEvents: TideEvent[]): number {
  if (tideEvents.length === 0) return 0;
  if (tideEvents.length === 1) return tideEvents[0].height;

  const timeMs = time.getTime();

  // Find bracketing events
  let before: TideEvent | null = null;
  let after: TideEvent | null = null;

  for (let i = 0; i < tideEvents.length; i++) {
    if (tideEvents[i].time.getTime() <= timeMs) {
      before = tideEvents[i];
    }
    if (tideEvents[i].time.getTime() > timeMs && !after) {
      after = tideEvents[i];
      break;
    }
  }

  if (!before && after) return after.height;
  if (before && !after) return before.height;
  if (!before || !after) return tideEvents[0].height;

  const beforeTime = before.time.getTime();
  const afterTime = after.time.getTime();
  const progress = (timeMs - beforeTime) / (afterTime - beforeTime);

  // Cosine interpolation for smooth, realistic tide curve
  const cosineProgress = (1 - Math.cos(Math.PI * progress)) / 2;
  return before.height + (after.height - before.height) * cosineProgress;
}

function getTideState(now: Date, tideEvents: TideEvent[]): 'rising' | 'falling' {
  if (tideEvents.length < 2) return 'rising';

  const nowMs = now.getTime();

  // Find the next tide event
  for (const event of tideEvents) {
    if (event.time.getTime() > nowMs) {
      return event.type === 'high' ? 'rising' : 'falling';
    }
  }

  // If past all events, check the last one
  const lastEvent = tideEvents[tideEvents.length - 1];
  return lastEvent.type === 'high' ? 'falling' : 'rising';
}

function getNextTide(now: Date, tideEvents: TideEvent[], type: 'high' | 'low'): TideEvent | null {
  const nowMs = now.getTime();
  for (const event of tideEvents) {
    if (event.type === type && event.time.getTime() > nowMs) {
      return event;
    }
  }
  return null;
}

// ============================================================================
// RSS Feed Parser
// ============================================================================

async function fetchTideData(slug: string): Promise<DayData[]> {
  const proxyUrl = 'https://api.allorigins.win/raw?url=';
  const feedUrl = `https://www.tidetimes.org.uk/${slug}-tide-times.rss`;

  const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
  if (!response.ok) throw new Error('Failed to fetch tide data');

  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');

  const items = xml.querySelectorAll('item');
  const days: DayData[] = [];

  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';

    // Parse date from title (e.g., "Monday 30 December 2024")
    const dateMatch = title.match(/(\w+)\s+(\d+)\s+(\w+)\s+(\d+)/);
    let date = new Date();
    if (dateMatch) {
      const months: { [key: string]: number } = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      date = new Date(
        parseInt(dateMatch[4]),
        months[dateMatch[3]] || 0,
        parseInt(dateMatch[2])
      );
    }

    // Parse tide events from description HTML
    const tides: TideEvent[] = [];

    // Match patterns like "High Tide: 05:23 (4.12m)" or "Low Tide: 11:45 (0.98m)"
    const tidePattern = /(High|Low)\s*Tide[:\s]*(\d{1,2}:\d{2})\s*\((\d+\.?\d*)\s*m\)/gi;
    let match;

    while ((match = tidePattern.exec(description)) !== null) {
      const type = match[1].toLowerCase() as 'high' | 'low';
      const timeStr = match[2];
      const height = parseFloat(match[3]);

      tides.push({
        time: parseTimeToDate(timeStr, date),
        height,
        type
      });
    }

    // Sort tides by time
    tides.sort((a, b) => a.time.getTime() - b.time.getTime());

    // Parse sunrise/sunset
    let sunrise: string | undefined;
    let sunset: string | undefined;

    const sunriseMatch = description.match(/Sunrise[:\s]*(\d{1,2}:\d{2})/i);
    const sunsetMatch = description.match(/Sunset[:\s]*(\d{1,2}:\d{2})/i);

    if (sunriseMatch) sunrise = sunriseMatch[1];
    if (sunsetMatch) sunset = sunsetMatch[1];

    if (tides.length > 0) {
      days.push({ date, tides, sunrise, sunset });
    }
  });

  return days;
}

// ============================================================================
// Components
// ============================================================================

// Location Dropdown Component
function LocationDropdown({
  selected,
  onSelect
}: {
  selected: Location;
  onSelect: (location: Location) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredLocations = useMemo(() => {
    if (!search) return LOCATIONS;
    const searchLower = search.toLowerCase();
    return LOCATIONS.filter(l => l.name.toLowerCase().includes(searchLower));
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="location-dropdown-container" ref={dropdownRef}>
      <button
        className={`location-dropdown ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected.name}</span>
        <svg
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredLocations.map((location) => (
            <div
              key={location.slug}
              className={`dropdown-option ${location.slug === selected.slug ? 'selected' : ''}`}
              onClick={() => {
                onSelect(location);
                setIsOpen(false);
                setSearch('');
              }}
            >
              {location.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Moon Phase Display Component
function MoonPhaseDisplay({ date }: { date: Date }) {
  const moon = getMoonPhase(date);

  // Calculate moon visual
  const isWaxing = moon.age < 14.765;
  const illuminationPercent = Math.round(moon.illumination * 100);

  // Create moon visualization
  const getMoonStyle = () => {
    const ill = moon.illumination;

    if (ill < 0.03) {
      // New moon - almost no illumination
      return { width: '0%', left: '50%' };
    } else if (ill > 0.97) {
      // Full moon - full illumination
      return { width: '100%', left: '0%' };
    } else if (isWaxing) {
      // Waxing - illumination grows from right
      return { width: `${ill * 100}%`, right: '0', left: 'auto' };
    } else {
      // Waning - illumination shrinks from left
      return { width: `${ill * 100}%`, left: '0' };
    }
  };

  return (
    <div className="moon-section">
      <div
        className="moon-visual"
        style={{
          boxShadow: `0 0 ${20 + moon.illumination * 20}px rgba(200, 220, 232, ${0.1 + moon.illumination * 0.2})`
        }}
      >
        <div
          className="moon-illumination"
          style={getMoonStyle()}
        />
      </div>
      <span className="moon-phase-name">{moon.phase}</span>
      <span className="moon-illumination-text">{illuminationPercent}% illuminated</span>
    </div>
  );
}

// Tide Curve SVG Component
function TideCurve({
  tideEvents,
  scrubberTime
}: {
  tideEvents: TideEvent[];
  scrubberTime: Date;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 200 });

  useEffect(() => {
    function updateDimensions() {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (tideEvents.length === 0) {
    return <svg className="tide-curve-svg" ref={svgRef} />;
  }

  const { width, height } = dimensions;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get time range (midnight to midnight)
  const baseDate = tideEvents[0].time;
  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const startTime = startOfDay.getTime();
  const endTime = endOfDay.getTime();
  const timeRange = endTime - startTime;

  // Get height range
  const heights = tideEvents.map(t => t.height);
  const minHeight = Math.min(...heights) - 0.5;
  const maxHeight = Math.max(...heights) + 0.5;
  const heightRange = maxHeight - minHeight;

  // Create extended tide events for smooth curve at edges
  const extendedEvents: TideEvent[] = [...tideEvents];

  // Generate smooth curve path
  const points: string[] = [];
  const numPoints = 200;

  for (let i = 0; i <= numPoints; i++) {
    const t = startTime + (timeRange * i) / numPoints;
    const time = new Date(t);
    const h = interpolateTideHeight(time, extendedEvents);

    const x = padding.left + (chartWidth * i) / numPoints;
    const y = padding.top + chartHeight - ((h - minHeight) / heightRange) * chartHeight;

    points.push(`${x},${y}`);
  }

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${padding.left + chartWidth},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`;

  // Current time position
  const now = new Date();
  const nowMs = now.getTime();
  const currentTimeX = padding.left + (chartWidth * (nowMs - startTime)) / timeRange;
  const currentHeight = interpolateTideHeight(now, extendedEvents);
  const currentY = padding.top + chartHeight - ((currentHeight - minHeight) / heightRange) * chartHeight;

  // Scrubber position
  const scrubberMs = scrubberTime.getTime();
  const scrubberX = padding.left + (chartWidth * (scrubberMs - startTime)) / timeRange;
  const scrubberHeight = interpolateTideHeight(scrubberTime, extendedEvents);
  const scrubberY = padding.top + chartHeight - ((scrubberHeight - minHeight) / heightRange) * chartHeight;

  // Hour markers
  const hourMarkers = [];
  for (let hour = 0; hour <= 24; hour += 6) {
    const x = padding.left + (chartWidth * hour) / 24;
    hourMarkers.push({ x, label: `${hour.toString().padStart(2, '0')}:00` });
  }

  return (
    <div className="tide-curve-svg-container">
      <svg className="tide-curve-svg" ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 245, 212, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 245, 212, 0.05)" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="50%" stopColor="#00f5d4" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {hourMarkers.map((marker, i) => (
          <g key={i}>
            <line
              x1={marker.x}
              y1={padding.top}
              x2={marker.x}
              y2={padding.top + chartHeight}
              stroke="rgba(0, 245, 212, 0.1)"
              strokeWidth="1"
            />
            <text
              x={marker.x}
              y={height - 5}
              fill="#5a7a8a"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="middle"
            >
              {marker.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
        />

        {/* Shimmer animation overlay */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          opacity="0.5"
          style={{
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />

        {/* Main curve line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Tide event markers */}
        {tideEvents.map((event, i) => {
          const x = padding.left + (chartWidth * (event.time.getTime() - startTime)) / timeRange;
          const y = padding.top + chartHeight - ((event.height - minHeight) / heightRange) * chartHeight;

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={event.type === 'high' ? '#ff6b6b' : '#00b4d8'}
                filter="url(#glow)"
              />
              <text
                x={x}
                y={y - 12}
                fill="#c8dce8"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="middle"
              >
                {event.height.toFixed(1)}m
              </text>
            </g>
          );
        })}

        {/* Current time marker */}
        {nowMs >= startTime && nowMs <= endTime && (
          <g>
            <line
              x1={currentTimeX}
              y1={padding.top}
              x2={currentTimeX}
              y2={padding.top + chartHeight}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx={currentTimeX}
              cy={currentY}
              r="8"
              fill="#ffffff"
              filter="url(#glow)"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
          </g>
        )}

        {/* Scrubber marker */}
        {scrubberMs !== nowMs && scrubberMs >= startTime && scrubberMs <= endTime && (
          <g>
            <line
              x1={scrubberX}
              y1={padding.top}
              x2={scrubberX}
              y2={padding.top + chartHeight}
              stroke="rgba(0, 245, 212, 0.5)"
              strokeWidth="1"
            />
            <circle
              cx={scrubberX}
              cy={scrubberY}
              r="6"
              fill="#00f5d4"
              filter="url(#glow)"
            />
          </g>
        )}
      </svg>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// Timeline Scrubber Component
function TimelineScrubber({
  time,
  onTimeChange,
  tideEvents,
  sunrise,
  sunset
}: {
  time: Date;
  onTimeChange: (time: Date) => void;
  tideEvents: TideEvent[];
  sunrise?: string;
  sunset?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get current day boundaries
  const startOfDay = new Date(time);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const startTime = startOfDay.getTime();
  const endTime = endOfDay.getTime();
  const timeRange = endTime - startTime;

  const currentProgress = (time.getTime() - startTime) / timeRange;
  const now = new Date();
  const nowProgress = (now.getTime() - startTime) / timeRange;

  const currentHeight = interpolateTideHeight(time, tideEvents);

  // Calculate sun positions
  const sunriseProgress = sunrise ? (() => {
    const [h, m] = sunrise.split(':').map(Number);
    return (h * 60 + m) / (24 * 60);
  })() : null;

  const sunsetProgress = sunset ? (() => {
    const [h, m] = sunset.split(':').map(Number);
    return (h * 60 + m) / (24 * 60);
  })() : null;

  const updateTimeFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));

    const newTime = new Date(startTime + progress * timeRange);
    onTimeChange(newTime);
  }, [startTime, timeRange, onTimeChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updateTimeFromPosition(e.clientX);
  }, [updateTimeFromPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updateTimeFromPosition(e.touches[0].clientX);
  }, [updateTimeFromPosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateTimeFromPosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updateTimeFromPosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateTimeFromPosition]);

  return (
    <div className="timeline-scrubber">
      <div className="timeline-info">
        <span className="timeline-time">{formatTime(time)}</span>
        <span className="timeline-height">{currentHeight.toFixed(2)}m</span>
      </div>

      <div
        className="timeline-track"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Progress fill */}
        <div
          className="timeline-progress"
          style={{ width: `${currentProgress * 100}%` }}
        />

        {/* Hour markers */}
        <div className="timeline-markers">
          {[0, 6, 12, 18, 24].map(hour => (
            <span key={hour} className="timeline-hour-marker">
              {hour.toString().padStart(2, '0')}
            </span>
          ))}
        </div>

        {/* Sun markers */}
        {sunriseProgress !== null && sunriseProgress >= 0 && sunriseProgress <= 1 && (
          <div
            className="sun-marker sunrise"
            style={{ left: `${sunriseProgress * 100}%` }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}

        {sunsetProgress !== null && sunsetProgress >= 0 && sunsetProgress <= 1 && (
          <div
            className="sun-marker sunset"
            style={{ left: `${sunsetProgress * 100}%` }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}

        {/* Current time marker (glowing) */}
        {nowProgress >= 0 && nowProgress <= 1 && (
          <div
            className="timeline-current-marker"
            style={{ left: `${nowProgress * 100}%` }}
          />
        )}

        {/* Draggable handle */}
        <div
          className={`timeline-handle ${isDragging ? 'dragging' : ''}`}
          style={{ left: `${currentProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

// Forecast Card Component
function ForecastCard({
  day,
  isToday
}: {
  day: DayData;
  isToday: boolean;
}) {
  const moon = getMoonPhase(day.date);
  const isWaxing = moon.age < 14.765;

  const getMoonStyle = () => {
    const ill = moon.illumination;
    if (ill < 0.03) return { width: '0%', left: '50%' };
    if (ill > 0.97) return { width: '100%', left: '0%' };
    if (isWaxing) return { width: `${ill * 100}%`, right: '0', left: 'auto' };
    return { width: `${ill * 100}%`, left: '0' };
  };

  return (
    <div className={`forecast-card ${isToday ? 'today' : ''}`}>
      <div className="forecast-header">
        <div>
          <div className="forecast-day">{getDayName(day.date)}</div>
          <div className="forecast-date">
            {day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div className="forecast-moon">
          <div className="forecast-moon-illumination" style={getMoonStyle()} />
        </div>
      </div>

      <div className="forecast-tides">
        {day.tides.map((tide, i) => (
          <div key={i} className="forecast-tide">
            <div className="forecast-tide-type">
              <div className={`tide-type-indicator ${tide.type}`} />
              <span>{tide.type}</span>
            </div>
            <span className="forecast-tide-time">{formatTime(tide.time)}</span>
            <span className="forecast-tide-height">{tide.height.toFixed(1)}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Component
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-wave" />
      <span className="loading-text">Reading the tides...</span>
    </div>
  );
}

// Error Component
function ErrorDisplay({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠</div>
      <h2 className="error-title">Unable to fetch tide data</h2>
      <p className="error-message">{message}</p>
      <button className="retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  // Load saved location from localStorage
  const [location, setLocation] = useState<Location>(() => {
    const saved = localStorage.getItem('tidal-location');
    if (saved) {
      const parsed = JSON.parse(saved);
      return LOCATIONS.find(l => l.slug === parsed.slug) || DEFAULT_LOCATION;
    }
    return DEFAULT_LOCATION;
  });

  const [tideData, setTideData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrubberTime, setScrubberTime] = useState(new Date());

  // Save location to localStorage
  useEffect(() => {
    localStorage.setItem('tidal-location', JSON.stringify(location));
  }, [location]);

  // Fetch tide data
  const loadTideData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTideData(location.slug);
      setTideData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tide data');
    } finally {
      setLoading(false);
    }
  }, [location.slug]);

  useEffect(() => {
    loadTideData();
  }, [loadTideData]);

  // Update scrubber time to current time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setScrubberTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Get today's data
  const today = new Date();
  const todayData = tideData.find(d =>
    d.date.toDateString() === today.toDateString()
  );

  // All tide events (for interpolation across days)
  const allTideEvents = useMemo(() => {
    return tideData.flatMap(d => d.tides).sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [tideData]);

  // Today's tide events
  const todayTides = todayData?.tides || [];

  // Tide state
  const tideState = getTideState(scrubberTime, allTideEvents);

  // Next tides
  const nextHigh = getNextTide(scrubberTime, allTideEvents, 'high');
  const nextLow = getNextTide(scrubberTime, allTideEvents, 'low');

  // Current height
  const currentHeight = interpolateTideHeight(scrubberTime, allTideEvents);

  // Today's range
  const todayHeights = todayTides.map(t => t.height);
  const todayRange = todayHeights.length > 0
    ? { min: Math.min(...todayHeights), max: Math.max(...todayHeights) }
    : { min: 0, max: 0 };

  return (
    <>
      <div className="app-background" />

      <div className="app">
        <header className="header">
          <div className="location-section">
            <div className="app-title">Tidal</div>
            <LocationDropdown
              selected={location}
              onSelect={setLocation}
            />
            {!loading && !error && (
              <div className="tide-state">
                <div className={`tide-state-indicator ${tideState}`} />
                <span className={`tide-state-text ${tideState}`}>
                  {tideState === 'rising' ? 'Rising' : 'Falling'}
                </span>
              </div>
            )}
          </div>

          <MoonPhaseDisplay date={today} />
        </header>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadTideData} />
        ) : (
          <>
            {/* Tide Curve */}
            <div className="tide-curve-container">
              <div className="tide-curve-header">
                <span className="tide-curve-title">Today's Tide</span>
                <span className="tide-curve-date">{formatDate(today)}</span>
              </div>
              <TideCurve
                tideEvents={todayTides}
                scrubberTime={scrubberTime}
              />
            </div>

            {/* Stat Cards */}
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-label">Next High Tide</div>
                {nextHigh ? (
                  <>
                    <div className="stat-value high">{formatTime(nextHigh.time)}</div>
                    <div className="stat-subvalue">{nextHigh.height.toFixed(2)}m</div>
                  </>
                ) : (
                  <div className="stat-value">—</div>
                )}
              </div>

              <div className="stat-card">
                <div className="stat-label">Next Low Tide</div>
                {nextLow ? (
                  <>
                    <div className="stat-value low">{formatTime(nextLow.time)}</div>
                    <div className="stat-subvalue">{nextLow.height.toFixed(2)}m</div>
                  </>
                ) : (
                  <div className="stat-value">—</div>
                )}
              </div>

              <div className="stat-card">
                <div className="stat-label">Current Height</div>
                <div className="stat-value">{currentHeight.toFixed(2)}m</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Today's Range</div>
                <div className="stat-value">
                  {todayRange.min.toFixed(1)} — {todayRange.max.toFixed(1)}m
                </div>
              </div>
            </div>

            {/* Today's Tides */}
            <section className="todays-tides">
              <h2 className="section-title">Today's Tides</h2>
              <div className="tide-list">
                {todayTides.map((tide, i) => (
                  <div key={i} className="tide-item">
                    <div className={`tide-type-indicator ${tide.type}`} />
                    <span className="tide-time">{formatTime(tide.time)}</span>
                    <span className="tide-height">{tide.height.toFixed(2)}m</span>
                    <span className="tide-type-label">{tide.type}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7-Day Forecast */}
            <section className="forecast-section">
              <h2 className="section-title">7-Day Forecast</h2>
              <div className="forecast-container">
                {tideData.map((day, i) => (
                  <ForecastCard
                    key={i}
                    day={day}
                    isToday={day.date.toDateString() === today.toDateString()}
                  />
                ))}
              </div>
            </section>

            {/* Timeline Scrubber */}
            <TimelineScrubber
              time={scrubberTime}
              onTimeChange={setScrubberTime}
              tideEvents={allTideEvents}
              sunrise={todayData?.sunrise}
              sunset={todayData?.sunset}
            />
          </>
        )}
      </div>
    </>
  );
}

export default App;
