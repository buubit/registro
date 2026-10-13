# Registro de Atividades — a ideia inteira

App pessoal do professor Pablo Augusto para registrar, por foto, as atividades entregues pelos alunos.
Roda offline, no próprio celular, sem servidor e sem conta.

---

## 1. O problema que ele resolve

A entrega de atividade some. O aluno entrega, o caderno volta pra mochila, e três semanas depois ninguém
consegue provar o que foi feito. Na reunião de pais, "meu filho entregou" vira palavra contra palavra. E na
hora de lançar nota no sistema da Secretaria, o professor garimpa caderno por caderno, atrasa, e acaba
lançando no chute.

A ideia nasceu de um gesto único: **abriu, tirou foto, pronto**. Sem digitar nada em sala. A organização
acontece sozinha, e a parte que exige julgamento — a nota — fica pra depois, com calma.

O ganho que mais importa, segundo o próprio uso: chegar na reunião, clicar no nome do aluno e mostrar a foto,
sem precisar ler nada na hora.

---

## 2. Decisões que definem o projeto

**A nota é sempre humana.** Nenhuma IA avalia produção. O app só oferece o campo em branco. A nota vai de 0 a
10, com meio ponto.

**O celular é o dono dos dados.** Sem nuvem, sem login, sem internet. As fotos ficam no armazenamento interno
do app (IndexedDB), que a galeria e o Google Fotos não enxergam. Limpar a galeria não apaga nada.

**O silêncio é informação.** Quem não foi fotografado não exige nenhuma ação do professor: ao encerrar a
atividade, o app marca sozinho quem não entregou.

**O atraso é registrado, não perdoado nem punido no escuro.** Entrega depois do fechamento entra como
atrasada, com desconto automático configurável, e o app guarda os dois números — a nota dada e a nota final.

**Nada é apagado por transferência.** Aluno que sai da escola vai para uma seção separada; as fotos e as notas
continuam acessíveis para quando a secretaria pedir.

---

## 3. Estrutura das salas

Sala = turma + disciplina. São 14:

| Disciplina | Turmas |
|---|---|
| Inglês | 6º A, B, C, D, E |
| Orientação de Estudos em Língua Portuguesa | 6º A, B, C, D, E e 8º A, B, C, D |

A mesma turma aparece duas vezes no 6º ano, com notas e atividades separadas. O aluno é da turma, não da sala —
por isso o perfil dele mostra o histórico das duas disciplinas junto.

---

## 4. Modelo de dados

**turma** → id, nome, alunos
**aluno** → id (fixo), nome, turma, situação (ativo / saiu em dd/mm)
**atividade** → id, sala, título, data, ritmo, desconto por atraso, encerrada
**registro** → id, aluno, atividade, situação, lista de fotos, data da entrega, nota, data da correção

O **registro** é a peça central: uma linha por aluno por atividade. É ele que carrega as fotos e a nota.

Duas particularidades:

- **O número de chamada não é guardado.** Ele é calculado na hora, por ordem alfabética entre os alunos ativos
  da turma. Aluno novo entra no meio da lista e todo mundo abaixo desce um, igual a escola faz. O id do aluno
  é fixo, então o histórico não se perde na renumeração.
- **Uma entrega pode ter várias fotos.** Texto de cinco folhas são cinco fotos no mesmo registro, numeradas.

---

## 5. Os três fluxos

### Fotografar (em sala, segundos)
Escolhe a sala → nomeia a atividade → define o ritmo → aparece a grade da turma. Toque no aluno abre a câmera.
Toque de novo soma páginas. "Encerrar e corrigir" fecha a turma e já abre a pilha de correção.

**Ritmo único**: tem prazo. Ao encerrar, quem não foi fotografado vira "não entregue", e quem entregar depois
entra como atrasado.
**Ritmo próprio**: usado em Orientação de Estudos, onde cada aluno avança conforme o nível de proficiência.
Ninguém é marcado como não entregue, a atividade fica aberta e cada um entrega quando chegar lá.

### Corrigir (depois, com calma)
A correção é uma pilha: a foto ocupa a tela, um toque no número dá a nota e já entra o próximo aluno. Sem
salvar, sem voltar, sem menu. Um toque por aluno.

### Consultar
**Perfil do aluno** — média, total de atividades, não entregues, e a linha do tempo com miniatura, data e nota.
O **modo reunião** transforma a linha do tempo num mural de fotos com datas, para virar o celular para o
responsável.
**+ entrega** permite lançar uma atividade avulsa naquele aluno a qualquer momento, sem reabrir a turma.

---

## 6. Relatórios

**Por atividade** — quem entregou e quem falta, com porcentagem. Ao lado de cada faltante há o botão
"entregou", que fotografa dali mesmo. Dá para copiar a lista de quem falta para colar no WhatsApp ou baixar a
planilha só dessa atividade.

