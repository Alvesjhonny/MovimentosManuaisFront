import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimentoManual, Produto, Cosif } from '../models/movimentos-manuais.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimentosManuaisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMovimentos(): Observable<MovimentoManual[]> {
    return this.http.get<MovimentoManual[]>(`${this.apiUrl}/movimentos`);
  }

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/produtos`);
  }

  getCosifs(codProduto: string): Observable<Cosif[]> {
    return this.http.get<Cosif[]>(`${this.apiUrl}/produtos/${codProduto}/cosifs`);
  }

  createMovimento(movimento: MovimentoManual): Observable<MovimentoManual> {
    return this.http.post<MovimentoManual>(`${this.apiUrl}/movimentos`, movimento);
  }
}
