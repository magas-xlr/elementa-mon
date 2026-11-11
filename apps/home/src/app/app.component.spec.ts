import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appConfig } from './app.config';
import { appRoutes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to ElementaMon - Home');
  });

  it(`should have as title 'ElementaMon - Home'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ElementaMon - Home');
  });

  it('should toggle the modal state', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.openModal();
    expect(app.isModalOpen()).toBe(true);
    app.closeModal();
    expect(app.isModalOpen()).toBe(false);
  });

  it('should log when the demo button is clicked', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.createComponent(AppComponent).componentInstance.handleButtonClick();
    expect(log).toHaveBeenCalledWith('Button clicked!');
    log.mockRestore();
  });

  it('should route the root path to AppComponent', () => {
    expect(appRoutes).toEqual([{ path: '', component: AppComponent }]);
  });

  it('should provide the router', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});
