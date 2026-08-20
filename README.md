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
  page.tsx            o quadro de parede
  gestao/page.tsx     onde se regista trabalho e se muda a fase
  globals.css         toda a folha de estilo
components/
  Quadro.tsx          rotação de ecrãs, relógio, atalhos
  CartaoPessoa.tsx    o cartão de cada pessoa
  Carril.tsx          as quatro paragens da fase
  Fluxo.tsx           ecrã de colunas por fase
  ListaLateral.tsx    "Em atraso" e "Entra a seguir"
  FormularioTrabalho.tsx   registar trabalho
  PainelTarefas.tsx   as tarefas da divisão (só o chefe)
  Entrada.tsx  MudarPalavra.tsx  Cabecalho.tsx  Legenda.tsx  Rodape.tsx
lib/
  config.ts           logótipo, tempos de rotação, cartões por ecrã
  fases.ts            as quatro fases — a espinha do quadro
  dadosDemo.ts        a equipa
  tipos.ts  datas.ts  tarefas.ts  erros.ts
  firebase.ts  firebaseConfig.ts  useQuadro.ts
firestore.rules       quem pode escrever o quê
```

## Vocabulário

Três palavras, e vale a pena não as trocar:

- **Tarefa** — uma frente de trabalho da divisão (Green Destinations, o plano
  estratégico, o licenciamento). Só o chefe de divisão as escreve.
- **Trabalho** — o que uma pessoa concreta está a fazer dentro de uma tarefa,
  ou fora dela. É isto que aparece no monitor.
- **Fase** — em que ponto está esse trabalho: por fazer, em curso, em
  aprovação, concluída.

## Modelo de dados

**`pessoas`** — id do documento = email. `nome`, `iniciais`, `papel`
(`chefe` ou `tecnico`), `ativo`, `ordem`. A equipa está em `lib/dadosDemo.ts`
e é essa lista que o monitor desenha, tenha a pessoa entrado ou não; o
Firestore só acrescenta o que souber de cada uma.

**`tarefas`** — `nome`, `ativo`, `ordem`. Qualquer pessoa da divisão cria
uma; arquivar e renomear é do chefe, para a lista não andar aos saltos.

**`trabalhos`** — `titulo`, `tarefa` (id, pode ficar vazio), `responsavel`
(email), `fase`, `bloqueada`, `motivo`, `prazo` (timestamp **ou `null`** para
trabalho contínuo), `atualizadoEm`.

Fase e bloqueio são campos separados de propósito: um trabalho pode estar *em
aprovação* **e** parado à espera de terceiros. O carril mostra as duas coisas
ao mesmo tempo — é o que evita confundir "anda devagar" com "está à espera da
Braval".

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

O quadro (`/`) não pede sessão nenhuma — é só leitura, é para ficar no monitor.
Quem quiser mexer vai a **`/gestao`** e entra com o email de trabalho.

Na primeira vez a palavra-passe é **123456**. A conta cria-se sozinha nesse
momento — não é preciso registar catorze pessoas à mão — e o ecrã seguinte
obriga a escolher outra palavra-passe antes de deixar chegar ao quadro. Depois
disso, quem quiser mudá-la outra vez tem o botão *palavra-passe* no topo da
página. Tudo dentro da app: nenhum email é enviado a ninguém.

A palavra-passe inicial está em `lib/config.ts`, em `PALAVRA_PASSE_INICIAL`.

**Na consola do Firebase, um passo só:**
Authentication → **Sign-in method** → ativar **Email/Password** (só o primeiro
interruptor; o *Email link* fica desligado). É isto — a entrada por
palavra-passe não depende de domínios autorizados, por isso funciona no
StackBlitz, no localhost e na Vercel sem mais configuração.

As pessoas são reconhecidas pelo **email**, que está em `lib/dadosDemo.ts`.
Segui o padrão `nome.apelido@cm-braga.pt` — confirma-os, porque um email
errado faz a pessoa entrar e ver "email por reconhecer".

### Quem pode fazer o quê

| | Técnico | Chefe de divisão |
|---|---|---|
| Criar trabalho para si | sim | sim |
| Avançar, recuar, marcar parada, apagar o **seu** trabalho | sim | sim |
| Mexer no trabalho dos outros | não | sim |
| Atribuir trabalho a outra pessoa | não | sim |
| Criar uma tarefa da divisão | sim | sim |
| Arquivar ou renomear tarefas | não | sim |

Cada pessoa responde pelas suas atribuições: vê o trabalho da divisão toda no
separador *A divisão*, mas nas tarefas de outros os botões não aparecem.

Isto está garantido nos dois sítios que interessam. Na interface, para não
haver botões que enganam. E em `firestore.rules`, que é onde de facto se
decide — o email do chefe de divisão está lá escrito por extenso, porque é a
única coisa que não pode viver na base de dados: se vivesse, qualquer pessoa
se promovia a si própria ao criar o seu registo. **Se o chefe de divisão
mudar, muda-se em `firestore.rules` e em `lib/dadosDemo.ts`.**

### Como se usa a página

O topo mostra três números — tarefas tuas, a fechar hoje, em atraso — para se
perceber a situação sem ler nada.

Ao criar trabalho, o prazo tem atalhos (*Hoje*, *Amanhã*, *Esta sexta*, *Daqui
a 1 semana*) porque escrever uma data num telemóvel é um suplício. O projeto
escolhe-se de uma lista, não se escreve à mão: assim não aparecem no monitor
três grafias do mesmo projeto.

Cada tarefa mostra o carril das cinco fases com a atual em destaque, e um botão
que diz para onde vai a seguir — *Avançar para Em revisão*, não um seletor
genérico. Ao lado ficam o recuar, o marcar parada (que pergunta à espera de
quê) e o apagar.

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
