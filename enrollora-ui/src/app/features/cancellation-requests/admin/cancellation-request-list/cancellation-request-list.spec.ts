import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancellationRequestList } from './cancellation-request-list';

describe('CancellationRequestList', () => {
  let component: CancellationRequestList;
  let fixture: ComponentFixture<CancellationRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancellationRequestList],
    }).compileComponents();

    fixture = TestBed.createComponent(CancellationRequestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
