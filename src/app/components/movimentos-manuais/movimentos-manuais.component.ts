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
  valorDisplay = '';
  valorTouched = false;
  get valorInvalid() {
    if (!this.valorTouched) return false;
    const v = this.parseCurrency(this.valorDisplay);
    return !(v > 0);
  }
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
    // Habilita e limpa o formulário sem preencher mês/ano (devem ficar vazios conforme solicitado)
    this.movimentoForm.enable();
    this.movimentoForm.reset({ mes: null, ano: null, codProduto: '', codCosif: '', valor: null, descricao: '' });
    this.valorDisplay = '';
    this.valorTouched = false;
    this.movimentoForm.get('codCosif')?.disable();
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

    // garantir que o valor numérico venha coerente a partir do campo formatado
    const payload: MovimentoManual = this.movimentoForm.getRawValue();
    payload.valor = this.parseCurrency(this.valorDisplay);

    this.movimentoService.createMovimento(payload).subscribe(created => {
      const current = this.movimentosSubject.getValue();
      this.movimentosSubject.next([created, ...current]);
      this.limparFormulario();
      this.disableForm();
    });
  }

  limparFormulario(): void {
    // limpar todos os campos do formulário e o display do valor
    this.movimentoForm.reset({ mes: null, ano: null, codProduto: '', codCosif: '', valor: null, descricao: '' });
    // garantir que o FormControl 'valor' seja nulo para não manter validação
    const control = this.movimentoForm.get('valor');
    if (control) { control.setValue(null); }
    this.valorDisplay = '';
    this.valorTouched = false;
    this.disableForm();
  }

  // --- mask helpers for Valor field ---
  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value || '';
    // remove non-digits
    const digits = raw.replace(/\D+/g, '') || '0';
    const intVal = parseInt(digits, 10);
    const number = intVal / 100;
    // update display
    this.valorDisplay = number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // set numeric value into the form control so validators work
    const control = this.movimentoForm.get('valor');
    if (control) { control.setValue(number); }
    this.valorTouched = true;
  }

  onValorBlur(): void {
    this.valorTouched = true;
  }

  onValorFocus(): void {
    // no-op for now
  }

  private parseCurrency(display = ''): number {
    if (!display) return 0;
    const cleaned = display.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  // Formata um número para o mesmo padrão visual usado no campo de entrada (pt-BR, 2 casas)
  formatValor(value: number | null | undefined): string {
    const v = value ?? 0;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}