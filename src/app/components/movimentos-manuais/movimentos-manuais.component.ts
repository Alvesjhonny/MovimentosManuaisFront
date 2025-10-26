import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cosif, MovimentoManual, Produto } from '../../models/movimentos-manuais.model';
import { MovimentosManuaisService } from '../../services/movimentos-manuais.service';

@Component({
  selector: 'app-movimentos-manuais',
  templateUrl: './movimentos-manuais.component.html',
  styleUrls: ['./movimentos-manuais.component.scss']
})
export class MovimentosManuaisComponent implements OnInit {
  movimentoForm: FormGroup;
  filtroForm: FormGroup;

  private movimentosSubject = new BehaviorSubject<MovimentoManual[]>([]);
  private filtroSubject = new BehaviorSubject<{ mes?: number | null; ano?: number | null }>({});

  produtos: Produto[] = [];
  cosifs: Cosif[] = [];

  filteredMovimentos$: Observable<MovimentoManual[]>;

  constructor(
    private fb: FormBuilder,
    private movimentoService: MovimentosManuaisService
  ) {
    this.movimentoForm = this.fb.group({
      mes: [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      ano: [null, [Validators.required, Validators.min(1900)]],
      codProduto: ['', Validators.required],
      codCosif: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      descricao: ['', [Validators.required, Validators.maxLength(50)]]
    });

    this.filtroForm = this.fb.group({
      mes: [null],
      ano: [null]
    });

    this.filteredMovimentos$ = combineLatest([this.movimentosSubject.asObservable(), this.filtroSubject.asObservable()]).pipe(
      map(([movimentos, filtro]) => {
        if (!filtro || (!filtro.mes && !filtro.ano)) {
          return movimentos;
        }
        return movimentos.filter(m => {
          const matchesMes = filtro.mes ? Number(filtro.mes) === Number(m.mes) : true;
          const matchesAno = filtro.ano ? Number(filtro.ano) === Number(m.ano) : true;
          return matchesMes && matchesAno;
        });
      })
    );
  }

  ngOnInit(): void {
    this.loadMovimentos();
    this.loadProdutos();
    this.disableForm();
  }

  applyFilter(): void {
    const filtro = this.filtroForm.value;
    this.filtroSubject.next({ mes: filtro.mes ?? null, ano: filtro.ano ?? null });
  }

  clearFilter(): void {
    this.filtroForm.reset();
    this.filtroSubject.next({});
  }

  private loadProdutos(): void {
    this.movimentoService.getProdutos().subscribe(
      list => {
        console.log('Produtos carregados com sucesso:', list);
        this.produtos = list;
      },
      err => {
        console.error('FALHA AO CARREGAR PRODUTOS. Verifique o console de Network no seu navegador. Causa provável: Erro de CORS no backend ou API fora do ar.', err);
      }
    );
  }

  onProdutoChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const codProduto = selectElement.value;

    if (!codProduto) {
      this.cosifs = [];
      this.movimentoForm.get('codCosif').reset();
      this.movimentoForm.get('codCosif').disable();
      return;
    }

    this.movimentoService.getCosifs(codProduto).subscribe(
      list => {
        this.cosifs = list;
        this.movimentoForm.get('codCosif').enable();
      },
      err => { console.error('Erro ao carregar cosifs:', err); }
    );
  }

  novo(): void {
    this.movimentoForm.enable();
    this.movimentoForm.reset();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    this.movimentoForm.patchValue({ mes: currentMonth, ano: currentYear });
    this.movimentoForm.get('codCosif').disable();
  }

  disableForm(): void {
    this.movimentoForm.disable();
  }

  private loadMovimentos(): void {
    this.movimentoService.getMovimentos().subscribe(
      list => this.movimentosSubject.next(list),
      err => { console.error('Erro ao carregar movimentos:', err); }
    );
  }

  onSubmit(): void {
    if (this.movimentoForm.invalid) {
      this.movimentoForm.markAllAsTouched();
      return;
    }

    const payload: MovimentoManual = this.movimentoForm.getRawValue();

    this.movimentoService.createMovimento(payload).subscribe(created => {
      const current = this.movimentosSubject.getValue();
      this.movimentosSubject.next([created, ...current]);
      this.limparFormulario();
      this.disableForm();
    });
  }

  limparFormulario(): void {
    this.movimentoForm.reset();
    this.disableForm();
  }
}