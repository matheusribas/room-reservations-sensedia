# Notas para atualizar o README

Este arquivo é contexto auxiliar para a próxima atualização do `README.md` conforme novas salas do desafio forem implementadas. Antes de marcar qualquer requisito como concluído, confira o código, os testes e o estado atual do repositório. Este snapshot foi atualizado em 12/10/2026 e deve ser conferido após novas alterações.

## Como usar estas notas

Quando uma nova sala for concluída:

1. Verifique a implementação real, os testes existentes e os resultados de validação; não presuma que o status abaixo continua atual.
2. Atualize no `README.md` as seções `Implementado`, `Status do desafio` e `Próximos passos`.
3. Descreva regras de negócio e decisões relevantes da feature recém-verificada.
4. Só diga que há testes, seed, CI, autorização ou release quando isso existir e tiver sido conferido.
5. Mantenha a arquitetura AWS identificada como proposta até que haja infraestrutura implantada.
6. Reavalie as pendências conhecidas abaixo; remova-as apenas após confirmar que foram resolvidas.

## Snapshot atual

### Stack confirmada

- Next.js 16 com App Router e React 19
- TypeScript com `strict: true`
- Prisma ORM 7 e SQLite local
- Zod, TanStack Query, Tailwind CSS, Base UI/shadcn e pnpm

### Requisitos do desafio

| Card | Requisito | Status registrado |
| --- | --- | --- |
| SALA-1 | Listagem de salas, filtro por capacidade/recurso e filtros na URL | Implementado |
| SALA-2 | Reservas, sem sobreposição ou passado, duração de 15 min a 4 h e validação no servidor | Implementado |
| SALA-3 | Listar e cancelar apenas as próprias reservas | Implementado |
| SALA-4 | Admin cadastra/edita salas; autorização no servidor | Implementado; exclusão tem endpoint, sem ação na interface |
| SALA-5 | Reservas somente em dias úteis, entre 08h e 20h; hotfix com teste | Implementado e coberto por testes automatizados |
| SALA-6 | Duração máxima de reserva própria de cada sala, substituindo o limite fixo de 4 h | Pendente |

### Implementação existente registrada

- SALA-1 consulta salas pela API, filtra capacidade mínima e todos os recursos escolhidos, e mantém os filtros na URL.
- Listagem usa TanStack Query e possui estados de carregamento, erro e vazio, além de cards e skeletons.
- Prisma modela `User`, `Session`, `Room` e `Resource`, com relação muitos-para-muitos entre salas e recursos.
- API de salas tem GET/POST e operações PUT/DELETE por id.
- API de recursos tem GET/POST e DELETE por id.
- Schemas Zod validam entradas no cliente e no servidor.
- Reservas são validadas para dias úteis e para a janela de 08h–20h em `America/Sao_Paulo`; calendário e disponibilidade respeitam a mesma regra.
- SALA-3 filtra listagem/cancelamento pela sessão; SALA-4 aplica autorização por papel no servidor.
- O login permite escolher um usuário para demonstração e cria uma sessão, mas não comprova a identidade.

### Pendências e ressalvas conhecidas

- Há testes automatizados para SALA-5 via `pnpm test`; os demais requisitos ainda não têm cobertura automatizada completa.
- Não foi encontrado workflow de CI.
- A autenticação é demonstrativa e não adequada para produção; o usuário pode selecionar o perfil admin sem prova de identidade.
- A interface administrativa não oferece exclusão de salas, embora o endpoint esteja protegido e implementado.
- A migration redundante `20261010170000_add_resource_relation` foi removida porque estava pendente no `dev.db` e duplicava tabelas da migration posterior já aplicada. `migrate dev --create-only` reproduziu o histórico no shadow database; depois foi aplicada a migration `20261011152021_add_resource_created_at`, e `migrate status` confirmou o banco atualizado. Antes de atualizar o README em outra sessão, confira se algum ambiente externo já aplicou a migration removida.
- A arquitetura AWS do README é somente uma proposta: ECS Fargate, Application Load Balancer, RDS PostgreSQL, Secrets Manager, CloudWatch, ECR e GitHub Actions com ambientes separados.

## Critérios para marcar cards como concluídos

- **SALA-2:** conferir persistência de reserva, seleção de sala/data/início/fim, validações no servidor e teste de sobreposição. Documentar também regra de passado e limites de duração.
- **SALA-3:** conferir listagem/cancelamento, identidade do usuário e autorização que impeça acessar ou cancelar reservas alheias; verificar teste exigido.
- **SALA-4:** conferir cadastro/edição pela interface e bloqueio no servidor para usuários comuns, inclusive chamadas diretas à API.
- **SALA-5:** regra implementada no formulário e no servidor, com testes em `tests/reservation-business-hours.test.ts`; manter a regra ao integrar SALA-6.
- **SALA-6:** conferir configuração por sala, validação de duração máxima e integração sem remover a regra de SALA-5.

Atualize esta nota junto do README quando o status mudar, para servir de referência na próxima sessão.
