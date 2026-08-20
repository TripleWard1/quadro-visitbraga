# Quadro da Divisão

Quadro de parede da Divisão de Atividades Económicas e Turismo do Município de
Braga. Mostra **quem está em quê e em que fase**, e o que já passou do prazo.

Next.js 14 (App Router) · TypeScript · Firestore opcional.

---

## Arrancar

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`. **Sem configurar nada**, o quadro corre com
dados de demonstração — dá para o pôr no monitor hoje e tratar da base de dados
depois.

### No StackBlitz

Arrasta a pasta para o painel de ficheiros, ou cria um projeto *Next.js* e
substitui `app/`, `components/`, `lib/` e os ficheiros de configuração.
O `npm install` corre sozinho.

---

## Estrutura

```
app/
  page.tsx            o quadro
  gestao/page.tsx     onde se muda a fase das tarefas
  globals.css         toda a folha de estilo
components/
  Quadro.tsx          rotação de ecrãs, relógio, atalhos
  CartaoPessoa.tsx    o cartão de cada pessoa
  Carril.tsx          as cinco paragens da fase
  Fluxo.tsx           ecrã de colunas por fase
  ListaLateral.tsx    "Em atraso" e "Entra a seguir"
  Cabecalho.tsx  Legenda.tsx  Rodape.tsx
lib/
  config.ts           logótipo, tempos de rotação, cartões por ecrã
  fases.ts            as cinco fases — a espinha do quadro
  tipos.ts  datas.ts  dadosDemo.ts
  firebase.ts  useTarefas.ts
```

## O que mexer primeiro

Tudo o que costuma precisar de ajuste está em `lib/config.ts`:

| constante | efeito |
|---|---|
| `LOGO` | endereço do logótipo |
| `LOGO_EM_CHAPA_CLARA` | `false` se o logótipo for branco |
| `ROTACAO_MS` | tempo de cada ecrã (22 s) |
| `PESSOAS_POR_PAGINA` | 6 = grelha 3×2 |
| `HORIZONTE_DIAS` | dias no painel "Entra a seguir" |

As fases estão em `lib/fases.ts`. Mudar a lista muda o carril, as colunas do
fluxo e o botão "avançar" — tudo lê do mesmo sítio.

## Atalhos no monitor

| tecla | efeito |
|---|---|
| `V` | ecrã seguinte |
| `P` | pausa a rotação |
| `F` | ecrã inteiro |

---

## Firestore

O projeto **quadro-visitbraga** já vem ligado — as chaves estão em
`lib/firebaseConfig.ts`. São chaves públicas, como em qualquer app web com
Firebase; quem protege os dados são as regras em `firestore.rules`.

Falta fazer três coisas na consola do Firebase, uma vez:

1. **Firestore Database** → *Criar base de dados* (modo de produção, região
   `europe-west1` ou `eur3`).
2. **Rules** → colar o conteúdo de `firestore.rules` e publicar.
3. **Authentication** → ativar o fornecedor *Google*, e em *Settings →
   Authorized domains* acrescentar o domínio da Vercel. Sem isto o login em
   `/gestao` abre a janela e fecha-a sem explicar porquê.

### Entrar para alterar o quadro

O município usa Microsoft 365, por isso não há entrada com Google — os emails
`@cm-braga.pt` não são contas Google. A entrada é por **link enviado ao email**:
escreve-se o endereço, chega um link ao Outlook, carrega-se, entrou. A prova de
que alguém é da casa é conseguir abrir esse email.

O quadro em si (`/`) não pede sessão nenhuma — é só de leitura, é para ficar no
monitor. Quem quiser mexer vai a **`/gestao`**.

Há palavra-passe como alternativa, para o caso de os filtros de correio comerem
o link. Nesse caso crias a conta em Firebase → Authentication → *Add user*, com
o email e uma palavra-passe temporária, e a pessoa muda-a depois pelo
"esqueci-me da palavra-passe".

**Na consola do Firebase, uma vez:**

1. Authentication → **Sign-in method** → ativar *Email/Password* e, dentro dele,
   ligar também o interruptor **Email link (passwordless sign-in)**.
2. Authentication → **Settings → Authorized domains** → acrescentar o domínio da
   Vercel. O `localhost` já lá está de origem. Sem isto aparece
   `auth/unauthorized-domain` e nada funciona.
3. Authentication → **Templates** → o email de entrada pode ser passado a
   português, para não chegar às pessoas um texto em inglês da Google.

O link tem de ser aberto no mesmo browser onde foi pedido — é lá que fica
guardado o email para confirmar. Se for aberto noutro sítio, a página pergunta o
endereço antes de entrar.

### Como cada pessoa usa a página

1. **Acrescentar trabalho** — o que é preciso fazer, o projeto e o prazo. O
   campo do projeto sugere os que já existem, para não aparecerem no quadro
   três grafias do mesmo. A tarefa nasce na fase *Aceite*.
2. **Avançar a fase** — um botão que diz para onde vai a seguir ("avançar para
   Em revisão"). Há também `← recuar` e um seletor para saltar direto a uma
   fase qualquer.
3. **Marcar parada** quando se está à espera de terceiros: pede o motivo, e o
   monitor mostra-o a vermelho com o carril partido.

Por omissão vê-se só o trabalho próprio; há um botão para ver o da divisão toda,
e qualquer pessoa pode criar uma tarefa para outra — útil para quem distribui
serviço.

A equipa está em `lib/dadosDemo.ts`: catorze pessoas, sete por ecrã, dois ecrãs.
Quem entrar e não se encontrar na lista tem um botão que a escreve no Firestore.
Para acrescentar ou tirar alguém depois disso, edita-se a coleção `pessoas`
direto na consola — pôr `ativo: false` esconde do quadro sem apagar o histórico.

### Coleções

**`pessoas`** — `nome`, `iniciais` (2 letras), `ativo` (boolean), `ordem` (number).
O id do documento é o que as tarefas referem em `responsavel`.

**`tarefas`** — `titulo`, `projeto`, `responsavel`, `fase`
(`aceite` · `curso` · `revisao` · `aprovacao` · `entregue`), `bloqueada` (boolean),
`motivo`, `prazo` (timestamp), `atualizadoEm` (timestamp).

Fase e bloqueio são campos separados de propósito: uma tarefa pode estar *em
aprovação* **e** parada à espera de resposta de terceiros. O carril mostra as
duas coisas ao mesmo tempo, e é isso que evita confundir "anda devagar" com
"está à espera da Braval".

O quadro lê com `onSnapshot`: muda-se a fase em `/gestao` e o monitor acompanha
sem ninguém lhe tocar.

---

## Publicar

1. `git push` para o GitHub.
2. Vercel → *Import Project* → as variáveis `NEXT_PUBLIC_FB_*` em
   *Environment Variables*.
3. Firebase → *Authentication* → *Settings* → adicionar o domínio da Vercel aos
   *Authorized domains*, senão o login em `/gestao` não abre.

## No monitor

```
chrome --kiosk --app=https://quadro.vercel.app
```

Desligar a suspensão do ecrã nas opções de energia, e o quadro fica de pé
sozinho depois de cada reinício.
