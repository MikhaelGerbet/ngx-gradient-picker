import {
  Component,
  input,
  output,
  signal,
  computed,
  model,
  ElementRef,
  inject,
  HostListener,
  ChangeDetectionStrategy,
  viewChild,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, debounceTime } from 'rxjs';
import {
  ColorStop,
  GradientType,
  GradientDirection,
  GradientConfig,
  DEFAULT_PALETTE,
  generateGradientCSS
} from '../models/gradient.models';
import { GradientPickerComponent } from '../gradient-picker/gradient-picker';

/** Popover position type - 'auto' detects mobile/desktop automatically */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'bottom-sheet' | 'auto';

@Component({
  selector: 'ngx-gradient-picker-popover',
  standalone: true,
  imports: [GradientPickerComponent],
  templateUrl: './gradient-picker-popover.html',
  styleUrl: './gradient-picker-popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-gradient-picker-popover'
  }
})
export class GradientPickerPopoverComponent implements OnInit {
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

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
  
  /** 
   * Popover position
   * - 'auto': Automatically detects device (mobile → bottom-sheet, desktop → bottom popover)
   * - 'top' | 'bottom' | 'left' | 'right': Force popover mode at specified position
   * - 'bottom-sheet': Force bottom-sheet mode (full-width modal from bottom)
   */
  position = input<PopoverPosition>('auto');
  
  /** Close on outside click */
  closeOnOutsideClick = input<boolean>(true);

  /** Emits when a color stop is selected */
  colorStopSelect = output<ColorStop>();
  
  /** Emits when popover opens/closes */
  openChange = output<boolean>();

  /** Reference to the gradient picker */
  gradientPicker = viewChild<GradientPickerComponent>('picker');

  /** Popover open state */
  isOpen = signal(false);
  
  /** Detected mobile state (reactive to resize/orientation) */
  private isMobile = signal(false);
  
  /** Effective position computed from 'auto' detection or explicit value */
  effectivePosition = computed(() => {
    const pos = this.position();
    if (pos !== 'auto') return pos;
    return this.isMobile() ? 'bottom-sheet' : 'bottom';
  });

  /** Computed CSS gradient for trigger preview */
  triggerGradientCSS = computed(() => {
    return generateGradientCSS({
      type: this.type(),
      angle: this.angle(),
      stops: this.palette()
    });
  });

  ngOnInit(): void {
    this.checkMobileDevice();
    
    // Listen for resize/orientation changes to update mobile detection
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize').pipe(
        debounceTime(100),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => this.checkMobileDevice());
    }
  }
  
  /**
   * Check if the current device is mobile (touch device or small screen)
   */
  private checkMobileDevice(): void {
    if (typeof window === 'undefined') {
      this.isMobile.set(false);
      return;
    }
    
    // Detect touch-only devices (no hover capability)
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    // Detect small screens (< 640px width)
    const isSmallScreen = window.innerWidth < 640;
    
    this.isMobile.set(isTouchDevice || isSmallScreen);
  }

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    this.openChange.emit(this.isOpen());
  }

  open(): void {
    if (this.disabled()) return;
    this.isOpen.set(true);
    this.openChange.emit(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.openChange.emit(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.closeOnOutsideClick() || !this.isOpen()) return;
    
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  onPaletteChange(newPalette: ColorStop[]): void {
    this.palette.set(newPalette);
  }

  onStopSelect(stop: ColorStop): void {
    this.colorStopSelect.emit(stop);
  }

  /**
   * Update the color of the currently selected stop
   */
  updateSelectedStopColor(color: string): void {
    this.gradientPicker()?.updateSelectedStopColor(color);
  }

  /**
   * Get the current gradient CSS
   */
  getGradientCSS(): string {
    return this.gradientPicker()?.getGradientCSS() ?? this.triggerGradientCSS();
  }

  /**
   * Get the full gradient configuration
   */
  getGradientConfig(): GradientConfig | null {
    return this.gradientPicker()?.getGradientConfig() ?? null;
  }
}
