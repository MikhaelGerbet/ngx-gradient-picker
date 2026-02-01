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
  
  /** Minimum number of color stops (1 = allow solid colors) */
  minStops = input<number>(1);
  
  /** Maximum number of color stops */
  maxStops = input<number>(50);
  
  /** Layout direction */
  direction = input<GradientDirection>('horizontal');
  
  /** Gradient type (linear/radial/conic/repeating-*) */
  type = model<GradientType>('linear');
  
  /** Gradient angle (for linear and conic gradients) */
  angle = model<number>(90);
  
  /** 
   * Size of repeating pattern (1-100%). Only applies to repeating-* types.
   * E.g., 25 means the pattern repeats 4 times.
   */
  repeatSize = model<number>(100);

  /** Is currently dragging the repeat marker */
  isRepeatDragging = signal(false);
  
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

  /** Computed: whether the current type is repeating */
  isRepeating = computed(() => this.type().startsWith('repeating-'));

  /** Computed: the current gradient configuration */
  gradientConfig = computed<GradientConfig>(() => ({
    type: this.type(),
    angle: this.angle(),
    stops: this.palette(),
    repeatSize: this.repeatSize()
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

  /**
   * Get the opacity of the currently selected stop as percentage (0-100)
   */
  getSelectedStopOpacity(): number {
    const selected = this.selectedStop();
    return selected ? Math.round((selected.opacity ?? 1) * 100) : 100;
  }

  /**
   * Get the background gradient for the opacity slider
   */
  getOpacitySliderBg(): string {
    const selected = this.selectedStop();
    if (!selected) return 'transparent';
    const color = selected.color;
    return `linear-gradient(to right, transparent, ${color})`;
  }

  /**
   * Handle opacity slider change
   */
  onOpacityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const opacity = parseInt(input.value, 10) / 100;
    this.updateSelectedStopOpacity(opacity);
    
    // Update selected stop reference with new opacity
    const selected = this.selectedStop();
    if (selected) {
      const updated = this.palette().find(s => s.id === selected.id);
      if (updated) {
        this.selectedStop.set(updated);
      }
    }
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

  // Repeat marker drag handling
  private repeatMarkerContainer: HTMLElement | null = null;
  private boundRepeatMouseMove = this.onRepeatMouseMove.bind(this);
  private boundRepeatMouseUp = this.onRepeatMouseUp.bind(this);
  private boundRepeatTouchMove = this.onRepeatTouchMove.bind(this);
  private boundRepeatTouchEnd = this.onRepeatTouchEnd.bind(this);

  onRepeatMarkerMouseDown(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    
    this.repeatMarkerContainer = (event.currentTarget as HTMLElement).closest('.gradient-picker-body');
    this.isRepeatDragging.set(true);
    this.updateRepeatFromEvent(event);
    this.addRepeatListeners();
  }

  onRepeatMarkerTouchStart(event: TouchEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    
    this.repeatMarkerContainer = (event.currentTarget as HTMLElement).closest('.gradient-picker-body');
    this.isRepeatDragging.set(true);
    this.updateRepeatFromTouch(event);
    this.addRepeatListeners();
  }

  private onRepeatMouseMove(event: MouseEvent): void {
    if (!this.isRepeatDragging()) return;
    event.preventDefault();
    this.updateRepeatFromEvent(event);
  }

  private onRepeatMouseUp(): void {
    this.isRepeatDragging.set(false);
    this.removeRepeatListeners();
  }

  private onRepeatTouchMove(event: TouchEvent): void {
    if (!this.isRepeatDragging()) return;
    event.preventDefault();
    this.updateRepeatFromTouch(event);
  }

  private onRepeatTouchEnd(): void {
    this.isRepeatDragging.set(false);
    this.removeRepeatListeners();
  }

  private updateRepeatFromEvent(event: MouseEvent): void {
    if (!this.repeatMarkerContainer) return;
    const rect = this.repeatMarkerContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    this.repeatSize.set(Math.max(5, Math.min(100, percentage)));
  }

  private updateRepeatFromTouch(event: TouchEvent): void {
    if (!this.repeatMarkerContainer || event.touches.length === 0) return;
    const touch = event.touches[0];
    const rect = this.repeatMarkerContainer.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    this.repeatSize.set(Math.max(5, Math.min(100, percentage)));
  }

  private addRepeatListeners(): void {
    document.addEventListener('mousemove', this.boundRepeatMouseMove);
    document.addEventListener('mouseup', this.boundRepeatMouseUp);
    document.addEventListener('touchmove', this.boundRepeatTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundRepeatTouchEnd);
  }

  private removeRepeatListeners(): void {
    document.removeEventListener('mousemove', this.boundRepeatMouseMove);
    document.removeEventListener('mouseup', this.boundRepeatMouseUp);
    document.removeEventListener('touchmove', this.boundRepeatTouchMove);
    document.removeEventListener('touchend', this.boundRepeatTouchEnd);
  }
}
