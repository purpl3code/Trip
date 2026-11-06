# Tokens — Trip 2.0
Marca: Norte aberto; âmbar #FFAD32, tinta #221506, Plus Jakarta Sans.
Canvas: #EDF1F6 claro e #0B1017 escuro.
Texto: #202B3B / #526176 / #68778C claro; #F1F5FA / #BDCBDD / #95A7C0 escuro.
Material: --glass-base, --glass-card, --glass-control, --glass-field, --glass-rim, --glass-edge, --glass-shadow.
Chrome: gradiente de reflexão, blur 22 px e saturação 145%; apenas em cabeçalho, navegação, sidebar e overlays.
Cartões: gradiente translúcido sem backdrop-filter para não multiplicar custo no feed.
Interação: --accent-readable mantém âmbar escuro em claro e claro em escuro; botão primário usa tinta escura.
Raios: 14 px controles; 22/24 px cartões; 24/28 px diálogos; 26 px navegação móvel.
Espaço: 4, 8, 12, 16, 24, 32, 48. Primeiro título 24 px abaixo do cabeçalho móvel.
Toque: cabeçalho 44 px; navegação 56 px com quatro colunas e duas linhas fixas.
Movimento: 180 ms, diálogo 8 px; sem animações de entrada no feed. Reduced motion/transparency e alto contraste têm fallback.
Áreas seguras: --trip-safe-* do Capacitor com fallback env(), sem altura fixa de barra Android.
Fontes: src/app-design.css (layout), src/liquid-glass.css (material 2.0).
