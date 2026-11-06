# Atualizações nativas — Trip

O sino no cabeçalho consulta a versão publicada ao abrir o app e ao voltar ao primeiro plano (intervalo mínimo de 10 minutos). Não é push em segundo plano e não pede permissão de notificações do Android.

## Distribuição
O workflow Build Android APK executa os testes Java de política de atualização, compila e assina o APK e publica Trip.apk e update.json juntos no GitHub Releases.
Sempre aumentar versionCode e versionName em android/app/build.gradle antes de uma distribuição.
A primeira instalação com o atualizador integrado é manual; versões anteriores não contêm o plugin nativo.

## Fluxo
1. O app consulta https://github.com/purpl3code/Trip/releases/latest/download/update.json.
2. Se versionCode for maior que o instalado, o sino mostra um indicador.
3. A pessoa abre Notificações e toca em Baixar e atualizar.
4. Download no cache privado, com progresso, limite de tamanho, tempo e redirecionamentos HTTPS.
5. Confere SHA-256, identificador do pacote, versão e certificado de assinatura do APK instalado.
6. Se necessário, abre a permissão do Android para o Trip instalar pacotes. Ao retornar, a pessoa toca em Continuar instalação.
7. Abre o instalador do sistema. A confirmação final é sempre da pessoa.

Cancelamento do instalador permite abrir novamente sem baixar o arquivo outra vez. Reiniciar o app antes de instalar exige novo download.
Não há atualização silenciosa, alteração de dados do Supabase ou remoção do app.
A versão web mostra o link da release, sem simular instalação nativa.

## Verificação
Testes locais: build, lint, 7 testes Node; testes Java rodados no GitHub Actions.
Teste no aparelho ainda necessário para autorização de instalação, interrupções do processo e atualização entre APKs assinados.
Referências: https://capacitorjs.com/docs/plugins/android e https://developer.android.com/reference/android/content/pm/PackageManager#canRequestPackageInstalls()
