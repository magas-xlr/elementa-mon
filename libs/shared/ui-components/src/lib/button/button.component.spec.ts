import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const click = () => (fixture.nativeElement as HTMLElement).querySelector('button')?.click();

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clicked when enabled', () => {
    const emitted = jest.fn();
    component.clicked.subscribe(emitted);
    click();
    expect(emitted).toHaveBeenCalledTimes(1);
  });

  it('should not emit while disabled', () => {
    const emitted = jest.fn();
    component.clicked.subscribe(emitted);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.handleClick(new MouseEvent('click'));
    expect(emitted).not.toHaveBeenCalled();
  });

  it('should not emit while loading and show the spinner', () => {
    const emitted = jest.fn();
    component.clicked.subscribe(emitted);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    component.handleClick(new MouseEvent('click'));
    expect(emitted).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.elem-btn-spinner')
    ).not.toBeNull();
  });

  it('should apply variant and size classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.classList).toContain('elem-btn-danger');
    expect(button?.classList).toContain('elem-btn-lg');
  });
});
