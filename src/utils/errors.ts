export function errorMessage(error: unknown, fallback = 'Não foi possível concluir. Tente novamente.') {
  const message = error instanceof Error ? error.message : (error as { message?: string } | null)?.message || '';
  if (/fetch|network|load failed/i.test(message)) return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail antes de entrar.';
  if (/user already registered/i.test(message)) return 'Esse e-mail já está cadastrado. Entre na sua conta.';
  if (/rate limit/i.test(message)) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  if (/row-level security|permission denied/i.test(message)) return 'Você não tem permissão para concluir esta ação.';
  return message || fallback;
}
