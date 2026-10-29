# Requisitos — Inventário de cursos técnicos

## Contexto

A fase PH-01 do roadmap organiza o conteúdo que servirá de base ao catálogo institucional. A missão limita o catálogo aos cursos de ensino técnico indicados pela Etec Sales Gomes e permite conteúdo mock temporário quando dados curriculares não estiverem disponíveis.

## Escopo

- Identificar os cursos de ensino técnico incluídos no catálogo.
- Reunir matrizes curriculares, disciplinas e descrições disponíveis.
- Registrar a origem das informações e apontar lacunas, divergências e conteúdo temporário.

## Decisões

- A página oficial da Etec Sales Gomes define quais cursos pertencem ao escopo: https://etecsalesgomes.cps.sp.gov.br/ensino-tecnico/.
- A fonte antiga indicada pela coordenação é a referência inicial para matrizes e disciplinas.
- Fontes complementares podem ser usadas para preencher dados, desde que sua origem seja registrada.
- Conteúdo mock é permitido para lacunas, mas deve ser identificado como temporário e não confirmado.
- SQLite é provisório conforme a stack do projeto; esta fase não exige persistência nem implementação da interface.

## Critérios funcionais

- Cada curso listado deve pertencer ao escopo técnico confirmado pela fonte oficial.
- Cada matriz, disciplina ou descrição registrada deve ter uma origem rastreável.
- Dados indisponíveis devem ser marcados como pendentes ou ausentes; mocks devem ser identificados explicitamente.
- Divergências e questões sem resposta devem permanecer documentadas como pendências, sem inventar confirmação.

## Fora de escopo

- Implementar páginas do catálogo ou funcionalidades de login e notícias.
- Definir uma solução permanente de armazenamento para os dados curriculares.
