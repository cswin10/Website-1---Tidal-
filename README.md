# Tidal

A beautiful, immersive real-time tide prediction tool for UK coastal locations.

## Features

- **Real-time Tide Data**: Fetches live tide predictions from tidetimes.org.uk for 90+ UK coastal locations
- **Animated Tide Curve**: SVG visualization with smooth cosine interpolation showing the 24-hour tide cycle
- **Timeline Scrubber**: Drag to explore tide heights at any time of day
- **Moon Phase Display**: Accurate lunar phase calculation with visual representation
- **7-Day Forecast**: Horizontally scrollable cards showing upcoming tide times
- **Location Persistence**: Selected location saved to localStorage
- **Atmospheric Design**: Deep ocean bioluminescence theme with animated gradients

## Design

The app features a "deep ocean bioluminescence" aesthetic:
- Dark backgrounds with subtle animated gradients
- Cyan/teal glow effects for interactive elements
- Frosted glass card treatments
- Custom typography (Cormorant Garamond, JetBrains Mono, Outfit)
- Smooth 60fps CSS animations

## Tech Stack

- React 19 + TypeScript
- Vite
- CSS (no component libraries)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Data Source

Tide data is fetched from tidetimes.org.uk RSS feeds via the allorigins.win CORS proxy.

## License

MIT
