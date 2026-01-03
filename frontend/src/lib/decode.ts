export interface JwtPayload {
  user_id: string
  email: string
  role: string
  exp?: number
  iat?: number
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decodedPayload = atob(base64)

    return JSON.parse(decodedPayload) as JwtPayload
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}
