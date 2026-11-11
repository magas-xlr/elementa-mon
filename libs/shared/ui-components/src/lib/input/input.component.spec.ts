import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link the label to the native input', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const label = element.querySelector('label');
    const input = element.querySelector('input');
    expect(label?.htmlFor).toBe(component.inputId);
    expect(input?.id).toBe(component.inputId);
  });

  it('should give each instance a unique id', () => {
    const other = TestBed.createComponent(InputComponent).componentInstance;
    expect(other.inputId).not.toBe(component.inputId);
  });

  it('should emit focused and blurred', () => {
    const focused = jest.fn();
    const blurred = jest.fn();
    component.focused.subscribe(focused);
    component.blurred.subscribe(blurred);

    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    input?.dispatchEvent(new FocusEvent('focus'));
    input?.dispatchEvent(new FocusEvent('blur'));

    expect(focused).toHaveBeenCalledTimes(1);
    expect(blurred).toHaveBeenCalledTimes(1);
  });
});
