# Tokens — Trip
Primitivos: âmbar #FFAD32, tinta #221506; neutros claros #F5F6F7/#FFFFFF/#ECEFF2 e escuros #0D1117/#161D26/#202A36.
Semânticos: --bg-base (canvas), --bg-elevated (cartão), --bg-subtle (controle), --text-primary, --text-secondary, --text-muted, --border-subtle, --border-medium.
Interação: --app-accent = #985405 em claro e #FFC36A em escuro; preenchimento primário âmbar com tinta escura.
Escala de espaço: 4, 8, 12, 16, 24, 32, 48. Ajustes ópticos do ícone/lettering são preservados.
Raios por função: 10 px em botões e inputs, 16 px em cartões, 24 px em modais.
Tipo: Plus Jakarta Sans; 400 corpo, 600 controles, 700 títulos; números tabulares.
Tamanhos: 12 metadados, 14 rótulos, 15/16 corpo, 22/28 títulos, 32 perfil.
Movimento: 150 ms para cor/borda, 200 ms para opacidade; sem animação de layout; reduced-motion respeitado.
Área segura: --trip-safe-* usa os valores nativos do Capacitor com fallback env().
Fonte de implementação: src/app-design.css.
