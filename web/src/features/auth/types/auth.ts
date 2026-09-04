export type LoginField = 'email' | 'password'

export type LoginErrors = Partial<Record<LoginField, string>>
