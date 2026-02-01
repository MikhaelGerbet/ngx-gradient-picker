import {
  Component,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnDestroy,
  model
} from '@angular/core';

@Component({
  selector: 'ngx-angle-picker',
  standalone: true,
  imports: [],
  templateUrl: './angle-picker.html',
  styleUrl: './angle-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-angle-picker'
  }
})
export class AnglePickerComponent implements OnDestroy {
  /** Current angle in degrees (0-360) */
  angle = model<number>(90);
  
  /** Size of the picker in pixels */
  size = input<number>(48);
  
  /** Whether the picker is disabled */
  disabled = input<boolean>(false);

  /** Is currently dragging */
  isDragging = signal(false);

  /** Computed rotation style */
  rotationStyle = computed(() => `rotate(${this.angle()}deg)`);

  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);
  private dialElement: HTMLElement | null = null;

  ngOnDestroy(): void {
    this.removeGlobalListeners();
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    
    this.dialElement = (event.currentTarget as HTMLElement);
    this.isDragging.set(true);
    this.updateAngleFromEvent(event);
    this.addGlobalListeners();
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    
    this.dialElement = (event.currentTarget as HTMLElement);
    this.isDragging.set(true);
    this.updateAngleFromTouch(event);
    this.addGlobalListeners();
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    event.preventDefault();
    this.updateAngleFromEvent(event);
  }

  private onMouseUp(): void {
    this.isDragging.set(false);
    this.removeGlobalListeners();
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging()) return;
    event.preventDefault();
    this.updateAngleFromTouch(event);
  }

  private onTouchEnd(): void {
    this.isDragging.set(false);
    this.removeGlobalListeners();
  }

  private updateAngleFromEvent(event: MouseEvent): void {
    if (!this.dialElement) return;
    
    const rect = this.dialElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = this.calculateAngle(event.clientX, event.clientY, centerX, centerY);
    this.angle.set(angle);
  }

  private updateAngleFromTouch(event: TouchEvent): void {
    if (!this.dialElement || event.touches.length === 0) return;
    
    const touch = event.touches[0];
    const rect = this.dialElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = this.calculateAngle(touch.clientX, touch.clientY, centerX, centerY);
    this.angle.set(angle);
  }

  private calculateAngle(x: number, y: number, centerX: number, centerY: number): number {
    const dx = x - centerX;
    const dy = y - centerY;
    
    // Calculate angle in radians and convert to degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Adjust so 0 is at top and increases clockwise
    angle = (angle + 90 + 360) % 360;
    
    // Snap to common angles (0, 45, 90, 135, 180, 225, 270, 315) with 5° tolerance
    const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
    const snapTolerance = 5;
    
    for (const snapAngle of snapAngles) {
      if (Math.abs(angle - snapAngle) <= snapTolerance) {
        return snapAngle === 360 ? 0 : snapAngle;
      }
    }
    
    return Math.round(angle);
  }

  private addGlobalListeners(): void {
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }
}
