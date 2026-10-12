# Reserva de Salas

Aplicação web para consulta e reserva de salas de reunião, desenvolvida como desafio técnico Full Stack Pleno da Sensedia. O projeto está em desenvolvimento; esta documentação distingue o que já existe do que ainda precisa ser entregue.

## Stack

- Next.js 16 com App Router e React 19
- TypeScript em modo `strict`
- Prisma ORM 7 e SQLite para persistência local
- Zod para validação de dados
- TanStack Query para consultas no cliente
- Tailwind CSS e componentes Base UI/shadcn
- pnpm como gerenciador de pacotes

## Implementado

### SALA-1: listagem e filtros

- Lista salas com capacidade igual ou superior ao valor informado.
- Filtra por todos os recursos selecionados.
- Mantém capacidade e recursos na URL, permitindo recarregar e compartilhar os filtros.
- Exibe os resultados em cards, com estados de carregamento, erro e lista vazia.
- Consulta os dados pela API e mantém cache no cliente com TanStack Query.

### SALA-2: reservas

- Permite escolher sala, data, início e fim pelo formulário de criação de reserva.
- Consulta os períodos livres da sala para a data escolhida e os exibe no formulário.
- Cria reservas pela API com validação no servidor: início no futuro, duração entre 15 minutos e 4 horas e sem sobreposição com outra reserva ativa da mesma sala.
- Usa React Hook Form e Zod para validar o formulário no cliente; o servidor valida novamente antes de persistir.
- Mantém o período disponível para reservar uma sala na consulta por sala

O usuário associado à reserva ainda é um identificador mockado no formulário. A autenticação e a identificação segura do usuário ainda não foram implementadas. A disponibilidade exibida é informativa; o `POST` revalida conflitos para cobrir reservas criadas após a consulta.

### Base de dados e APIs

- Modelos Prisma para usuários, salas, recursos e reservas, com relacionamento muitos-para-muitos entre salas e recursos e relações de reserva com sala e usuário.
- API de listagem e criação de salas, além de atualização e exclusão por identificador.
- API de listagem e criação de recursos, além de exclusão por identificador.
- API de consulta de disponibilidade e criação de reservas, além de listagem de usuários.
- Validação de entradas com schemas Zod e respostas HTTP para dados inválidos ou registros inexistentes.

Os endpoints de criação, edição e exclusão são uma base de backend; isso não significa que os fluxos de administração e as permissões exigidas pelo desafio estejam concluídos.

## Status do desafio

| Requisito | Situação atual |
| --- | --- |
| SALA-1: listar salas e filtrar por capacidade/recurso com filtros na URL | Implementado |
| SALA-2: criar reservas, validar sobreposição, passado e duração | Implementado; usuário ainda é mockado e não há autenticação |
| SALA-3: listar e cancelar somente as próprias reservas | Pendente |
| SALA-4: administração de salas protegida por papel/permissão no servidor | Parcial: há endpoints de sala, mas faltam autenticação, autorização e fluxo administrativo completo |
| SALA-5: restringir reservas a dias úteis, entre 08h e 20h | Pendente |
| SALA-6: duração máxima de reserva configurável por sala | Pendente |
| Seed com cinco salas, dois usuários comuns e um administrador | Implementado |
| Testes automatizados dos requisitos pedidos | Pendente |
| CI e processo completo de branches, PRs e releases | Pendente |

As páginas de login, gerenciamento de usuários e listagem de minhas reservas ainda são placeholders. A tela de login não implementa autenticação; por isso, o formulário de reserva usa atualmente um usuário mockado.

## Executar localmente

Requisitos: Node.js compatível com o projeto e pnpm.

1. Instale as dependências com `pnpm install`.
2. Crie um arquivo `.env` na raiz do projeto e configure `DATABASE_URL="file:./dev.db"`.
3. Aplique as migrations, gere o Prisma Client e popule o banco com `pnpm run db:setup`.
4. Inicie a aplicação com `pnpm run dev`.

Também estão configurados `pnpm run lint` e `pnpm run typecheck`. Ainda não há script de testes no `package.json`.

## Arquitetura AWS proposta

Esta é uma proposta para produção, não uma infraestrutura já implantada. A aplicação Next.js poderia rodar em serviços ECS Fargate atrás de um Application Load Balancer. O banco de produção seria um RDS PostgreSQL privado; o SQLite permaneceria restrito ao desenvolvimento local. Segredos ficariam no AWS Secrets Manager, logs e métricas no CloudWatch, e GitHub Actions executaria lint, typecheck e testes antes de publicar a imagem no ECR e atualizar ambientes separados de homologação e produção. Cada ambiente teria seu próprio serviço e banco.

```mermaid
flowchart LR
	User[Usuário] --> ALB[Application Load Balancer]
	ALB --> App[ECS Fargate: Next.js]
	App --> DB[(RDS PostgreSQL)]
	App --> Secrets[AWS Secrets Manager]
	App --> Logs[Amazon CloudWatch]
	CI[GitHub Actions: checks e deploy] --> ECR[Amazon ECR]
	ECR --> App
	CI --> Staging[Ambiente de homologação]
	CI --> Production[Ambiente de produção]
```

## Próximos passos


1. Implementar autenticação e obter o usuário da sessão no servidor, removendo o identificador mockado do formulário.
2. Implementar listagem e cancelamento de reservas próprias (SALA-3).
3. Completar a administração de salas com autenticação e autorização no servidor (SALA-4).
4. Implementar SALA-5 e SALA-6, CI e o fluxo de releases solicitado.
5. Criar testes automatizados para os requisitos do desafio.