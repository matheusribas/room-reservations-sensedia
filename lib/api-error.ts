export async function throwIfNotOk(
  response: Response,
  fallbackMessage: string
) {
  if (response.ok) return

  const result: unknown = await response.json().catch(() => null)

  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    throw new Error(result.error)
  }

  throw new Error(fallbackMessage)
}
