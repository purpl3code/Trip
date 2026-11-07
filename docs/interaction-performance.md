# Resposta imediata em curtidas e seguir

O fluxo anterior aguardava a escrita no Supabase e, em seguida, todas as consultas de perfis, relações, relatos, comentários e curtidas antes de mostrar o resultado.

Agora cada interação atualiza somente os dados afetados no estado local antes de aguardar a gravação. O botão, seu contador e os perfis envolvidos ficam sincronizados. Em falhas, a alteração é revertida e o componente mostra a mensagem de erro existente.

- Curtir/seguir não fazem nova carga completa do feed.
- Na busca, seguir alguém bloqueia apenas aquele botão enquanto confirma; as outras pessoas continuam disponíveis.
- Leituras que começaram antes da confirmação recebem as alterações locais por cima, sem duplicar contagens. A próxima leitura iniciada após a confirmação reconcilia com o servidor.
- Reversões preservam mudanças simultâneas em outros relatos/pessoas e não alteram o estado de outra conta.
- A consulta inicial removeu os perfis duplicados aninhados em cada relato/comentário: eles já são obtidos pela consulta de perfis.
- O tempo de rede continua existindo; a interface passa a responder sem aguardar essa confirmação.

Validação: build e lint aprovados; 23 testes Node, incluindo gravação atrasada, falha com reversão, contagens idempotentes, ações concorrentes, sincronização de autores e proteção contra leituras antigas. Os testes usam persistência simulada; nenhuma curtida ou relação real foi registrada para esta validação.
