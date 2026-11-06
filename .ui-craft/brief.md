# Trip — direção de interface
Aplicativo social de relatos de viagens e gastronomia, em português brasileiro.
Público: pessoas que querem descobrir lugares e registrar experiências sem atrito.
Estilo: contemporâneo, acolhedor, fotográfico; interface de produto, não landing page.
Marca: Norte aberto; manter âmbar #FFAD32, lettering próprio e Plus Jakarta Sans.
Tom: próximo, direto, sem promessas, estatísticas ou conteúdo inventado.
Escopo: refinar a camada visual e os componentes existentes; preservar autenticação e Supabase.
Hierarquia: relato/foto > nome do lugar > ações > metadados/navegação.
CRAFT_LEVEL 8, MOTION_INTENSITY 2, VISUAL_DENSITY 5, DESIGN_VARIANCE 4.
Detalhe de identidade: indicador de navegação em forma de agulha a 45 graus.

## Restrições aprendidas
- Não reintroduzir a seção “Seu diário de bordo” nem o atalho “Qual foi sua última descoberta?”.
- Respeitar os 24 px entre o cabeçalho e o primeiro título no celular.
- Preservar áreas seguras nativas fornecidas pelo Capacitor; sem altura fixa para barra Android.
- Claro e escuro são opções equivalentes; respeitar a preferência salva.
- A busca atual consulta relatos da comunidade; API externa de lugares fica para depois.
- Não publicar relatos ou comentários durante a revisão.
- Evitar animações de entrada e dependências de animação.
