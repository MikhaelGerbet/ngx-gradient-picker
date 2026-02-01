import {
  Component,
  input,
  model,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { GradientType } from '../models/gradient.models';

/** Base gradient types (without repeating) */
type BaseGradientType = 'linear' | 'radial' | 'conic';

@Component({
  selector: 'ngx-gradient-type-picker',
  standalone: true,
  imports: [],
  templateUrl: './gradient-type-picker.html',
  styleUrl: './gradient-type-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngx-gradient-type-picker'
  }
})
export class GradientTypePickerComponent {
  /** Current gradient type */
  type = model<GradientType>('linear');
  
  /** Whether the picker is disabled */
  disabled = input<boolean>(false);

  /** Base type (without repeating prefix) */
  baseType = computed<BaseGradientType>(() => {
    const t = this.type();
    if (t.startsWith('repeating-')) {
      return t.replace('repeating-', '') as BaseGradientType;
    }
    return t as BaseGradientType;
  });

  /** Whether repeating is enabled */
  isRepeating = computed(() => this.type().startsWith('repeating-'));

  /** Cycle through base types: linear → radial → conic → linear */
  cycleType(): void {
    if (this.disabled()) return;
    
    const current = this.baseType();
    const repeating = this.isRepeating();
    let next: BaseGradientType;
    
    switch (current) {
      case 'linear': next = 'radial'; break;
      case 'radial': next = 'conic'; break;
      case 'conic': next = 'linear'; break;
      default: next = 'linear';
    }
    
    this.type.set(repeating ? `repeating-${next}` as GradientType : next);
  }

  /** Toggle repeating mode */
  toggleRepeating(): void {
    if (this.disabled()) return;
    
    const base = this.baseType();
    const repeating = this.isRepeating();
    
    this.type.set(repeating ? base : `repeating-${base}` as GradientType);
  }
}
