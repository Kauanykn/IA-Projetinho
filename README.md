# Sitech
## Entrada da equipe

- Mary, da equipe de engenharia, deseja um site confiável que utilize uma stack popular baseada em TypeScript.
- Mary, da equipe de engenharia, relatou a necessidade de ter uma tela de login para cadastrar notícias. As notícias serão exibidas na página principal do site.
- Mary da equipe de engenharia informou que podemos utilizar por enquanto sqlite.
- Susan, da área de coordenação de curso, tem um link do site antigo no qual contém cursos técnicos e suas matrizes curriculares demonstrando quais são as matérias de cada curso e suas descrições, que serão os mesmos cursos e matrizes para esse novo site.
- Susan relatou que o novo site irá conter apenas os cursos de ensino-técnico do link: https://etecsalesgomes.cps.sp.gov.br/ensino-tecnico/
- Joaquim da área pedagógica, relatou que as matérias de cada curso podem ser encontradas pela internet ou inventadas temporariamente, servindo como mock.
- Steve, do marketing, quer um site atraente que funcione bem em navegadores modernos e seja compatível com dispositivos mobiles.

## Aplicação

O projeto oferece uma página inicial com notícias, um catálogo de cursos com páginas para matrizes curriculares e uma área administrativa para publicação. A aplicação usa React, TypeScript, Express e SQLite.

### Requisitos

- Node.js 20 ou superior e npm.
- Uma senha administrativa com pelo menos 12 caracteres.

### Configuração local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env`.
3. Gere o hash bcrypt da senha com `npm run hash-password` e configure o resultado em `ADMIN_PASSWORD_HASH`.
4. Configure `ADMIN_USERNAME` e gere um valor aleatório de pelo menos 32 caracteres para `SESSION_SECRET`.
5. Inicie o modo de desenvolvimento com `npm run dev`. A interface fica disponível em `http://localhost:5173`.

Os dados de notícias e as sessões são persistidos no diretório local `data/`, que não deve ser versionado. Para validar o projeto, execute `npm test` e `npm run build`.

### Inventário curricular

A aplicação não publica cursos, disciplinas ou descrições sem uma fonte verificável. A página de referência oficial está registrada em `specs/2026-10-29-feature-inventario-cursos-tecnicos/plan.md`, mas não respondeu às tentativas de consulta desta implementação. A fonte antiga mencionada pela coordenação também não foi fornecida. Assim, o catálogo informa que o inventário está pendente, em vez de apresentar conteúdo inventado como confirmado. Os dados verificados deverão ser adicionados em `server/catalog.ts`, com sua origem e a indicação explícita de qualquer mock.

### Administração e publicação

A sessão administrativa usa cookie HTTP-only, SameSite Strict e armazenamento SQLite. O login é limitado por tentativas, as alterações exigem token CSRF e as entradas de notícias são validadas no servidor. Credenciais não têm valores padrão no código; a API não inicia enquanto as variáveis administrativas obrigatórias estiverem ausentes.

## Status do roadmap

- **PH-01 — Levantamento de conteúdo:** bloqueado para aprovação do inventário até a confirmação da fonte antiga e a consulta da fonte oficial.
- **PH-02 — Catálogo de cursos:** páginas responsivas e matrizes implementadas; a publicação do conteúdo depende do inventário.
- **PH-03 — Notícias e acesso administrativo:** login, persistência SQLite e publicação implementados.
- **PH-04 — Validação e publicação:** build/testes locais e preparação documentada; implantação e revisão final do conteúdo ainda dependem de validação.