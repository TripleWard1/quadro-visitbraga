# Brief II — dar vida ao quadro e prepará-lo para carga real

## O erro que eu andava a repetir

Desenhei sempre para o quadro que tenho à frente: uma pessoa, três trabalhos.
Nunca desenhei para o quadro que vai existir daqui a um mês: **catorze pessoas,
duas a cinco frentes cada, quarenta a sessenta registos vivos**. São dois
problemas opostos e eu só resolvia um de cada vez.

- Com pouca coisa, um cartaz espaçado parece morto.
- Com muita coisa, o mesmo cartaz transborda e deixa de caber no ecrã.

Um layout fixo não serve os dois. Tem de haver **composição que responde à
carga**.

## Diagnóstico do "sem sal"

O quadro atual é correto e é aborrecido, e vale a pena perceber porquê:

**Não acontece nada.** Um monitor de parede que nunca muda transforma-se em
mobília: ao terceiro dia, ninguém olha. A rotação anterior era interativa mas
gratuita — mudava para mostrar o mesmo tipo de informação.

**Só há uma leitura dos dados.** Tudo é "por pessoa". Quem passa vê sempre a
mesma matriz. Não há segunda pergunta a que o quadro responda.

**O tempo não existe.** O prazo é uma linha de texto dentro de um cartão. Numa
divisão que trabalha por prazos, não haver representação visual do tempo é a
maior ausência do quadro.

**Ninguém é recompensado por atualizar.** Quem mexe no telemóvel não vê nada
acontecer na parede. Sem retorno visível, o registo morre em duas semanas — e
sem registo, o quadro fica vazio e a culpa parece ser das pessoas.

## Sete decisões

**1. Cenas, não abas.** O centro do quadro passa por três cenas — *Equipa*,
*Semana*, *Frentes* — com transição suave e o nome à vista. A diferença para
a rotação antiga: cada cena responde a uma **pergunta diferente**. E só entram
em rotação as que têm dados que a justifiquem: com uma frente de trabalho, não
há cena de frentes.

**2. Cabeçalho, números, alerta e equipa ficam sempre.** O essencial nunca
depende de esperar. Só muda o miolo.

**3. A cena da Semana — o tempo passa a ver-se.** Oito colunas, de *Atrasado*
a daqui a uma semana, com cada trabalho como uma pastilha na coluna do seu
prazo. Numa vista percebe-se se a semana está carregada à frente ou às costas,
e recupera-se o "entra a seguir" que se tinha perdido — numa forma que aguenta
quarenta registos em vez de mostrar quatro.

**4. Densidade adaptativa.** Até seis pessoas ocupadas, cartões largos com
carril e prazo. Acima disso, os cartões passam a linhas compactas: uma linha
por trabalho, com inicial, fase em pastilha e prazo. A mesma informação, um
terço da altura. O quadro deixa de transbordar aos dez utilizadores.

**5. O quadro reage a quem o alimenta.** Qualquer alteração feita no telemóvel
acende o cartão respetivo durante uns segundos e escreve uma linha no canto:
*"Ana avançou Relatório para Em aprovação — há 12 s"*. É o mecanismo que faz o
hábito pegar: quem atualiza vê o seu nome na parede da divisão.

**6. Movimento com significado.** Os números pulsam quando mudam. Os atrasados
respiram devagar. Nada se mexe sem ter uma razão — e tudo pára com
`prefers-reduced-motion`.

**7. Hierarquia tipográfica a sério.** Os números de estado passam a ser o maior
elemento do ecrã depois do relógio. Um trabalho atrasado escreve-se maior do que
um trabalho em dia. A escala transporta significado em vez de ser uniforme.

## Critério de aceitação

Três testes, e o quadro tem de passar aos três:

- **Vazio**: com dois registos, o ecrã tem de parecer intencional, não
  inacabado.
- **Cheio**: com sessenta registos e catorze pessoas, tem de caber, sem barra
  de deslocamento e sem letra ilegível a quatro metros.
- **Vivo**: uma alteração feita no telemóvel tem de ser visível na parede em
  menos de cinco segundos, sem ninguém tocar em nada.
