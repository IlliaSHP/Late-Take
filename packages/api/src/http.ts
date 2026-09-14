let getToken: () => Promise<string | null> = async () => null
let baseUrl = ''

export const configureApi = (options: {
  baseUrl: string
  getToken: () => Promise<string | null>
}) => {
  baseUrl = options.baseUrl
  getToken = options.getToken
}

// Shorthand using TypeScript parameter properties
export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[]
  ) {
    super(messages[0])
  }
}

// We use fetch instead of Axios because fetch is supported across all platforms without compatibility issues.

export const http = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const token = await getToken()

  const response = await fetch(`${baseUrl}/${url}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const raw = body?.message ?? response.statusText
    throw new ApiError(response.status, Array.isArray(raw) ? raw : [raw])
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
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
