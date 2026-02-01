import {
  Component,
  input,
  output,
  signal,
  computed,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorStop, createColorStop } from '../models/gradient.models';
import { ColorStopComponent } from '../color-stop/color-stop';

@Component({
  selector: 'ngx-color-stops-holder',
  standalone: true,
  imports: [CommonModule, ColorStopComponent],
  templateUrl: './color-stops-holder.html',
  styleUrl: './color-stops-holder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-color-stops-holder'
  }
})
export class ColorStopsHolderComponent implements AfterViewInit, OnDestroy {
  private elementRef = inject(ElementRef);

  /** The palette of color stops */
  palette = input.required<ColorStop[]>();
  
  /** Width of the holder */
  width = input<number>(320);

  /** Height of the holder (should match palette height) */
  height = input<number>(24);
  
  /** Minimum number of stops (1 = allow solid colors) */
  minStops = input<number>(1);
  
  /** Maximum number of stops */
  maxStops = input<number>(5);
  
  /** Whether interaction is disabled */
  disabled = input<boolean>(false);

  /** Reference to the stops container */
  stopsContainer = viewChild<ElementRef>('stopsContainer');

  /** Emits when palette changes */
  paletteChange = output<ColorStop[]>();
  
  /** Emits when a stop is selected */
  stopSelect = output<ColorStop>();

  /** Currently active stop ID */
  activeStopId = signal<string | null>(null);
  
  /** Currently dragging stop */
  draggingStop = signal<ColorStop | null>(null);

  /** Y position when drag started (for delete detection) */
  dragStartY = signal<number>(0);

  /** Whether the current drag is in delete zone */
  isInDeleteZone = signal<boolean>(false);

  /** Threshold in pixels to trigger delete */
  private readonly DELETE_THRESHOLD = 50;

  /** Current hover position (percentage 0-100), null when not hovering */
  hoverPosition = signal<number | null>(null);

  /** Whether mouse is hovering over container */
  isHovering = signal<boolean>(false);

  /** Computed: whether we can add more stops */
  canAddStop = computed(() => this.palette().length < this.maxStops());
  
  /** Computed: whether we can remove stops */
  canRemoveStop = computed(() => this.palette().length > this.minStops());

  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  ngAfterViewInit(): void {
    // Global listeners for drag
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  onContainerClick(event: MouseEvent): void {
    if (this.disabled() || !this.canAddStop()) return;
    
    // Don't add if clicked on a stop
    const target = event.target as HTMLElement;
    if (target.closest('ngx-color-stop')) return;

    const container = this.stopsContainer();
    if (!container) return;
    
    const rect = container.nativeElement.getBoundingClientRect();
    const offset = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const newColor = this.interpolateColorAtOffset(offset);
    const newStop = createColorStop(offset, newColor);
    
    const newPalette = [...this.palette(), newStop];
    this.paletteChange.emit(newPalette);
    this.selectStop(newStop);
  }

  onContainerMouseMove(event: MouseEvent): void {
    if (this.disabled() || !this.canAddStop() || this.draggingStop()) {
      this.hoverPosition.set(null);
      return;
    }
    
    const target = event.target as HTMLElement;
    if (target.closest('ngx-color-stop')) {
      this.hoverPosition.set(null);
      return;
    }

    const container = this.stopsContainer();
    if (!container) return;
    
    const rect = container.nativeElement.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    this.hoverPosition.set(Math.max(0, Math.min(100, position)));
    this.isHovering.set(true);
  }

  onContainerMouseLeave(): void {
    this.hoverPosition.set(null);
    this.isHovering.set(false);
  }

  onStopSelect(stop: ColorStop): void {
    this.selectStop(stop);
  }

  onStopColorChange(data: { stop: ColorStop; color: string }): void {
    const newPalette = this.palette().map(s => 
      s.id === data.stop.id ? { ...s, color: data.color } : s
    );
    this.paletteChange.emit(newPalette);
  }

  onDragStart(data: { stop: ColorStop; event: MouseEvent | TouchEvent }): void {
    if (this.disabled()) return;
    this.draggingStop.set(data.stop);
    
    // Store initial Y position for delete detection
    const clientY = 'touches' in data.event 
      ? data.event.touches[0].clientY 
      : data.event.clientY;
    this.dragStartY.set(clientY);
    this.isInDeleteZone.set(false);
  }

  onStopDelete(stop: ColorStop): void {
    if (this.disabled() || !this.canRemoveStop()) return;
    
    const newPalette = this.palette().filter(s => s.id !== stop.id);
    this.paletteChange.emit(newPalette);
    
    // Select first stop if deleted was active
    if (this.activeStopId() === stop.id && newPalette.length > 0) {
      this.selectStop(newPalette[0]);
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const dragging = this.draggingStop();
    if (!dragging) return;
    
    event.preventDefault();
    this.updateStopPosition(dragging, event.clientX);
    this.checkDeleteZone(event.clientY);
  }

  private onMouseUp(event: MouseEvent): void {
    this.handleDragEnd(event.clientY);
  }

  private onTouchMove(event: TouchEvent): void {
    const dragging = this.draggingStop();
    if (!dragging) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    this.updateStopPosition(dragging, touch.clientX);
    this.checkDeleteZone(touch.clientY);
  }

  private onTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.handleDragEnd(touch?.clientY ?? 0);
  }

  private updateStopPosition(stop: ColorStop, clientX: number): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const offset = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    
    const newPalette = this.palette().map(s => 
      s.id === stop.id ? { ...s, offset } : s
    );
    
    this.paletteChange.emit(newPalette);
  }

  private checkDeleteZone(clientY: number): void {
    const deltaY = clientY - this.dragStartY();
    const inZone = deltaY > this.DELETE_THRESHOLD && this.canRemoveStop();
    this.isInDeleteZone.set(inZone);
  }

  private handleDragEnd(clientY: number): void {
    const dragging = this.draggingStop();
    
    if (dragging && this.isInDeleteZone()) {
      // Delete the stop
      this.onStopDelete(dragging);
    }
    
    this.draggingStop.set(null);
    this.isInDeleteZone.set(false);
  }

  private getOffsetFromEvent(event: MouseEvent): number {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  }

  private selectStop(stop: ColorStop): void {
    // No longer need to track active state since color picker is on double-click
    this.activeStopId.set(stop.id);
  }

  private interpolateColorAtOffset(offset: number): string {
    const stops = [...this.palette()].sort((a, b) => a.offset - b.offset);
    
    if (stops.length === 0) return '#000000';
    if (stops.length === 1) return stops[0].color;
    
    // Find surrounding stops
    let leftStop = stops[0];
    let rightStop = stops[stops.length - 1];
    
    for (let i = 0; i < stops.length - 1; i++) {
      if (offset >= stops[i].offset && offset <= stops[i + 1].offset) {
        leftStop = stops[i];
        rightStop = stops[i + 1];
        break;
      }
    }
    
    if (leftStop.offset === rightStop.offset) {
      return leftStop.color;
    }
    
    // Interpolate
    const ratio = (offset - leftStop.offset) / (rightStop.offset - leftStop.offset);
    return this.interpolateColor(leftStop.color, rightStop.color, ratio);
  }

  private interpolateColor(color1: string, color2: string, ratio: number): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
    
    return this.rgbToHex(r, g, b);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  trackByStopId(index: number, stop: ColorStop): string {
    return stop.id;
  }
}
