import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryLogicComponent } from './inventory-logic.component';

describe('InventoryLogicComponent', () => {
  let component: InventoryLogicComponent;
  let fixture: ComponentFixture<InventoryLogicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryLogicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryLogicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
