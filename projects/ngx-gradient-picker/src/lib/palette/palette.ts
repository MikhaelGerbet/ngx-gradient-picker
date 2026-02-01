import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorStop, sortStopsByOffset } from '../models/gradient.models';

@Component({
  selector: 'ngx-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './palette.html',
  styleUrl: './palette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-palette'
  }
})
export class PaletteComponent {
  /** The color stops to display */
  palette = input.required<ColorStop[]>();
  
  /** Width of the palette */
  width = input<number>(320);
  
  /** Height of the palette */
  height = input<number>(32);

  /** Computed sorted stops */
  sortedStops = computed(() => sortStopsByOffset(this.palette()));

  /** Computed: is this a solid color (single stop)? */
  isSolidColor = computed(() => this.sortedStops().length === 1);

  /** Computed: solid color value (when single stop) */
  solidColor = computed(() => {
    const stops = this.sortedStops();
    if (stops.length === 1) {
      const stop = stops[0];
      const opacity = stop.opacity ?? 1;
      if (opacity < 1) {
        // Convert hex to rgba
        const hex = stop.color;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
          const r = parseInt(result[1], 16);
          const g = parseInt(result[2], 16);
          const b = parseInt(result[3], 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
      }
      return stop.color;
    }
    return 'transparent';
  });

  /** Computed SVG gradient stops */
  gradientStops = computed(() => {
    return this.sortedStops().map(stop => ({
      offset: `${(stop.offset * 100).toFixed(1)}%`,
      color: stop.color,
      opacity: stop.opacity ?? 1
    }));
  });

  /** Unique ID for the gradient definition */
  gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
}
