import ansis from 'ansis';

export default function stripAnsi(text: string): string {
  return ansis.strip(text).replaceAll(/[»›▸⬢]\s*/gm, '');
}
