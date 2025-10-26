import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovimentosManuaisComponent } from './movimentos-manuais.component';
import { MovimentosManuaisService } from '../../services/movimentos-manuais.service';
import { of } from 'rxjs';

describe('MovimentosManuaisComponent', () => {
  let component: MovimentosManuaisComponent;
  let fixture: ComponentFixture<MovimentosManuaisComponent>;
  let service: MovimentosManuaisService;

  beforeEach(async () => {
    const serviceMock = {
      getMovimentos: jasmine.createSpy('getMovimentos').and.returnValue(of([])),
      addMovimento: jasmine.createSpy('addMovimento').and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      declarations: [MovimentosManuaisComponent],
      providers: [
        { provide: MovimentosManuaisService, useValue: serviceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimentosManuaisComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MovimentosManuaisService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMovimentos on init', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    component.ngOnInit();
    expect(service.getMovimentos).toHaveBeenCalled();
  });

  it('should add a movimento', () => {
    const movimento = { /* movimento data */ };
    component.addMovimento(movimento);
    expect(service.addMovimento).toHaveBeenCalledWith(movimento);
  });
});