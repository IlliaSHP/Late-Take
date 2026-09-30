// Dev-only request/response logging.
// When the app runs in Expo Go on Android, React Native DevTools can't inspect network
// traffic ("multiple React Native hosts" limitation). On macOS this is usually solved with
// the iOS Simulator, which isn't available on Windows, so without a development build
// there is no built-in Network tab.
// Reactotron shows a request only after a response arrives, so requests that never reach
// the server are invisible there. These logs show every outgoing request and its result.
// __DEV__ is a React Native global: declared here because this package has no RN types,
// and checked with typeof so the helper doesn't crash outside React Native.
declare const __DEV__: boolean | undefined

const devLog = (...args: unknown[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.log(...args)
}

let getToken: () => Promise<string | null> = async () => null
let onRefresh: (() => Promise<boolean>) | null = null
let onUnauthorized: (() => void) | null = null
let baseUrl = ''

export const configureApi = (options: {
  baseUrl: string
  getToken: () => Promise<string | null>
  onRefresh?: () => Promise<boolean>
  onUnauthorized?: () => void
}) => {
  baseUrl = options.baseUrl
  getToken = options.getToken
  onRefresh = options.onRefresh ?? null
  onUnauthorized = options.onUnauthorized ?? null
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[]
  ) {
    super(messages[0])
  }
}

let refreshPromise: Promise<boolean> | null = null

// We use fetch instead of Axios because fetch is supported across all platforms without compatibility issues.

const request = async (fullUrl: string, init?: RequestInit) => {
  const token = await getToken()

  devLog('→ HTTP', init?.method ?? 'GET', fullUrl, init?.body)

  return fetch(fullUrl, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
}

export const http = async <T>(url: string, init?: RequestInit): Promise<T> => {
  if (!baseUrl) throw new Error('API is not configured. Please call configureApi()')
  const fullUrl = `${baseUrl}${url}`

  let response = await request(fullUrl, init)

  if (response.status === 401 && onRefresh && !url.includes('/auth')) {
    if (!refreshPromise) {
      refreshPromise = onRefresh().finally(() => {
        refreshPromise = null
      })
    }
    
    const isRefreshed = await refreshPromise

    if (isRefreshed) {
      response = await request(fullUrl, init)
    } else {
      onUnauthorized?.()
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    devLog('← HTTP', response.status, fullUrl, body)
    const raw = body?.message ?? response.statusText
    throw new ApiError(response.status, Array.isArray(raw) ? raw : [raw])
  }

  const data = response.status === 204 ? undefined : await response.json()

  devLog('← HTTP', response.status, fullUrl, data)
  return { data, status: response.status, headers: response.headers } as T
}

// RequestInit
// whole second argument — init:
//
// http('/products', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     title: 'Phone',
//   }),
// });
//
// RequestInit is the standard set of options for configuring fetch.

// // Equivalent full version
// export class ApiError extends Error {
//   status: number
//   messages: string[]

//   constructor(
//     status: number,
//     messages: string[]
//   ) {
//     super(messages[0])

//     this.status = status
//     this.messages = messages
//   }
// }

//
// const body = await response.json().catch(() => null)
//
// alternative
// let body = null
// try {
//   body = await response.json()
// } catch {
//   body = null
// }
