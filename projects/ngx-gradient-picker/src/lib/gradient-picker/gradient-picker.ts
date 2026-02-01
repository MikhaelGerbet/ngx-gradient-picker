import {
  Component,
  input,
  output,
  signal,
  computed,
  model,
  effect,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ColorStop,
  GradientType,
  GradientDirection,
  GradientConfig,
  DEFAULT_PALETTE,
  generateGradientCSS,
  sortStopsByOffset
} from '../models/gradient.models';
import { PaletteComponent } from '../palette/palette';
import { ColorStopsHolderComponent } from '../color-stops-holder/color-stops-holder';
import { AnglePickerComponent } from '../angle-picker/angle-picker';
import { GradientTypePickerComponent } from '../gradient-type-picker/gradient-type-picker';

@Component({
  selector: 'ngx-gradient-picker',
  standalone: true,
  imports: [
    CommonModule,
    PaletteComponent,
    ColorStopsHolderComponent,
    AnglePickerComponent,
    GradientTypePickerComponent
  ],
  templateUrl: './gradient-picker.html',
  styleUrl: './gradient-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-gradient-picker',
    '[class.horizontal]': 'direction() === "horizontal"',
    '[class.vertical]': 'direction() === "vertical"'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GradientPickerComponent),
      multi: true
    }
  ]
})
export class GradientPickerComponent implements ControlValueAccessor {
  /** The color stops palette */
  palette = model<ColorStop[]>(DEFAULT_PALETTE);
  
  /** Width of the gradient picker */
  width = input<number>(320);
  
  /** Height of the palette bar */
  paletteHeight = input<number>(32);
  
  /** Minimum number of color stops */
  minStops = input<number>(2);
  
  /** Maximum number of color stops */
  maxStops = input<number>(5);
  
  /** Layout direction */
  direction = input<GradientDirection>('horizontal');
  
  /** Gradient type (linear/radial) */
  type = model<GradientType>('linear');
  
  /** Gradient angle (for linear gradients) */
  angle = model<number>(90);
  
  /** Whether to show the angle picker */
  showAnglePicker = input<boolean>(true);
  
  /** Whether to show the type picker */
  showTypePicker = input<boolean>(true);
  
  /** Whether the picker is disabled */
  disabled = input<boolean>(false);

  /** Emits when a color stop is selected */
  colorStopSelect = output<ColorStop>();

  /** Currently selected stop */
  selectedStop = signal<ColorStop | null>(null);

  /** Computed: whether a stop is selected */
  hasSelectedStop = computed(() => this.selectedStop() !== null);

  /** Computed: the current gradient configuration */
  gradientConfig = computed<GradientConfig>(() => ({
    type: this.type(),
    angle: this.angle(),
    stops: this.palette()
  }));

  /** Computed: CSS gradient string for preview */
  gradientCSS = computed(() => generateGradientCSS(this.gradientConfig()));

  /** Computed: sorted palette */
  sortedPalette = computed(() => sortStopsByOffset(this.palette()));

  onPaletteChange(newPalette: ColorStop[]): void {
    this.palette.set(newPalette);
    
    // Update selected stop reference if it exists
    const selected = this.selectedStop();
    if (selected) {
      const updatedStop = newPalette.find(s => s.id === selected.id);
      if (updatedStop) {
        this.selectedStop.set(updatedStop);
      }
    }
  }

  onStopSelect(stop: ColorStop): void {
    this.selectedStop.set(stop);
    this.colorStopSelect.emit(stop);
  }

  /**
   * Update the color of the currently selected stop
   * This method can be called from external color pickers
   */
  updateSelectedStopColor(color: string): void {
    const selected = this.selectedStop();
    if (!selected) return;
    
    const newPalette = this.palette().map(s => 
      s.id === selected.id ? { ...s, color } : s
    );
    this.palette.set(newPalette);
    
    // Update selected stop reference
    const updatedStop = newPalette.find(s => s.id === selected.id);
    if (updatedStop) {
      this.selectedStop.set(updatedStop);
    }
  }

  /**
   * Update the opacity of the currently selected stop
   */
  updateSelectedStopOpacity(opacity: number): void {
    const selected = this.selectedStop();
    if (!selected) return;
    
    const newPalette = this.palette().map(s => 
      s.id === selected.id ? { ...s, opacity: Math.max(0, Math.min(1, opacity)) } : s
    );
    this.palette.set(newPalette);
  }

  /**
   * Get the current gradient as CSS string
   */
  getGradientCSS(): string {
    return this.gradientCSS();
  }

  /**
   * Get the full gradient configuration
   */
  getGradientConfig(): GradientConfig {
    return this.gradientConfig();
  }

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Sync CSS value changes to form control
    effect(() => {
      const css = this.gradientCSS();
      this.onChange(css);
    });
  }

  writeValue(value: string): void {
    // The component manages its own state via palette/angle/type
    // External CSS string is not parsed back (one-way to form)
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // disabled is an input, can't set it directly
    // but the form will handle disabled state
  }
}
