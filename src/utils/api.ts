const configuredApiBase = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''

export const apiBase =
  import.meta.env.PROD && configuredApiBase.includes('localhost')
    ? ''
    : configuredApiBase
