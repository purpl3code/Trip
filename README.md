# Trip

Diário social de viagens e experiências gastronômicas, feito com React, TypeScript, Vite, Supabase e Capacitor para Android.

## Desenvolvimento local

Use Node.js 22.18+ ou 24 e npm. Na raiz do projeto:

```powershell
npm install
Copy-Item .env.example .env.local
```

Preencha o arquivo local com a URL do projeto Supabase e a chave pública:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

A variável aceita uma chave publishable ou a antiga anon. Não use service_role ou secret no frontend. O arquivo .env.local é ignorado pelo Git. O cliente ainda contém os valores públicos padrão do projeto para compatibilidade com o APK atual.

```powershell
npm run dev
```

## Verificação

```powershell
npm run build
npm run lint
npm test
```

Os testes cobrem busca sem acentos, agrupamento de lugares, média de todas as avaliações e mensagens de erro. A revisão manual deve incluir os dois temas, cadastro/login, busca, perfil, formulários e navegação pelo teclado.

## Ícone e Android

A fonte do ícone é src/assets/app-icon.svg. Para regenerar todas as densidades:

```powershell
npm run icons:android
npm run build
npx capacitor sync android
```

Para compilar localmente, configure Java 21 e o Android SDK. A pipeline em .github/workflows/build-apk.yml gera o APK de release no GitHub. Alterações web e no ícone aparecem no celular após gerar e instalar uma nova versão.

## Comportamento do app

- Busca ignora acentos e abre os relatos de cada lugar.
- As médias dos lugares consideram cada avaliação individual.
- Formulários preservam o conteúdo ao falhar e mostram o resultado de envio.
- O rascunho de um relato é mantido ao fechar a janela durante a sessão atual; fotos locais são liberadas ao descartar ou enviar.
- As janelas usam Escape, foco contido, restauração de foco e fundo inativo.
- Fotos aceitam JPG, PNG e WebP de até 10 MB; relatos têm limite de oito fotos.
- A confirmação de cadastro por e-mail respeita a configuração de Auth do Supabase.
