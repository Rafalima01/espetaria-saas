// Limitador de tentativas em memória (janela fixa). Serve para o login de uma
// instância só; se o sistema rodar em várias instâncias, cada uma conta
// separado e o limite efetivo fica maior (e zera ao reiniciar o servidor).

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function current(key: string, now: number): Bucket | undefined {
  const bucket = buckets.get(key)
  if (bucket && bucket.resetAt <= now) {
    buckets.delete(key)
    return undefined
  }
  return bucket
}

/** Minutos restantes de bloqueio, ou 0 se a chave ainda pode tentar. */
export function blockedMinutes(key: string, limit: number): number {
  const now = Date.now()
  const bucket = current(key, now)
  if (!bucket || bucket.count < limit) return 0
  return Math.max(1, Math.ceil((bucket.resetAt - now) / 60_000))
}

/** Registra uma tentativa que falhou. */
export function recordFailure(key: string, windowMs: number) {
  const now = Date.now()
  const bucket = current(key, now)
  if (bucket) bucket.count += 1
  else buckets.set(key, { count: 1, resetAt: now + windowMs })

  // Evita crescer sem limite com chaves antigas.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  }
}

export function clearFailures(key: string) {
  buckets.delete(key)
}
