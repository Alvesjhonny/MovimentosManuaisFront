import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Movimento } from '../models/movimento.model';

export interface Produto {
  codProduto: string;
  desProduto: string;
  staStatus?: string;
}

export interface ProdutoCosif {
  codProduto: string;
  codCosif: string;
  codClassificacao?: string;
  staStatus?: string;
}

@Injectable({ providedIn: 'root' })
export class MovimentoService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // GET /api/movimentos
  getMovimentos(): Observable<Movimento[]> {
    return this.http.get<any[]>(`${this.baseUrl}/movimentos`).pipe(
      map(list => list.map(item => this.fromApi(item)))
    );
  }

  // POST /api/movimentos
  addMovimento(movimento: Partial<Movimento>): Observable<Movimento> {
    const body: any = {
      mes: movimento.mes,
      ano: movimento.ano,
      codProduto: movimento.codigoProduto,
      codCosif: movimento.descricaoProduto,
      valor: movimento.valor,
      descricao: movimento.descricao
    };
    return this.http.post<any>(`${this.baseUrl}/movimentos`, body).pipe(map(res => this.fromApi(res)));
  }

  // GET /api/produtos
  getProdutos(): Observable<Produto[]> {
    // Alguns endpoints mostrados nos seus exemplos usam GET com body no curl.
    // Para cobrir esse caso, usamos http.request que permite enviar body em GET.
    return this.http.request<Produto[]>('GET', `${this.baseUrl}/produtos`, { body: {} }).pipe(
      catchError((err) => {
        console.error('Erro ao buscar produtos:', err);
        return of([]);
      })
    );
  }

  // GET /api/produtos/{codProduto}/cosifs
  getProdutoCosif(codProduto?: string): Observable<ProdutoCosif[]> {
    if (!codProduto) {
      return of([]);
    }
    // Também usamos request GET com body, caso o backend espere JSON no corpo
    return this.http.request<ProdutoCosif[]>('GET', `${this.baseUrl}/produtos/${encodeURIComponent(codProduto)}/cosifs`, { body: {} }).pipe(
      catchError((err) => {
        console.error('Erro ao buscar cosifs para', codProduto, err);
        return of([]);
      })
    );
  }

  // transforma resposta da API para o modelo Movimento usado no frontend
  private fromApi(item: any): Movimento {
    return {
      mes: item.mes,
      ano: item.ano,
      codigoProduto: item.codProduto ?? item.codigoProduto ?? '',
      descricaoProduto: item.codCosif ?? item.descricaoProduto ?? '',
      nrLancamento: item.nrLancamento ?? item.numLancamento ?? 0,
      descricao: item.descricao ?? '',
      valor: item.valor ?? 0,
      datMovimento: item.datMovimento ?? item.dataMovimento ?? undefined,
      codUsuario: item.codUsuario ?? undefined
    };
  }
}

