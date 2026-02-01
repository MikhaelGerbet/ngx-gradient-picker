/**
 * Represents a single color stop in the gradient
 */
export interface ColorStop {
  /** Unique identifier for the stop */
  id: string;
  /** Position of the stop (0 to 1) */
  offset: number;
  /** Color value in hex or rgb format */
  color: string;
  /** Opacity of the color (0 to 1) */
  opacity?: number;
  /** Whether this stop is currently active/selected */
  isActive?: boolean;
}

/**
 * Type of gradient
 */
export type GradientType = 'linear' | 'radial';

/**
 * Direction of the gradient picker layout
 */
export type GradientDirection = 'horizontal' | 'vertical';

/**
 * Radial gradient shape
 */
export type RadialShape = 'circle' | 'ellipse';

/**
 * Configuration for the gradient
 */
export interface GradientConfig {
  type: GradientType;
  angle: number;
  stops: ColorStop[];
  radialShape?: RadialShape;
  radialPosition?: { x: number; y: number };
}

/**
 * Event emitted when a color stop is selected
 */
export interface ColorStopSelectEvent {
  stop: ColorStop;
  index: number;
}

/**
 * Event emitted when dragging a color stop
 */
export interface ColorStopDragEvent {
  stop: ColorStop;
  offset: number;
  originalEvent: MouseEvent | TouchEvent;
}

/**
 * Utility function to generate a unique ID
 */
export function generateStopId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Utility function to create a default color stop
 */
export function createColorStop(offset: number, color: string, opacity = 1): ColorStop {
  return {
    id: generateStopId(),
    offset: Math.max(0, Math.min(1, offset)),
    color,
    opacity,
    isActive: false
  };
}

/**
 * Utility function to sort stops by offset
 */
export function sortStopsByOffset(stops: ColorStop[]): ColorStop[] {
  return [...stops].sort((a, b) => a.offset - b.offset);
}

/**
 * Utility function to generate CSS gradient string
 * Returns a solid color if only one stop is present
 */
export function generateGradientCSS(config: GradientConfig): string {
  const sortedStops = sortStopsByOffset(config.stops);
  
  // Single stop = solid color
  if (sortedStops.length === 1) {
    const stop = sortedStops[0];
    const opacity = stop.opacity ?? 1;
    return opacity < 1 ? hexToRgba(stop.color, opacity) : stop.color;
  }
  
  // No stops = transparent
  if (sortedStops.length === 0) {
    return 'transparent';
  }
  
  const stopsString = sortedStops
    .map(stop => {
      const opacity = stop.opacity ?? 1;
      const color = opacity < 1 ? hexToRgba(stop.color, opacity) : stop.color;
      return `${color} ${(stop.offset * 100).toFixed(1)}%`;
    })
    .join(', ');

  if (config.type === 'linear') {
    return `linear-gradient(${config.angle}deg, ${stopsString})`;
  } else {
    const shape = config.radialShape || 'circle';
    const position = config.radialPosition 
      ? `at ${config.radialPosition.x}% ${config.radialPosition.y}%` 
      : 'at center';
    return `radial-gradient(${shape} ${position}, ${stopsString})`;
  }
}

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

/**
 * Default palette with two stops
 */
export const DEFAULT_PALETTE: ColorStop[] = [
  createColorStop(0, '#ff0000'),
  createColorStop(1, '#0000ff')
];

/**
 * Simple utility function to generate CSS from palette, angle and type
 */
export function paletteToCSS(
  stops: ColorStop[], 
  angle: number, 
  type: GradientType = 'linear'
): string {
  return generateGradientCSS({
    type,
    angle,
    stops
  });
}
