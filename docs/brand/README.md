# Trip — Norte aberto

A bússola aberta representa a próxima descoberta. Conserva o âmbar da identidade original, com contornos sólidos e a agulha separada do aro.

## Arquivos
- trip-symbol-*.svg: símbolo isolado.
- trip-horizontal-*.svg e trip-stacked-*.svg: assinaturas horizontal e vertical.
- trip-wordmark-*.svg: lettering próprio TRIP, construído em contornos, sem dependência de fonte.
- trip-app-icon.svg e trip-icon-*.png: ícones digitais.
- As versões ink, black, white e amber permitem aplicação em fundos claros e escuros.

## Cores
| Cor | HEX | RGB | CMYK aproximado |
| --- | --- | --- | --- |
| Âmbar | #FFAD32 | 255,173,50 | 0,32,80,0 |
| Tinta | #221506 | 34,21,6 | 0,38,82,87 |
| Branco | #FFFFFF | 255,255,255 | 0,0,0,0 |

CMYK é uma conversão de referência e exige prova de impressão. Pantone não definido. Lettering da interface: #F5A124, preservando a aparência anterior.

## Aplicação
Margem livre mínima: 24 unidades da malha de 256 (espessura do aro).
Símbolo a partir de 16 px; preferir 24 px. Assinatura horizontal a partir de 120 px.
Usar tinta sobre âmbar, preto sobre branco ou branco sobre fundo escuro.
Evitar âmbar sobre branco em tamanhos pequenos. Não distorcer, girar, adicionar sombras ou fechar a abertura. Em fotos, aplicar sobre fundo sólido.
Android: marca dentro da área segura central da camada de 108 dp.

## Manutenção
Editar src/assets/trip-symbol.svg e trip-wordmark.svg; executar npm run brand:generate.
O comando gera kit, favicon, ícones web, PNGs Android e vetor adaptativo a partir da mesma geometria.
Mestres sem texto vivo, filtros ou imagens. Revisão em preto/branco, invertido, espelhado, girado e tamanhos 16/24/32/64/512 px.
A apresentação usa simulações de aplicação. Sem liberação jurídica de marca.
