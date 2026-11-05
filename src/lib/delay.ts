// Mock services wait a little before answering, like a real network call would.
export function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
