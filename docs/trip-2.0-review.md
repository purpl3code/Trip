# Trip 2.0 — revisão de interface e funcionamento

## Resultado
Material Liquid Glass em claro e escuro, com a identidade Norte aberto preservada. Cabeçalho e navegação flutuante têm transparência, reflexão fina e profundidade; cartões e fotos mantêm a leitura como prioridade. A seleção móvel continua minimalista, apenas em cor e espessura do ícone.

## Revisão por área
| Área | Alteração / conferência |
| --- | --- |
| Login e cadastro | Material, contraste e campos padronizados; limites de nome/bio; campos bloqueados durante envio; prevenção de submissão repetida. Login real conferido com a conta de teste. Cadastro revisado em código, sem criar nova conta. |
| Explorar | Título alinhado às outras páginas, cartões e fotos refinados; botão extra removido; gesto de puxar no topo com limiar, cancelamento horizontal e proteção contra clique acidental. |
| Busca | Filtros, lugares e pessoas com o mesmo material; busca sem acentos confirmada; lugar abre no topo; estados vazios preservados. |
| Relatar | Página dedicada preservada. Rascunho por conta em IndexedDB, incluindo fotos, com estado de salvamento e fallback quando o armazenamento falha. Texto restaurado após reload; foto adicionada, recortada, restaurada após reload e removida, sem publicação. |
| Fotos | Recorte limitado a 1600 px com saída JPEG; compressão instala handlers antes de iniciar leitura; imagem indisponível tem fallback em relatos, lugares, capa e galeria. |
| Perfil | Capa como primeiro conteúdo, sem título extra; estatísticas e abas alinhadas; identificação do perfil separada da do rascunho para evitar colisão de keys; diários vazio e com conteúdo inspecionados; galerias e visualizador conferidos. |
| Editar perfil | Material e ações refinados; atualização de dados não apaga edição em andamento; validação de nome vazio e limites. Abertura, Escape e retorno de foco conferidos; sem salvar alterações públicas. |
| Conversas | Hierarquia de título corrigida, campos e avaliações preservados; limites também validados no contexto. Abertura e leitura conferidas; sem publicar comentários. |
| Notificações | Material e estado web conferidos. Download nativo protegido contra chamadas simultâneas; checagens não competem com instalação e falhas são limitadas no tempo. |
| Sessão e dados | Consultas independentes em paralelo; atualização deduplicada; ações de seguir/curtir isoladas por conta; reparo de perfil com uma única tentativa; armazenamento restrito tolerado sem impedir login. |
| Navegação | Quatro colunas iguais, ícone e legenda em linhas fixas, área segura respeitada; botões do cabeçalho com pelo menos 44 px. Tema no cabeçalho também no desktop. |

## Validação
- TypeScript e build de produção aprovados.
- Lint aprovado.
- 14 testes Node: busca, médias, agrupamento, erros, rascunhos, armazenamento persistente/temporário/restrito, gesto e manifesto de atualização.
- Revisão visual em 320 × 740, 390 × 844, 506 × 884 e 1440 × 1000.
- Temas claro/escuro; nenhum overflow horizontal nos tamanhos inspecionados.
- Diálogos: fundo inativo, Escape, foco inicial e restauração; links incluídos na contenção de foco.
- Fotos públicas existentes usadas apenas para leitura. Nenhum relato, comentário, curtida, exclusão, follow ou alteração de perfil foi enviado durante esta revisão.
- A imagem usada no rascunho foi o próprio ícone local do projeto; o rascunho de teste foi limpo.

## Material e desempenho
A camada de material fica em src/liquid-glass.css; estrutura e áreas seguras ficam em src/app-design.css. Não foram adicionadas dependências de animação. Blur é concentrado no chrome e em overlays, evitando um filtro por cartão no feed. Diálogos usam uma entrada curta de 180 ms; movimento reduzido desativa animações. Sem suporte a backdrop-filter ou com preferência por menor transparência/maior contraste, as superfícies ficam sólidas.

## Limites
A revisão de navegador não substitui teste em aparelho físico. O gesto de toque, barras do Android, permissão de instalação e instalação sobre a versão anterior precisam de conferência no celular. Os testes automatizados do gesto validam sua lógica, não um toque físico. Publicação, exclusão, follow e alteração de perfil não foram executados sobre dados públicos; os respectivos caminhos foram revisados em código. O fallback de imagem e o banner offline foram revisados em código, sem bloquear a conexão do computador do usuário.
