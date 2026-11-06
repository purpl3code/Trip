# Revisão UI Craft — Trip
Fonte da metodologia: https://github.com/educlopez/ui-craft — consultada em 06/11/2026.
Escopo: feed, busca, perfil, navegação, login e formulários. Refino visual das telas existentes.
Não foi instalado o CLI global nem executado um score automatizado.

| Antes | Depois | Motivo |
| --- | --- | --- |
| Cartões com texto longo antes da imagem | Foto e local formam a entrada visual do relato | Hierarquia e leitura rápida |
| Lugares representados apenas por ícone | Fotos dos relatos reais quando disponíveis | Reconhecimento do destino |
| Controles com muitos pesos, raios e bordas | Tokens e estados compartilhados | Consistência entre superfícies |
| Navegação e chamadas decorativas competindo com relatos | Navegação mais discreta e marcador ativo próprio | Conteúdo em primeiro plano |
| Formulários sem dicas associadas | Dicas/campos relacionados e validação nativa no envio | Feedback e acessibilidade |

Verificações e limitações serão atualizadas após a inspeção no navegador.

## Craft Report
**Checked:** hierarquia do feed e da busca, uso da marca, tipografia, navegação, estados vazios, formulário de relato, perfil/edição, áreas seguras no CSS e layouts em 320/360/1280 px. Temas claro e escuro inspecionados no navegador.
**Passed:** sem rolagem horizontal nas larguras medidas; login da conta de teste e recarga com sessão preservada; abertura de lugar; filtro Seguindo vazio; busca sem resultados; envio vazio bloqueado com foco no primeiro campo obrigatório; Escape fecha e devolve foco; console sem erros na inspeção final.
**Changed:** foto antes do texto em PostCard.tsx; LocationCard.tsx compartilhado por busca/perfil com foto real e fallback de ícone; títulos de relatos h2; sidebar sem chamada decorativa; busca acessível no cabeçalho desktop; tokens semânticos, números tabulares e indicador ativo em app-design.css; dicas associadas e envio validável em NewPostModal.tsx.
**Left alone:** logo/âmbar e conteúdo dos relatos preservados; nenhuma publicação, comentário, upload, exclusão ou alteração de perfil na revisão. API externa de lugares segue fora do escopo. Recuperação de senha, conflitos de edição e experiência offline completa não foram implementados nesta revisão visual.
**Validation:** npm run build, npm run lint, npm test (5/5) e git diff --check passaram.
**Limits:** não foi executado detector/score UI Craft nem auditoria automatizada de contraste. A inspeção no navegador não substitui teste no Android físico. Novo APK não gerado nesta etapa.
**Verdict:** pronto para avaliação na prévia local, com evidência de navegação e responsividade; validação nativa pendente antes da próxima distribuição.
