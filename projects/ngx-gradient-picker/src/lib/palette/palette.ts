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
