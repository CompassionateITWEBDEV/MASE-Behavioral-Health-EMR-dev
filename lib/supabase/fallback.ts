const missingEnvMessage = "Supabase environment variables are not configured"

class MissingSupabaseEnvError extends Error {
  constructor() {
    super(missingEnvMessage)
    this.name = "MissingSupabaseEnvError"
  }
}

const missingSupabaseEnvError = new MissingSupabaseEnvError()

let hasLoggedWarning = false

function warnMissingSupabaseEnv(context?: string) {
  if (hasLoggedWarning) {
    return
  }

  const details = context ? ` (${context})` : ""
  console.warn(`${missingEnvMessage}${details}`)
  hasLoggedWarning = true
}

const chainableMethods = [
  "select",
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "order",
  "limit",
  "range",
  "in",
  "contains",
  "is",
  "not",
  "like",
  "ilike",
  "textSearch",
  "or",
  "filter",
  "match",
  "insert",
  "update",
  "delete",
  "upsert",
  "returns",
  "abortSignal",
]

function createQueryBuilder() {
  const builder: any = {}

  for (const method of chainableMethods) {
    builder[method] = () => builder
  }

  builder.single = async () => ({ data: null, error: missingSupabaseEnvError })
  builder.maybeSingle = async () => ({ data: null, error: missingSupabaseEnvError })
  builder.throwOnError = () => builder
  builder.then = (onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) =>
    Promise.resolve({ data: [], error: missingSupabaseEnvError }).then(onFulfilled, onRejected)

  return builder
}

function createFallbackChannel() {
  const channel: any = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: () => undefined,
  }

  return channel
}

export function createFallbackClient(context?: string) {
  warnMissingSupabaseEnv(context)

  const client: any = {
    from: () => createQueryBuilder(),
    rpc: async () => ({ data: null, error: missingSupabaseEnvError }),
    channel: () => createFallbackChannel(),
    removeChannel: () => undefined,
    removeAllChannels: () => undefined,
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: missingSupabaseEnvError }),
        download: async () => ({ data: null, error: missingSupabaseEnvError }),
        remove: async () => ({ data: null, error: missingSupabaseEnvError }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: missingSupabaseEnvError }),
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: missingSupabaseEnvError }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: missingSupabaseEnvError }),
      signUp: async () => ({ data: { user: null, session: null }, error: missingSupabaseEnvError }),
      signOut: async () => ({ error: missingSupabaseEnvError }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
        error: missingSupabaseEnvError,
      }),
    },
  }

  return client
}

export { missingSupabaseEnvError }
