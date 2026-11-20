---
name: espetaria-ui
description: Sistema de design do JP Espeto Bar (paleta de mel 60-30-10, componentes, movimento e fluxos). Use ao criar ou alterar qualquer tela, botão, formulário, tabela, diálogo ou animação do app.
---

# JP Espeto Bar: guia de UI

Next.js (App Router) + Tailwind v4 + base-ui. Textos em português do Brasil, em
sentence case. Antes de mexer em convenções do Next, leia `node_modules/next/dist/docs/`
(esta versão tem mudanças em relação ao que você conhece).

## Cor (regra 60-30-10)

Tokens em `app/globals.css`. Nunca escreva hex nem `text-white`/`bg-black` em componente:
use os tokens (`bg-card`, `text-muted-foreground`, `text-primary`, `bg-success/15`...).

| Peso | Papel | Escuro | Onde |
|---|---|---|---|
| 60% | Dominante | `#1A141A` | fundo da página e do menu |
| 30% | Complemento | `#423738`, `#D3AF85` | cartões, chips, barras, bordas, textos de apoio |
| 10% | Destaque | `#F4B315` | só ação principal, item ativo, valor-chave |

`#E59312` é o segundo destaque (gráficos e avisos), `#8E5915` a terceira série. No tema
claro o destaque vira bronze `#8E5915` para manter contraste. Verde, âmbar e vermelho são
só de situação (normal, baixo, crítico). Um botão primário por tela.

## Componentes que já existem (reuse antes de criar)

- `PageHeader` (título, descrição, voltar, ações), `SectionTitle`.
- `SummaryCard` (indicadores; `highlight` para o principal). O número anima sozinho.
- `StatusPill` (situação em tom success, warning, danger, neutral, primary).
- `Button`: `loading` mostra spinner e bloqueia clique duplo. Use em todo envio.
- `HoldButton`: ação destrutiva que exige segurar. Use no lugar de `confirm()`.
- `CommandPalette` (Ctrl+K) no topo: ao criar tela ou ação nova, registre em
  `components/layout/command-palette.tsx` (e em `nav-items.ts` se for tela de menu).
- Tabelas dentro de `Card` com `p-0 gap-0`; filtros como botões arredondados + busca.
- Formulários: seções em `Card`, coluna lateral com salvar/cancelar, campos `h-10 rounded-xl`.

## Movimento

Escala única em `globals.css` (`--duration-*`, `--ease-*`, `--distance-base`), inspirada no
transitions.dev. Regras:

- Abrir é mais devagar que fechar: diálogo/menu abre em 250ms e fecha em 150ms,
  com `--ease-smooth-out`. Escala de entrada 0.96 (diálogo) e 0.97 (menu).
- Nunca `transition: all` e nunca duração solta: nomeie as propriedades e use os tokens.
- Entrada em cascata com `animate-rise-in` e `style={{ "--i": índice }}` (40ms por item, máximo 12).
- Momentos de ênfase (selo, check de venda) usam `--duration-very-slow` e `--ease-bounce`.
- Erro de formulário usa `animate-shake`. Troca de ícone: escala + desfoque em 250ms.
- Animar só `opacity`, `transform` e `filter` em áreas pequenas; nada de blur em tela cheia.
- Tudo respeita `prefers-reduced-motion` (guarda global em `globals.css`). Se animar por
  JS, cheque `matchMedia("(prefers-reduced-motion: reduce)")` (veja `animated-number.tsx`).

## Fluxos de teclado do PDV

`/` foca a busca. Enter na busca adiciona o item quando só um bate ou o código/código de
barras é exato (leitor de código de barras). Esc limpa a busca. `F2` abre o pagamento.
Ao concluir a venda, o check de sucesso aparece sobre o carrinho por 1,8s.

## Qualidade antes de entregar

- `npx tsc --noEmit` limpo e `npm run build` passando.
- Confira em 375px: nenhuma tela pode rolar para o lado (`main.scrollWidth <= clientWidth`).
- Confira os temas escuro e claro; texto de destaque precisa ter contraste legível nos dois.
- Valores monetários em centavos inteiros (`centsToBRL`), números com `tabular-nums`.
- Controles só de ícone têm `aria-label`; botões em grupo de escolha usam `role="radio"`/`tab`.
- Depois de editar CSS/classes com o servidor de desenvolvimento ligado, reinicie-o
  (apague `.next`): o CSS do modo dev fica desatualizado.

## Entrada e navegação (login, menu, transições)

- Telas de entrada (`app/(auth)`): uma coluna só, igual no celular e no computador. Logo no
  topo, campos em pílula com ícone (`AuthField`), botão `AUTH_BUTTON`, sem painel lateral e
  sem login social. "Lembrar meu email" guarda só o email no aparelho, nunca a senha.
- O destaque do menu é um único elemento que desliza (`sidebar-nav.tsx`) e já se move no
  clique, sem esperar a rota. Não volte a pintar o fundo item a item.
- Entrada de tela e de conteúdo: regra `[data-page] > *` em `globals.css`. O esqueleto
  (`data-skeleton`) só aparece depois de 150ms. Páginas novas não precisam de nada extra.

## App instalável (PWA)

`app/manifest.ts`, ícones em `public/icons/` (gerados da logo), `app/icon.png` e
`app/apple-icon.png`, `public/sw.js` (só mostra `public/offline.html` sem rede; nunca guarda
páginas nem dados) registrado por `ServiceWorkerRegister` apenas em produção. Todo arquivo
público novo (imagem, ícone, manifesto) precisa entrar na exceção do `matcher` em `proxy.ts`,
senão o login redireciona o pedido e a imagem quebra para quem não está logado.

## Segurança (regras que não podem regredir)

- Toda rota de `app/api` confere o perfil: escrita com `requireRole`, leitura com
  `denyUnlessRole` (`lib/auth-guards.ts`). Nunca só "está logado". Dados de custo, financeiro
  e vendas são de ADMIN/MANAGER (vendas e fiado também de CASHIER).
- A sessão é revalidada no banco a cada minuto (`auth.ts`): usuário desativado ou apagado
  perde o acesso; o perfil novo vale sem sair e entrar. Sessão dura 12h.
- Login limitado a 5 falhas por email e 20 por IP em 15 minutos (`lib/rate-limit.ts`, em
  memória, por instância).
- "Esqueci a senha" em produção não gera nem devolve link (ainda não há envio de email): o
  administrador redefine em Configurações, Usuários. Nunca devolva token ou link na resposta.
- Upload: conferir assinatura do arquivo e nunca usar texto vindo da URL no nome do arquivo.
- Cabeçalhos de segurança e CSP parcial em `next.config.ts` (HSTS só em produção).
- Rode `npm audit --omit=dev` de vez em quando; `next` fica fixado numa versão exata.
