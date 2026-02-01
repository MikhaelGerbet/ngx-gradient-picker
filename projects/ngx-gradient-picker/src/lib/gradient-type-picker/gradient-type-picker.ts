import {
  Component,
  input,
  model,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradientType } from '../models/gradient.models';

@Component({
  selector: 'ngx-gradient-type-picker',
  standalone: true,
  imports: [CommonModule],
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

  toggle(): void {
    if (this.disabled()) return;
    this.type.set(this.type() === 'linear' ? 'radial' : 'linear');
  }
}
