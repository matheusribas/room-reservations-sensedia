# Notas para atualizar o README

Este arquivo é contexto auxiliar para a próxima atualização do `README.md` conforme novas salas do desafio forem implementadas. Antes de marcar qualquer requisito como concluído, confira o código, os testes e o estado atual do repositório. Este snapshot foi registrado em 11/10/2026 e pode ficar desatualizado.

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
| SALA-2 | Reservas, sem sobreposição ou passado, duração de 15 min a 4 h e validação no servidor | Pendente |
| SALA-3 | Listar e cancelar apenas as próprias reservas | Pendente |
| SALA-4 | Admin cadastra/edita salas; autorização no servidor | Parcial: existem endpoints de sala, mas não há autenticação/autorização ou fluxo administrativo completo |
| SALA-5 | Reservas somente em dias úteis, entre 08h e 20h; hotfix com teste | Pendente |
| SALA-6 | Duração máxima de reserva própria de cada sala, substituindo o limite fixo de 4 h | Pendente |

### Implementação existente registrada

- SALA-1 consulta salas pela API, filtra capacidade mínima e todos os recursos escolhidos, e mantém os filtros na URL.
- Listagem usa TanStack Query e possui estados de carregamento, erro e vazio, além de cards e skeletons.
- Prisma modela `User`, `Room` e `Resource`, com relação muitos-para-muitos entre salas e recursos.
- API de salas tem GET/POST e operações PUT/DELETE por id.
- API de recursos tem GET/POST e DELETE por id.
- Schemas Zod validam entradas.
- Páginas de login, usuários e reservas estão registradas como placeholders. O login não autentica nem permite selecionar usuário.

### Pendências e ressalvas conhecidas

- Não foi encontrado seed com cinco salas, dois usuários comuns e um admin.
- Não foram encontrados testes automatizados nem script de teste no `package.json`.
- Não foi encontrado workflow de CI.
- Permissões precisam ser implementadas e verificadas no servidor; endpoints de CRUD existentes não bastam para SALA-4.
- A migration redundante `20261010170000_add_resource_relation` foi removida porque estava pendente no `dev.db` e duplicava tabelas da migration posterior já aplicada. `migrate dev --create-only` reproduziu o histórico no shadow database; depois foi aplicada a migration `20261011152021_add_resource_created_at`, e `migrate status` confirmou o banco atualizado. Antes de atualizar o README em outra sessão, confira se algum ambiente externo já aplicou a migration removida.
- A arquitetura AWS do README é somente uma proposta: ECS Fargate, Application Load Balancer, RDS PostgreSQL, Secrets Manager, CloudWatch, ECR e GitHub Actions com ambientes separados.

## Critérios para marcar cards como concluídos

- **SALA-2:** conferir persistência de reserva, seleção de sala/data/início/fim, validações no servidor e teste de sobreposição. Documentar também regra de passado e limites de duração.
- **SALA-3:** conferir listagem/cancelamento, identidade do usuário e autorização que impeça acessar ou cancelar reservas alheias; verificar teste exigido.
- **SALA-4:** conferir cadastro/edição pela interface e bloqueio no servidor para usuários comuns, inclusive chamadas diretas à API.
- **SALA-5:** conferir dias úteis e janela de 08h a 20h no servidor, teste do hotfix e manutenção dessas regras ao integrar SALA-6.
- **SALA-6:** conferir configuração por sala, validação de duração máxima e integração sem remover a regra de SALA-5.

Atualize esta nota junto do README quando o status mudar, para servir de referência na próxima sessão.
