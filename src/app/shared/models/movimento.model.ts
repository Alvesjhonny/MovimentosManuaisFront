export interface Movimento {
  mes: number;
  ano: number;
  codigoProduto: string;
  descricaoProduto: string;
  nrLancamento: number;
  descricao: string;
  valor: number;
  datMovimento?: string; // ISO timestamp
  codUsuario?: string; // usuário que registrou, e.g. 'TESTE'
}
