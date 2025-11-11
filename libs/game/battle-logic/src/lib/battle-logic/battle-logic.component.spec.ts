import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleLogicComponent } from './battle-logic.component';

describe('BattleLogicComponent', () => {
  let component: BattleLogicComponent;
  let fixture: ComponentFixture<BattleLogicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleLogicComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleLogicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
