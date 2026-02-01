import { Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  GradientPickerComponent,
  GradientPickerPopoverComponent,
  ColorStop,
  createColorStop,
  GradientType
} from 'ngx-gradient-picker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, GradientPickerComponent, GradientPickerPopoverComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentYear = new Date().getFullYear();
  
  // Inline picker state
  palette = signal<ColorStop[]>([
    createColorStop(0, '#ff6b6b'),
    createColorStop(0.5, '#4ecdc4'),
    createColorStop(1, '#45b7d1')
  ]);
  
  angle = signal(135);
  type = signal<GradientType>('linear');
  selectedStop = signal<ColorStop | null>(null);
  colorInput = signal('#ff6b6b');
  
  // Popover state
  popoverPalette = signal<ColorStop[]>([
    createColorStop(0, '#667eea'),
    createColorStop(1, '#764ba2')
  ]);
  popoverAngle = signal(90);
  
  // Reference to picker
  gradientPicker = viewChild<GradientPickerComponent>('picker');
  
  // Code examples for documentation
  readonly basicUsageCode = `import { Component, signal } from '@angular/core';
import { 
  GradientPickerComponent,
  ColorStop,
  createColorStop 
} from 'ngx-gradient-picker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [GradientPickerComponent],
  template: \`
    <ngx-gradient-picker
      [(palette)]="palette"
      [(angle)]="angle"
      [(type)]="type"
      [width]="350"
      [paletteHeight]="32"/>
  \`
})
export class ExampleComponent {
  palette = signal<ColorStop[]>([
    createColorStop(0, '#ff6b6b'),
    createColorStop(0.5, '#4ecdc4'),
    createColorStop(1, '#45b7d1')
  ]);
  angle = signal(90);
  type = signal<'linear' | 'radial'>('linear');
}`;

  readonly basicTemplateCode = `<ngx-gradient-picker
  [(palette)]="palette"
  [(angle)]="angle"
  [(type)]="type"
  [width]="350"
  [paletteHeight]="32"
  [minStops]="2"
  [maxStops]="8"/>

<!-- Popover mode -->
<ngx-gradient-picker-popover
  [(palette)]="palette"
  [(angle)]="angle"
  [position]="'bottom'"/>`;

  readonly reactiveFormCode = `import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GradientPickerComponent, ColorStop, createColorStop } from 'ngx-gradient-picker';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, GradientPickerComponent],
  templateUrl: './form.component.html'
})
export class FormComponent {
  private fb = inject(FormBuilder);
  
  // Gradient picker signals
  palette = signal<ColorStop[]>([
    createColorStop(0, '#667eea'),
    createColorStop(1, '#764ba2')
  ]);
  angle = signal(90);
  
  // The gradient picker implements ControlValueAccessor
  // so it automatically syncs to the form control
  form = this.fb.group({
    name: ['', Validators.required],
    gradient: ['']
  });
}`;

  readonly reactiveFormTemplateCode = `<form [formGroup]="form">
  <label>
    Name
    <input formControlName="name" />
  </label>

  <label>Background Gradient</label>
  <!-- formControlName binds the CSS output directly -->
  <ngx-gradient-picker
    formControlName="gradient"
    [(palette)]="palette"
    [(angle)]="angle"/>
  
  <!-- Preview with form value -->
  <div 
    class="preview" 
    [style.background]="form.get('gradient')?.value">
  </div>
  
  <button type="submit">Save</button>
</form>`;

  readonly colorStopInterface = `interface ColorStop {
  id: string;           // Unique identifier
  offset: number;       // Position (0 to 1)
  color: string;        // Hex color value
}

type GradientType = 'linear' | 'radial';`;

  readonly helperFunctionsCode = `import { 
  createColorStop, 
  paletteToCSS,
  generateStopId 
} from 'ngx-gradient-picker';

// Create a new color stop
const stop = createColorStop(0.5, '#ff0000');
// { id: 'abc123', offset: 0.5, color: '#ff0000' }

// Generate CSS from palette
const css = paletteToCSS(palette, 90, 'linear');
// 'linear-gradient(90deg, #ff0000 0%, #00ff00 100%)'`;
  
  onStopSelect(stop: ColorStop): void {
    this.selectedStop.set(stop);
    this.colorInput.set(stop.color);
  }
  
  onColorInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.colorInput.set(input.value);
    this.gradientPicker()?.updateSelectedStopColor(input.value);
  }
  
  getGradientCSS(): string {
    return this.gradientPicker()?.getGradientCSS() ?? '';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }
}
