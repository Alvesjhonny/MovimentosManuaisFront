# Movimentos Manuais App

Este projeto é uma aplicação Angular para gerenciamento de movimentos manuais. Abaixo estão as instruções para configurar e executar a aplicação.

## Pré-requisitos

- Node.js (versão 12 ou superior)
- Angular CLI (versão 8 ou superior)

## Instalação

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   ```

2. Navegue até o diretório do projeto:
   ```
   cd movimentos-manuais-app
   ```

3. Instale as dependências:
   ```
   npm install
   ```

## Execução

Para iniciar a aplicação em modo de desenvolvimento, execute o seguinte comando:
```
ng serve
```

A aplicação estará disponível em `http://localhost:4200/`.

## Estrutura do Projeto

- `src/app/app.module.ts`: Módulo principal da aplicação.
- `src/app/app.component.ts`: Componente raiz da aplicação.
- `src/app/components/movimentos-manuais/movimentos-manuais.component.html`: Template HTML do componente Movimentos Manuais.
- `src/app/components/movimentos-manuais/movimentos-manuais.component.ts`: Lógica do componente Movimentos Manuais.
- `src/app/components/movimentos-manuais/movimentos-manuais.component.css`: Estilos CSS do componente Movimentos Manuais.
- `src/app/components/movimentos-manuais/movimentos-manuais.component.spec.ts`: Testes unitários do componente Movimentos Manuais.
- `src/app/services/movimentos-manuais.service.ts`: Serviço para gerenciar movimentos manuais.
- `src/app/models/movimentos-manuais.model.ts`: Modelo de dados para os movimentos manuais.

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Para isso, faça um fork do repositório e envie um pull request.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.