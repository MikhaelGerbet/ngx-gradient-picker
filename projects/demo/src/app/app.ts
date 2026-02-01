import { Component, signal, viewChild, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import {
  GradientPickerComponent,
  GradientPickerPopoverComponent,
  ColorStop,
  createColorStop,
  GradientType,
  parseGradientCSS
} from 'ngx-gradient-picker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, JsonPipe, GradientPickerComponent, GradientPickerPopoverComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private fb = inject(FormBuilder);
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
  
  // Popover Auto mode - Linear gradient
  popoverAutoPalette = signal<ColorStop[]>([
    createColorStop(0, '#667eea'),
    createColorStop(1, '#764ba2')
  ]);
  popoverAutoAngle = signal(90);
  popoverAutoType = signal<GradientType>('linear');
  
  // Popover Force mode - Radial gradient
  popoverForcePalette = signal<ColorStop[]>([
    createColorStop(0, '#f093fb'),
    createColorStop(0.5, '#f5576c'),
    createColorStop(1, '#4facfe')
  ]);
  popoverForceAngle = signal(0);
  popoverForceType = signal<GradientType>('radial');
  
  // Bottom-sheet state - Conic gradient
  bottomSheetPalette = signal<ColorStop[]>([
    createColorStop(0, '#ff6b6b'),
    createColorStop(0.25, '#feca57'),
    createColorStop(0.5, '#48dbfb'),
    createColorStop(0.75, '#ff9ff3'),
    createColorStop(1, '#ff6b6b')
  ]);
  bottomSheetAngle = signal(0);
  bottomSheetType = signal<GradientType>('conic');
  
  // Reactive Forms demo state
  reactiveFormPalette = signal<ColorStop[]>([
    createColorStop(0, '#11998e'),
    createColorStop(1, '#38ef7d')
  ]);
  reactiveFormAngle = signal(90);
  reactiveFormType = signal<GradientType>('linear');
  
  // The actual reactive form
  themeForm: FormGroup = this.fb.group({
    themeName: ['My Gradient Theme'],
    primaryColor: ['#11998e'],
    secondaryColor: ['#38ef7d']
  });
  
  // Computed CSS for reactive form preview
  reactiveFormCSS = computed(() => {
    const palette = this.reactiveFormPalette();
    const angle = this.reactiveFormAngle();
    const type = this.reactiveFormType();
    const stops = [...palette].sort((a, b) => a.offset - b.offset)
      .map(s => `${s.color} ${Math.round(s.offset * 100)}%`).join(', ');
    
    switch (type) {
      case 'radial':
        return `radial-gradient(circle, ${stops})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${stops})`;
      default:
        return `linear-gradient(${angle}deg, ${stops})`;
    }
  });
  
  // Auto-detect dialog state
  autoDetectDialogOpen = signal(false);
  autoDetectPalette = signal<ColorStop[]>([]);
  autoDetectAngle = signal(0);
  autoDetectType = signal<GradientType>('linear');
  autoDetectRepeatSize = signal(100);
  
  // Auto-detection examples
  readonly autoDetectExamples = [
    {
      label: 'Linear Gradient',
      input: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Standard linear gradient with angle'
    },
    {
      label: 'Radial Gradient',
      input: 'radial-gradient(circle, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
      description: 'Circular radial gradient'
    },
    {
      label: 'Conic Gradient',
      input: 'conic-gradient(from 45deg, #ff6b6b, #feca57, #48dbfb, #ff6b6b)',
      description: 'Conic (camembert) gradient'
    },
    {
      label: 'Solid Color',
      input: '#3498db',
      description: 'Single hex color parsed as one stop'
    },
    {
      label: 'Repeating Linear',
      input: 'repeating-linear-gradient(45deg, #ee7752 0%, #e73c7e 25%, #23a6d5 50%, #23d5ab 75%)',
      description: 'Repeating linear pattern'
    },
    {
      label: 'Repeating Radial',
      input: 'repeating-radial-gradient(circle, #667eea 0%, #764ba2 20%)',
      description: 'Repeating radial pattern'
    }
  ];
  
  openAutoDetectPicker(cssInput: string): void {
    const result = parseGradientCSS(cssInput);
    if (result && result.stops.length > 0) {
      this.autoDetectPalette.set(result.stops);
      this.autoDetectAngle.set(result.angle);
      this.autoDetectType.set(result.type);
      this.autoDetectRepeatSize.set(result.repeatSize ?? 100);
      this.autoDetectDialogOpen.set(true);
    }
  }
  
  closeAutoDetectDialog(): void {
    this.autoDetectDialogOpen.set(false);
  }
  
  getAutoDetectDialogCSS(): string {
    const palette = this.autoDetectPalette();
    const angle = this.autoDetectAngle();
    const type = this.autoDetectType();
    const repeatSize = this.autoDetectRepeatSize();
    const isRepeating = type.startsWith('repeating-');
    const scaleFactor = isRepeating ? repeatSize / 100 : 1;
    
    const stops = [...palette].sort((a, b) => a.offset - b.offset)
      .map(s => `${s.color} ${Math.round(s.offset * scaleFactor * 100)}%`).join(', ');
    
    switch (type) {
      case 'radial':
        return `radial-gradient(circle, ${stops})`;
      case 'repeating-radial':
        return `repeating-radial-gradient(circle, ${stops})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${stops})`;
      case 'repeating-conic':
        return `repeating-conic-gradient(from ${angle}deg, ${stops})`;
      case 'repeating-linear':
        return `repeating-linear-gradient(${angle}deg, ${stops})`;
      default:
        return `linear-gradient(${angle}deg, ${stops})`;
    }
  }
  
  getAutoDetectResult(input: string): { type: string; angle: number; stops: number } {
    const result = parseGradientCSS(input);
    if (result) {
      return { type: result.type, angle: result.angle, stops: result.stops.length };
    }
    return { type: 'unknown', angle: 0, stops: 0 };
  }
  
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

type GradientType = 
  | 'linear' 
  | 'radial' 
  | 'conic'
  | 'repeating-linear'
  | 'repeating-radial'
  | 'repeating-conic';`;

  readonly helperFunctionsCode = `import { 
  createColorStop, 
  paletteToCSS,
  parseGradientCSS,
  generateStopId 
} from 'ngx-gradient-picker';

// Create a new color stop
const stop = createColorStop(0.5, '#ff0000');
// { id: 'abc123', offset: 0.5, color: '#ff0000' }

// Generate CSS from palette
const css = paletteToCSS(palette, 90, 'linear');
// 'linear-gradient(90deg, #ff0000 0%, #00ff00 100%)'

// Parse CSS to get gradient config (auto-detection)
const config = parseGradientCSS('linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 100%)');
// { type: 'linear', angle: 45, stops: [...] }`;
  
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