**Quem está devendo (por sala)** — a turma ordenada de quem menos entregou para quem mais entregou, com a
contagem (3/12).

**Aba Devendo (geral)** — varre todas as salas e mostra quem entregou no máximo 0, 1, 2 ou 3 atividades, com
filtro por matéria. A conta é por sala: um aluno do 6º pode estar em dia em Inglês e devendo tudo em OE, e
somar os dois esconderia exatamente o que interessa.

---

## 7. Fotos, espaço e backup

A foto é comprimida antes de ser guardada: redimensionada para 1200px e salva em JPEG. Uma folha de caderno
legível fica em torno de 250 KB, contra 4 a 8 MB da foto crua. É uma diferença de vinte vezes.

A captura é interna do app, então a foto não vai para a galeria.

**Três formas de tirar os dados de dentro:**

1. **Planilha de notas (CSV)** — disciplina, turma, número, aluno, atividade, data da entrega, situação, nota
   dada, desconto e nota final. É a cola para lançar no sistema da Secretaria.
2. **Backup completo (JSON)** — estado e fotos num arquivo só, para guardar no Drive.
3. **Restaurar backup** — devolve tudo em um celular novo.

O que apaga os dados de verdade não é limpeza de galeria: é limpar **dados de site** no Chrome, ou "Limpar
dados" do Chrome nas configurações do Android. Cache é seguro; dados, não. Daí a regra: backup completo no fim
de cada bimestre, e antes de qualquer faxina no celular.

---

## 8. Arquivos e instalação

| Arquivo | Função |
|---|---|
| `index.html` | o app inteiro: telas, lógica, estilo e a lista de alunos |
| `sw.js` | service worker — faz funcionar offline |
| `manifest.webmanifest` | nome, cor e ícones do app instalado |
| `icone-192.png`, `icone-512.png` | ícone na tela inicial |

**Instalar:** subir os cinco arquivos num repositório público do GitHub → Settings → Pages → branch `main` →
abrir o endereço no Chrome do celular → menu ⋮ → Instalar aplicativo.

O endereço serve só para instalar; o navegador só libera câmera e instalação em endereço seguro. Depois disso,
as fotos e as notas nunca saem do aparelho.

**Atualizar:** trocar só o `index.html` e o `sw.js`, fechar o app por completo e abrir de novo duas vezes. Os
dados ficam no banco do celular, separados dos arquivos do app, e não são afetados — desde que o endereço
continue o mesmo. Se mudar de endereço, é restaurar pelo backup.

---

## 9. Limites conhecidos

- O banco está amarrado ao endereço. Trocar de repositório exige restaurar o backup.
- O backup completo cresce junto com as fotos (em setembro de 2026 já estava em 88 MB).
- Não há sincronização entre dois aparelhos. É um app de um professor, num celular.
- Apagar foto e apagar atividade não têm desfazer.

---

## 10. O que ficou de fora, por escolha

Chamada e presença, nota automática por IA, e qualquer integração com o sistema da Secretaria. A exportação em
planilha cobre a necessidade sem depender de API nenhuma.

---

## 11. Notas para a SED (OE) — outubro de 2026

Botão **Notas para a SED** na tela Salas. A nota não é mais dada aluno por aluno: **tem foto = fez**.

- **8º:** título com "Missão" vai para a coluna *missões*; o resto vai para *produções*.
- **6º:** tudo conta como *produções*. *Jovem CAS* é 10 para todos, e o favorito preenche sozinho.
- Cada atividade vale 10 ÷ (quantas atividades daquele grupo a sala tem no bimestre). Conta só o que está no app.
- Arredondamento: abaixo de ,8 desce; de ,8 pra cima sobe (6,67 → 6; 7,5 → 7; 8,8 → 9).
- **Bimestre:** cada atividade guarda o seu (`bim`). As antigas, sem marca, são do 3º. O bimestre atual é escolhido na tela da SED, e as atividades novas entram nele. Dá pra corrigir em "ajustar atividade".

**Fluxo:** a SED bloqueia preenchimento automático (avisa "interações automatizadas" e apaga o que foi preenchido), então a digitação é manual, mas guiada. Em *Notas para a SED*, toque na turma e escolha a coluna (Missões, Produções ou, no 6º, Jovem CAS). Na SED, deixe Exibir em 100 e clique no título **Nome** para ordenar de A a Z: a lista do app fica na mesma ordem. Digite nota + Tab, nota + Tab… Tocar numa linha do app marca até onde já foi digitado.

O caminho na SED é Diário de Classe → Avaliação → Lançamento, entrando pelo menu (pelo endereço direto, os filtros vêm vazios) → cartão da turma → *Notas e Edição* → escolher o bimestre → clicar no nome da avaliação → *Lançar Nota*.
