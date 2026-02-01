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
export type GradientType = 
  | 'linear' 
  | 'radial' 
  | 'conic' 
  | 'repeating-linear' 
  | 'repeating-radial' 
  | 'repeating-conic';

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
  /** 
   * Size of the repeating pattern (1-100%). 
   * Only applies to repeating-* gradient types.
   * E.g., 25 means the pattern repeats 4 times (100/25).
   */
  repeatSize?: number;
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
  
  // Check if this is a repeating gradient
  const isRepeating = config.type.startsWith('repeating-');
  
  // Scale factor for repeating gradients (default 100% = no scaling)
  const repeatSize = isRepeating ? (config.repeatSize ?? 100) : 100;
  const scaleFactor = repeatSize / 100;
  
  const stopsString = sortedStops
    .map(stop => {
      const opacity = stop.opacity ?? 1;
      const color = opacity < 1 ? hexToRgba(stop.color, opacity) : stop.color;
      // Scale the offset for repeating gradients
      const scaledOffset = stop.offset * scaleFactor * 100;
      return `${color} ${scaledOffset.toFixed(1)}%`;
    })
    .join(', ');

  const shape = config.radialShape || 'circle';
  const position = config.radialPosition 
    ? `at ${config.radialPosition.x}% ${config.radialPosition.y}%` 
    : 'at center';

  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle}deg, ${stopsString})`;
    
    case 'radial':
      return `radial-gradient(${shape} ${position}, ${stopsString})`;
    
    case 'conic':
      return `conic-gradient(from ${config.angle}deg ${position}, ${stopsString})`;
    
    case 'repeating-linear':
      return `repeating-linear-gradient(${config.angle}deg, ${stopsString})`;
    
    case 'repeating-radial':
      return `repeating-radial-gradient(${shape} ${position}, ${stopsString})`;
    
    case 'repeating-conic':
      return `repeating-conic-gradient(from ${config.angle}deg ${position}, ${stopsString})`;
    
    default:
      return `linear-gradient(${config.angle}deg, ${stopsString})`;
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

/**
 * Parse a CSS gradient string and extract the gradient type
 * Returns null if the string is not a valid gradient
 */
export function parseGradientType(css: string): GradientType | null {
  if (!css || typeof css !== 'string') return null;
  
  const trimmed = css.trim().toLowerCase();
  
  // Check in order of specificity (repeating- variants first)
  if (trimmed.startsWith('repeating-linear-gradient')) return 'repeating-linear';
  if (trimmed.startsWith('repeating-radial-gradient')) return 'repeating-radial';
  if (trimmed.startsWith('repeating-conic-gradient')) return 'repeating-conic';
  if (trimmed.startsWith('linear-gradient')) return 'linear';
  if (trimmed.startsWith('radial-gradient')) return 'radial';
  if (trimmed.startsWith('conic-gradient')) return 'conic';
  
  return null;
}

/**
 * Parse a CSS gradient string and extract the angle
 * Returns null if no angle found
 */
export function parseGradientAngle(css: string): number | null {
  if (!css || typeof css !== 'string') return null;
  
  // Match "from Xdeg" pattern for conic gradients
  const fromAngleMatch = css.match(/from\s+(-?\d+(?:\.\d+)?)\s*deg/i);
  if (fromAngleMatch) {
    return parseFloat(fromAngleMatch[1]);
  }
  
  // Match angle at start of gradient content: "(90deg," or "(45deg "
  const startAngleMatch = css.match(/\(\s*(-?\d+(?:\.\d+)?)\s*deg\s*[,\s]/i);
  if (startAngleMatch) {
    return parseFloat(startAngleMatch[1]);
  }
  
  // Match direction keywords
  const directionMap: Record<string, number> = {
    'to top': 0,
    'to top right': 45,
    'to right': 90,
    'to bottom right': 135,
    'to bottom': 180,
    'to bottom left': 225,
    'to left': 270,
    'to top left': 315
  };
  
  for (const [direction, angle] of Object.entries(directionMap)) {
    if (css.toLowerCase().includes(direction)) {
      return angle;
    }
  }
  
  return null;
}

/**
 * Parse a CSS gradient string and extract color stops
 * Returns empty array if parsing fails
 */
export function parseGradientStops(css: string): ColorStop[] {
  if (!css || typeof css !== 'string') return [];
  
  // Find the opening paren and extract everything until the last closing paren
  const openIndex = css.indexOf('(');
  const closeIndex = css.lastIndexOf(')');
  if (openIndex === -1 || closeIndex === -1 || closeIndex <= openIndex) return [];
  
  const content = css.substring(openIndex + 1, closeIndex);
  
  // Split by commas, but be careful with rgba() values
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;
  
  for (const char of content) {
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === ',' && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  
  // Filter to get only color stops (ignore angle, shape, position)
  const colorStops: ColorStop[] = [];
  const colorPattern = /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-z]+)\s*(\d+(?:\.\d+)?%)?/i;
  
  for (const part of parts) {
    // Skip angle/direction/shape declarations
    if (part.match(/^\d+deg$/i)) continue;
    if (part.match(/^from\s+\d+deg/i)) continue;
    if (part.match(/^(to\s+)?(top|bottom|left|right)/i)) continue;
    if (part.match(/^(circle|ellipse)/i)) continue;
    if (part.match(/^at\s+/i)) continue;
    
    const colorMatch = part.match(colorPattern);
    if (colorMatch) {
      const colorValue = colorMatch[1];
      const percentStr = colorMatch[2];
      
      // Skip CSS keywords that aren't colors
      if (['circle', 'ellipse', 'closest-side', 'farthest-side', 'closest-corner', 'farthest-corner'].includes(colorValue.toLowerCase())) {
        continue;
      }
      
      const offset = percentStr ? parseFloat(percentStr) / 100 : colorStops.length === 0 ? 0 : 1;
      
      // Convert color to hex if needed
      let color = colorValue;
      let opacity = 1;
      
      const rgbaMatch = colorValue.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        opacity = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
        color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
      
      colorStops.push(createColorStop(offset, color, opacity));
    }
  }
  
  return colorStops;
}

/**
 * Parse the repeat size from a repeating gradient
 * The repeat size is determined by the last stop's position
 */
function parseRepeatSize(css: string, type: GradientType): number | undefined {
  // Only parse for repeating gradients
  if (!type.startsWith('repeating-')) {
    return undefined;
  }
  
  // Find all percentage values in the gradient stops
  const percentageMatch = css.match(/(\d+(?:\.\d+)?)\s*%/g);
  if (!percentageMatch || percentageMatch.length === 0) {
    return undefined;
  }
  
  // Get the last percentage value as the repeat size
  const lastPercentage = percentageMatch[percentageMatch.length - 1];
  const value = parseFloat(lastPercentage);
  
  // Only return if it's less than 100% (otherwise it's not really repeating)
  if (value > 0 && value < 100) {
    return value;
  }
  
  return undefined;
}

/**
 * Parse a complete CSS gradient string into a GradientConfig
 */
export function parseGradientCSS(css: string): GradientConfig | null {
  const type = parseGradientType(css);
  if (!type) return null;
  
  const angle = parseGradientAngle(css) ?? 90;
  const stops = parseGradientStops(css);
  
  if (stops.length === 0) return null;
  
  const repeatSize = parseRepeatSize(css, type);
  
  return {
    type,
    angle,
    stops,
    ...(repeatSize !== undefined && { repeatSize })
  };
}
