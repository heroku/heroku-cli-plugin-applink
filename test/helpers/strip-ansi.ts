import ansis from 'ansis';

export default function (text: string): string {
  return ansis.strip(text).replace(/[»›▸⬢]\s*/gm, '');
}
