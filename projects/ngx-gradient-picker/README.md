#  ngx-gradient-picker

A modern Angular gradient picker component with draggable color stops, circular angle picker, and full two-way binding support.

[![npm version](https://img.shields.io/npm/v/ngx-gradient-picker.svg)](https://www.npmjs.com/package/ngx-gradient-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-17%2B-dd0031.svg)](https://angular.io/)
[![Bundle Size](https://img.shields.io/badge/gzip-~15KB-brightgreen.svg)](https://bundlephobia.com/package/ngx-gradient-picker)
[![Tests](https://img.shields.io/badge/tests-13%20passing-brightgreen.svg)](https://github.com/MikhaelGerbet/ngx-gradient-picker)

**[📺 Live Demo](https://mikhaelgerbet.github.io/ngx-gradient-picker/)**

<p align="center">
  <img src="docs/images/preview.png" alt="ngx-gradient-picker preview" width="600">
</p>

##  Features

-  **Draggable color stops** with smooth animations
-  **Click to add** new stops on the gradient bar
-  **Drag down to delete** stops
-  **Double-click** to open native color picker
-  **Circular angle picker** for linear gradients
-  **Linear & Radial** gradient support
-  **Angular Signals** for optimal performance
-  **Standalone components** - no module needed
-  **Two-way binding** with `[(palette)]`, `[(angle)]`, `[(type)]`
-  **Works with Reactive Forms**
-  **Fully customizable** dimensions
-  **🚫 Zero external dependencies** - only Angular core

##  Installation

```bash
npm install ngx-gradient-picker
```

or with yarn:

```bash
yarn add ngx-gradient-picker
```

or with pnpm:

```bash
pnpm add ngx-gradient-picker
```

##  Quick Start

### Basic Usage

```typescript
import { Component, signal } from '@angular/core';
import { GradientPickerComponent, ColorStop, createColorStop } from 'ngx-gradient-picker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [GradientPickerComponent],
  template: `
    <ngx-gradient-picker
      [(palette)]="palette"
      [(angle)]="angle"
      [(type)]="type"
      [width]="350"
      [paletteHeight]="32"/>
  `
})
export class ExampleComponent {
  palette = signal<ColorStop[]>([
    createColorStop(0, '#ff6b6b'),
    createColorStop(0.5, '#4ecdc4'),
    createColorStop(1, '#45b7d1')
  ]);
  angle = signal(90);
  type = signal<'linear' | 'radial'>('linear');
}
```

### Popover Mode

Perfect for forms and compact UIs:

```typescript
import { GradientPickerPopoverComponent } from 'ngx-gradient-picker';

@Component({
  imports: [GradientPickerPopoverComponent],
  template: `
    <ngx-gradient-picker-popover
      [(palette)]="palette"
      [(angle)]="angle"
      [position]="'bottom'"/>
  `
})
```

### Get CSS Output

```typescript
import { Component, viewChild } from '@angular/core';
import { GradientPickerComponent, paletteToCSS } from 'ngx-gradient-picker';

@Component({
  template: `
    <ngx-gradient-picker #picker [(palette)]="palette" [(angle)]="angle"/>
    <div [style.background]="gradientCSS">Preview</div>
  `
})
export class ExampleComponent {
  picker = viewChild<GradientPickerComponent>('picker');
  
  // Option 1: Use the component method
  get gradientCSS() {
    return this.picker()?.getGradientCSS() ?? '';
  }
  
  // Option 2: Use the utility function
  get gradientCSS2() {
    return paletteToCSS(this.palette(), this.angle(), 'linear');
  }
}
```

##  With Reactive Forms

The component implements `ControlValueAccessor`, so it works directly with Angular forms:

```typescript
import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GradientPickerComponent, ColorStop, createColorStop } from 'ngx-gradient-picker';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, GradientPickerComponent],
  template: `
    <form [formGroup]="form">
      <!-- formControlName binds the CSS output directly -->
      <ngx-gradient-picker
        formControlName="gradient"
        [(palette)]="palette"
        [(angle)]="angle"/>
      
      <div [style.background]="form.get('gradient')?.value">
        Preview
      </div>
    </form>
  `
})
export class FormComponent {
  private fb = inject(FormBuilder);
  
  palette = signal<ColorStop[]>([
    createColorStop(0, '#667eea'),
    createColorStop(1, '#764ba2')
  ]);
  angle = signal(90);
  
  // The CSS string is automatically synced to the form control
  form = this.fb.group({
    gradient: ['']
  });
}
```

##  API Reference

### GradientPickerComponent

The component implements `ControlValueAccessor` - the form value is the CSS gradient string.

| Input/Output | Type | Default | Description |
|--------------|------|---------|-------------|
| `[(palette)]` | `ColorStop[]` | `[]` | Two-way binding for color stops |
| `[(angle)]` | `number` | `90` | Gradient angle (0-360 deg) |
| `[(type)]` | `'linear' \| 'radial'` | `'linear'` | Gradient type |
| `[width]` | `number` | `300` | Picker width in pixels |
| `[paletteHeight]` | `number` | `24` | Gradient bar height |
| `[minStops]` | `number` | `2` | Minimum color stops |
| `[maxStops]` | `number` | `10` | Maximum color stops |
| `(stopSelect)` | `EventEmitter<ColorStop>` | - | Emitted when a stop is selected |
| `formControlName` | `string` | - | Binds CSS output to form control |

### GradientPickerPopoverComponent

| Input/Output | Type | Default | Description |
|--------------|------|---------|-------------|
| `[(palette)]` | `ColorStop[]` | `[]` | Two-way binding for color stops |
| `[(angle)]` | `number` | `90` | Gradient angle |
| `[width]` | `number` | `300` | Picker width |
| `[position]` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Popover position |

### ColorStop Interface

```typescript
interface ColorStop {
  id: string;       // Unique identifier
  offset: number;   // Position (0 to 1)
  color: string;    // Hex color value (#rrggbb)
  opacity?: number; // Optional opacity (0 to 1)
}
```

### Helper Functions

```typescript
import { 
  createColorStop, 
  paletteToCSS,
  generateStopId,
  sortStopsByOffset,
  generateGradientCSS
} from 'ngx-gradient-picker';

// Create a new color stop
const stop = createColorStop(0.5, '#ff0000');
// { id: 'stop-xxx', offset: 0.5, color: '#ff0000', opacity: 1 }

// Generate CSS from palette
const css = paletteToCSS(palette, 90, 'linear');
// 'linear-gradient(90deg, #ff0000 0%, #00ff00 100%)'
```

##  User Interactions

| Action | Effect |
|--------|--------|
| **Click** on gradient bar | Add new color stop |
| **Drag** a stop horizontally | Reposition the stop |
| **Drag** a stop down | Delete the stop (if > minStops) |
| **Double-click** a stop | Open native color picker |
| **Drag** angle picker | Change gradient angle |
| **Click** Linear/Radial | Toggle gradient type |

##  Angular Compatibility

| ngx-gradient-picker | Angular |
|---------------------|---------|
| 1.x | 17.x, 18.x, 19.x, 20.x |

##  Demo

**[📺 Try the live demo](https://mikhaelgerbet.github.io/ngx-gradient-picker/)**

##  Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- How to submit bug reports and feature requests
- How to set up the development environment
- Code style guidelines
- Pull request process

##  License

MIT © [Mikhaël GERBET](https://github.com/MikhaelGerbet)
