/** Join class names, skipping falsy values. Variant maps stay static strings. */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
