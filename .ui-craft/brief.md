# Trip — direção de interface
Aplicativo social de relatos de viagens e gastronomia, em português brasileiro.
Público: pessoas que querem descobrir lugares e registrar experiências sem atrito.
Estilo: contemporâneo, acolhedor, fotográfico; interface de produto, não landing page.
Marca: Norte aberto; manter âmbar #FFAD32, lettering próprio e Plus Jakarta Sans.
Tom: próximo, direto, sem promessas, estatísticas ou conteúdo inventado.
Escopo: refinar a camada visual e os componentes existentes; preservar autenticação e Supabase.
Hierarquia: relato/foto > nome do lugar > ações > metadados/navegação.
CRAFT_LEVEL 8, MOTION_INTENSITY 2, VISUAL_DENSITY 5, DESIGN_VARIANCE 5.
Detalhe de identidade: seleção de aba somente com ícone/texto em âmbar, sem cápsula, fundo ou borda; quatro opções iguais na barra inferior.

## Restrições aprendidas
- Não reintroduzir a seção “Seu diário de bordo” nem o atalho “Qual foi sua última descoberta?”.
- Respeitar os 24 px entre o cabeçalho e o primeiro título no celular.
- Preservar áreas seguras nativas fornecidas pelo Capacitor; sem altura fixa para barra Android.
- Claro e escuro são opções equivalentes; respeitar a preferência salva.
- A busca atual consulta relatos da comunidade; API externa de lugares fica para depois.
- Não publicar relatos ou comentários durante a revisão.
- Evitar animações de entrada e dependências de animação.

## Correções aprovadas em 06/11/2026
- Tema e sino no cabeçalho; sem opção de tema na barra inferior.
- Relatar é uma página dedicada, sem popup, e mantém rascunho ao trocar de aba.
- Mesma tipografia e posição para os títulos de Explorar, Buscar e Relatar.
- Perfil sem “Voltar a explorar” e sem cabeçalho extra “Meu diário”.
- Ícones e textos das quatro abas em linhas fixas e com a mesma largura/altura.

- Navegação minimalista: seleção apenas em cor e espessura sutil do ícone, sem caixa ao redor.

- Feed sem botão de atualizar: gesto de puxar no topo com indicador discreto, sem interferir na rolagem normal.

## Trip 2.0 — Liquid Glass
- Material de vidro com reflexos finos, transparência e profundidade nos dois temas.
- Navegação flutuante inteira em vidro; seleção de cada aba continua apenas em cor/ícone.
- Blur concentrado no cabeçalho, navegação e diálogos; cartões usam material leve para rolagem fluida.
- Fotos e relatos continuam sendo o foco; sem novas seções decorativas.
- Contraste, modo de movimento reduzido e alternativa sem transparência são parte da entrega.
