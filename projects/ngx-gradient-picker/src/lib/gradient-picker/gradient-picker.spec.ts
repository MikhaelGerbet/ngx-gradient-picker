import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GradientPickerComponent } from './gradient-picker';
import { createColorStop, DEFAULT_PALETTE } from '../models/gradient.models';

describe('GradientPickerComponent', () => {
  let component: GradientPickerComponent;
  let fixture: ComponentFixture<GradientPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientPickerComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(GradientPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default palette', () => {
    expect(component.palette()).toEqual(DEFAULT_PALETTE);
  });

  it('should have default width of 320', () => {
    expect(component.width()).toBe(320);
  });

  it('should have default palette height of 32', () => {
    expect(component.paletteHeight()).toBe(32);
  });

  it('should have default min stops of 1 (allows solid colors)', () => {
    expect(component.minStops()).toBe(1);
  });

  it('should have default max stops of 5', () => {
    expect(component.maxStops()).toBe(5);
  });

  it('should have default type of linear', () => {
    expect(component.type()).toBe('linear');
  });

  it('should have default angle of 90', () => {
    expect(component.angle()).toBe(90);
  });

  it('should generate gradient CSS', () => {
    const css = component.getGradientCSS();
    expect(css).toContain('linear-gradient');
    expect(css).toContain('90deg');
  });

  it('should return gradient config', () => {
    const config = component.getGradientConfig();
    expect(config.type).toBe('linear');
    expect(config.angle).toBe(90);
    expect(config.stops).toEqual(DEFAULT_PALETTE);
  });

  it('should update palette on paletteChange', () => {
    const newPalette = [
      createColorStop(0, '#000000'),
      createColorStop(1, '#ffffff')
    ];
    
    component.onPaletteChange(newPalette);
    
    expect(component.palette()).toEqual(newPalette);
  });

  it('should select stop and emit event', () => {
    const stop = createColorStop(0.5, '#ff0000');
    const spy = spyOn(component.colorStopSelect, 'emit');
    
    component.onStopSelect(stop);
    
    expect(component.selectedStop()).toEqual(stop);
    expect(spy).toHaveBeenCalledWith(stop);
  });

  it('should update selected stop color', () => {
    const palette = [
      createColorStop(0, '#ff0000'),
      createColorStop(1, '#0000ff')
    ];
    component.palette.set(palette);
    component.onStopSelect(palette[0]);
    
    component.updateSelectedStopColor('#00ff00');
    
    const updatedPalette = component.palette();
    expect(updatedPalette[0].color).toBe('#00ff00');
  });
});
