# Revisão de design e funcionamento — 10/10/2026

## Correções

- Busca de lugares abria o perfil do autor: agora abre os relatos do lugar.
- A busca comparava o usuário com o primeiro perfil do banco: agora usa a conta conectada e impede seguir a si mesmo.
- Busca sensível a acentos e resultados vazios incorretos por filtro: normalização e estado vazio específico.
- Média de lugares dava o mesmo peso a relatos com quantidades diferentes de avaliações: agora calcula sobre todas as notas válidas.
- Erros em publicação e edição eram engolidos pelo contexto; formulários fechavam como se houvesse sucesso: erros chegam ao formulário e preservam os campos.
- Comentários eram apagados antes da confirmação de envio: agora aguardam sucesso.
- Cliques simultâneos em curtir/seguir podiam enviar operações duplicadas: operações em andamento são bloqueadas.
- Compressão produzia JPEG com extensão/MIME de outra imagem: upload usa o tipo real do arquivo comprimido.
- URLs de prévias eram criadas a cada renderização: criação e revogação controladas por efeito.
- Carregamento fazia requisições dentro do callback de Auth e mantinha seleção antiga de perfil: callback adiado, contador para descartar respostas antigas e atualização funcional da seleção.
- Cadastro tentava entrar novamente mesmo quando exigia confirmação por e-mail: mostra instrução de confirmação e evita criação duplicada de perfil.
- Exclusão de relato agora verifica a autoria antes de alterar comentários ou curtidas.
- Contexto separado do componente do provider evita perder a referência durante Fast Refresh; fallback de erro evita uma tela em branco.

## Design

Identidade de bússola preta e laranja; cartões opacos, contraste maior, textos legíveis, navegação com rótulos, feed com convite para publicar, busca com lugares e pessoas, perfil com estatísticas, estados vazios com ações e galeria de fotos acessível. Janelas usam portal, foco contido, Escape e fundo inativo. Layouts móvel e desktop, com suporte a áreas seguras do Android e preferência por movimento reduzido.

## Validação

- Build de produção e lint sem erros ou avisos.
- Cinco testes automatizados de busca, avaliações e mensagens de erro.
- No navegador: login incorreto/correto, logout, recuperação da sessão, busca sem acentos, filtro vazio, abertura de local, perfil, salvamento do perfil, rascunho e Escape.
- Revisão visual nos temas claro/escuro e larguras de 360px, padrão do navegador e 1280px.

## Limites

Não foram publicados relatos/comentários, enviadas fotos ao Storage ou executadas exclusões durante esta revisão. As correções desses fluxos foram conferidas no código e no build; a validação completa deve usar um ambiente de teste do Supabase. Recuperação de senha continua pendente. Não foi gerado APK localmente: Java e Android SDK não estão instalados neste ambiente.
