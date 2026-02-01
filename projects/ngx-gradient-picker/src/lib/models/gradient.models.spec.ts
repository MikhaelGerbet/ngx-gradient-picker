import {
  generateGradientCSS,
  parseGradientType,
  parseGradientAngle,
  parseGradientStops,
  parseGradientCSS,
  createColorStop,
  GradientConfig
} from './gradient.models';

describe('Gradient Models', () => {
  describe('generateGradientCSS', () => {
    const baseStops = [
      createColorStop(0, '#ff0000'),
      createColorStop(1, '#0000ff')
    ];

    it('should generate linear gradient', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: baseStops
      };
      const css = generateGradientCSS(config);
      expect(css).toBe('linear-gradient(90deg, #ff0000 0.0%, #0000ff 100.0%)');
    });

    it('should generate radial gradient', () => {
      const config: GradientConfig = {
        type: 'radial',
        angle: 0,
        stops: baseStops
      };
      const css = generateGradientCSS(config);
      expect(css).toContain('radial-gradient');
      expect(css).toContain('circle at center');
    });

    it('should generate conic gradient', () => {
      const config: GradientConfig = {
        type: 'conic',
        angle: 45,
        stops: baseStops
      };
      const css = generateGradientCSS(config);
      expect(css).toContain('conic-gradient');
      expect(css).toContain('from 45deg');
    });

    it('should generate repeating-linear gradient', () => {
      const config: GradientConfig = {
        type: 'repeating-linear',
        angle: 90,
        stops: baseStops
      };
      const css = generateGradientCSS(config);
      expect(css).toContain('repeating-linear-gradient');
    });

    it('should generate repeating-radial gradient', () => {
      const config: GradientConfig = {
        type: 'repeating-radial',
        angle: 0,
        stops: baseStops
      };
      const css = generateGradientCSS(config);
      expect(css).toContain('repeating-radial-gradient');
    });

    it('should generate repeating-conic gradient', () => {
      const config: GradientConfig = {
        type: 'repeating-conic',
        angle: 0,
        stops: baseStops
      };
      const css = generateGradientCSS(config);
      expect(css).toContain('repeating-conic-gradient');
    });

    it('should return solid color for single stop', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: [createColorStop(0.5, '#ff0000')]
      };
      const css = generateGradientCSS(config);
      expect(css).toBe('#ff0000');
    });

    it('should return transparent for no stops', () => {
      const config: GradientConfig = {
        type: 'linear',
        angle: 90,
        stops: []
      };
      const css = generateGradientCSS(config);
      expect(css).toBe('transparent');
    });
  });

  describe('parseGradientType', () => {
    it('should parse linear-gradient', () => {
      expect(parseGradientType('linear-gradient(90deg, red, blue)')).toBe('linear');
    });

    it('should parse radial-gradient', () => {
      expect(parseGradientType('radial-gradient(circle, red, blue)')).toBe('radial');
    });

    it('should parse conic-gradient', () => {
      expect(parseGradientType('conic-gradient(from 45deg, red, blue)')).toBe('conic');
    });

    it('should parse repeating-linear-gradient', () => {
      expect(parseGradientType('repeating-linear-gradient(90deg, red, blue)')).toBe('repeating-linear');
    });

    it('should parse repeating-radial-gradient', () => {
      expect(parseGradientType('repeating-radial-gradient(circle, red, blue)')).toBe('repeating-radial');
    });

    it('should parse repeating-conic-gradient', () => {
      expect(parseGradientType('repeating-conic-gradient(from 0deg, red, blue)')).toBe('repeating-conic');
    });

    it('should return null for invalid input', () => {
      expect(parseGradientType('solid-color')).toBeNull();
      expect(parseGradientType('')).toBeNull();
      expect(parseGradientType(null as any)).toBeNull();
    });
  });

  describe('parseGradientAngle', () => {
    it('should parse angle in degrees', () => {
      expect(parseGradientAngle('linear-gradient(45deg, red, blue)')).toBe(45);
      expect(parseGradientAngle('linear-gradient(180deg, red, blue)')).toBe(180);
    });

    it('should parse "from" angle for conic', () => {
      expect(parseGradientAngle('conic-gradient(from 90deg, red, blue)')).toBe(90);
    });

    it('should parse direction keywords', () => {
      expect(parseGradientAngle('linear-gradient(to right, red, blue)')).toBe(90);
      expect(parseGradientAngle('linear-gradient(to bottom, red, blue)')).toBe(180);
      expect(parseGradientAngle('linear-gradient(to top, red, blue)')).toBe(0);
      expect(parseGradientAngle('linear-gradient(to left, red, blue)')).toBe(270);
    });

    it('should return null for no angle', () => {
      expect(parseGradientAngle('radial-gradient(circle, red, blue)')).toBeNull();
    });
  });

  describe('parseGradientStops', () => {
    it('should parse hex colors with percentages', () => {
      const stops = parseGradientStops('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
      expect(stops.length).toBe(2);
      expect(stops[0].color).toBe('#ff0000');
      expect(stops[0].offset).toBe(0);
      expect(stops[1].color).toBe('#0000ff');
      expect(stops[1].offset).toBe(1);
    });

    it('should parse rgba colors', () => {
      const stops = parseGradientStops('linear-gradient(90deg, rgba(255, 0, 0, 0.5) 0%, rgba(0, 0, 255, 1) 100%)');
      expect(stops.length).toBe(2);
      expect(stops[0].opacity).toBe(0.5);
      expect(stops[1].opacity).toBe(1);
    });

    it('should parse 3-digit hex colors', () => {
      const stops = parseGradientStops('linear-gradient(90deg, #f00 0%, #00f 100%)');
      expect(stops.length).toBe(2);
      expect(stops[0].color).toBe('#f00');
      expect(stops[1].color).toBe('#00f');
    });

    it('should parse named colors', () => {
      const stops = parseGradientStops('linear-gradient(90deg, red 0%, blue 50%, green 100%)');
      expect(stops.length).toBe(3);
      expect(stops[0].color).toBe('red');
      expect(stops[1].color).toBe('blue');
      expect(stops[2].color).toBe('green');
    });

    it('should parse multiple stops with various positions', () => {
      const stops = parseGradientStops('linear-gradient(90deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 75%, #667eea 100%)');
      expect(stops.length).toBe(4);
      expect(stops[0].offset).toBe(0);
      expect(stops[1].offset).toBe(0.25);
      expect(stops[2].offset).toBe(0.75);
      expect(stops[3].offset).toBe(1);
    });

    it('should return empty array for invalid input', () => {
      expect(parseGradientStops('')).toEqual([]);
      expect(parseGradientStops(null as any)).toEqual([]);
    });
  });

  describe('parseGradientCSS', () => {
    it('should parse complete gradient CSS', () => {
      const result = parseGradientCSS('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('linear');
      expect(result!.angle).toBe(45);
      expect(result!.stops.length).toBe(2);
    });

    it('should parse radial gradient', () => {
      const result = parseGradientCSS('radial-gradient(circle, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('radial');
      expect(result!.stops.length).toBe(3);
    });

    it('should parse conic gradient', () => {
      const result = parseGradientCSS('conic-gradient(from 45deg, #ff6b6b, #feca57, #48dbfb, #ff6b6b)');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('conic');
      expect(result!.angle).toBe(45);
    });

    it('should parse repeating-linear gradient', () => {
      const result = parseGradientCSS('repeating-linear-gradient(45deg, #ee7752 0%, #e73c7e 25%)');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('repeating-linear');
      expect(result!.angle).toBe(45);
      expect(result!.repeatSize).toBe(25);
    });

    it('should parse repeating-radial gradient', () => {
      const result = parseGradientCSS('repeating-radial-gradient(circle, #667eea 0%, #764ba2 20%)');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('repeating-radial');
      expect(result!.repeatSize).toBe(20);
    });

    it('should parse repeating-conic gradient', () => {
      const result = parseGradientCSS('repeating-conic-gradient(from 0deg, #667eea 0%, #764ba2 10%)');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('repeating-conic');
      expect(result!.repeatSize).toBe(10);
    });

    it('should not set repeatSize for non-repeating gradients', () => {
      const result = parseGradientCSS('linear-gradient(45deg, #ff0000 0%, #0000ff 100%)');
      expect(result).not.toBeNull();
      expect(result!.repeatSize).toBeUndefined();
    });

    it('should default angle to 90 when not specified', () => {
      const result = parseGradientCSS('radial-gradient(circle, red, blue)');
      expect(result).not.toBeNull();
      expect(result!.angle).toBe(90);
    });

    it('should return null for invalid CSS', () => {
      expect(parseGradientCSS('not-a-gradient')).toBeNull();
      expect(parseGradientCSS('')).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(parseGradientCSS(undefined as any)).toBeNull();
    });
  });
});
