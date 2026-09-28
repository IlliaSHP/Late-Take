import { z } from 'zod'
import type { RegisterDto } from '@app/api'

export const authSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
}) satisfies z.ZodType<RegisterDto>

export type TAuthForm = z.infer<typeof authSchema>