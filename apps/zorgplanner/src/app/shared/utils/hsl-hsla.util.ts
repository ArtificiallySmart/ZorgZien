export function hslToHsla(hsl: string, alpha: number) {
  if (hsl.startsWith('hsla')) {
    return hsl;
  }
  const hsla = hsl.replace(')', `, ${alpha})`).replace('hsl(', 'hsla(');
  return hsla;
}

export function hslaToHsl(hsla: string) {
  if (hsla.startsWith('hsl(')) {
    return hsla;
  }
  const hsl = hsla.replace(/, [0-9.]+\)/, ')').replace('hsla(', 'hsl(');
  return hsl;
}
