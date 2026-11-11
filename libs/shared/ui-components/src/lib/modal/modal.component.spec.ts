import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let closed: jest.Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    closed = jest.fn();
    component.closed.subscribe(closed);
    fixture.detectChanges();
  });

  const open = () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render nothing while closed', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.elem-modal-backdrop')).toBeNull();
  });

  it('should render as a dialog and lock body scroll while open', () => {
    open();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('');
  });

  it('should close on backdrop click by default', () => {
    component.handleBackdropClick();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('should ignore backdrop clicks when closeOnBackdrop is false', () => {
    fixture.componentRef.setInput('closeOnBackdrop', false);
    component.handleBackdropClick();
    expect(closed).not.toHaveBeenCalled();
  });

  it('should keep clicks inside the content from reaching the backdrop', () => {
    const event = new MouseEvent('click');
    const stop = jest.spyOn(event, 'stopPropagation');
    component.handleContentClick(event);
    expect(stop).toHaveBeenCalled();
  });

  it('should let only Escape bubble out of the content', () => {
    const escape = new KeyboardEvent('keydown', { key: 'Escape' });
    const other = new KeyboardEvent('keydown', { key: 'a' });
    const stopEscape = jest.spyOn(escape, 'stopPropagation');
    const stopOther = jest.spyOn(other, 'stopPropagation');

    component.handleContentKeydown(escape);
    component.handleContentKeydown(other);

    expect(stopEscape).not.toHaveBeenCalled();
    expect(stopOther).toHaveBeenCalled();
  });

  it('should close when Escape is pressed inside the open modal', () => {
    open();
    const content = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
    content?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(closed).toHaveBeenCalledTimes(1);
  });
});
