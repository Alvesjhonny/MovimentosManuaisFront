export interface MovimentoManual {
  // Fields for POST request
  mes: number;
  ano: number;
  codProduto: string;
  codCosif: string;
  valor: number;
  descricao: string;

  // Fields from GET response
  id?: number;
  numLancamento?: number;
  codUsuario?: string;
  dataMovimento?: string | null;
}

export interface Produto {
  codProduto: string;
  desProduto: string;
  status: string;
}

export interface Cosif {
  id: number;
  codProduto: string;
  codCosif: string;
  codClassificacao: string;
  status: string;
}