import {
  Component,
  input,
  output,
  computed,
  signal,
  HostListener,
  ChangeDetectionStrategy,
  viewChild,
  ElementRef
} from '@angular/core';
import { ColorStop } from '../models/gradient.models';

@Component({
  selector: 'ngx-color-stop',
  standalone: true,
  imports: [],
  templateUrl: './color-stop.html',
  styleUrl: './color-stop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-color-stop',
    '[class.dragging]': 'isDragging()',
    '[class.deleting]': 'isBeingDeleted()',
    '[class.new]': 'isNew()',
    '[style.left.%]': 'positionPercent()',
    '(mousedown)': 'onMouseDown($event)',
    '(touchstart)': 'onTouchStart($event)'
  }
})
export class ColorStopComponent {
  /** Reference to color input */
  colorInput = viewChild<ElementRef<HTMLInputElement>>('colorInput');

  /** The color stop data */
  stop = input.required<ColorStop>();
  
  /** Whether dragging is disabled */
  disabled = input<boolean>(false);

  /** Whether this stop is being deleted (dragged to delete zone) */
  isBeingDeleted = input<boolean>(false);

  /** Whether this stop was just added (for animation) */
  isNew = input<boolean>(false);

  /** Emits when the stop is selected */
  stopSelect = output<ColorStop>();
  
  /** Emits when dragging starts */
  dragStart = output<{ stop: ColorStop; event: MouseEvent | TouchEvent }>();
  
  /** Emits when the stop should be deleted */
  delete = output<ColorStop>();

  /** Emits when color changes */
  colorChange = output<{ stop: ColorStop; color: string }>();

  /** Internal dragging state */
  isDragging = signal(false);

  /** Computed position as percentage */
  positionPercent = computed(() => this.stop().offset * 100);

  /** Computed background color */
  backgroundColor = computed(() => this.stop().color);

  onMouseDown(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    
    this.stopSelect.emit(this.stop());
    this.isDragging.set(true);
    this.dragStart.emit({ stop: this.stop(), event });
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    
    this.stopSelect.emit(this.stop());
    this.isDragging.set(true);
    this.dragStart.emit({ stop: this.stop(), event });
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    
    // Open color picker on double-click
    const input = this.colorInput();
    if (input) {
      input.nativeElement.click();
    }
  }

  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.colorChange.emit({ stop: this.stop(), color: input.value });
  }

  endDrag(): void {
    this.isDragging.set(false);
  }
}
