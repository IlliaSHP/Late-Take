export function getPageInputRange(index: number, width: number) {
  'worklet'
  return [(index - 1) * width, index * width, (index + 1) * width]
}