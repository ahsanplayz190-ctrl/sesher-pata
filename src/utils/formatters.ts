export function toBengaliNumber(num: number | string): string {
  const englishToBengaliMap: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
    '.': '.',
  };

  return String(num).replace(/[0-9]/g, (digit) => englishToBengaliMap[digit] || digit);
}

export function formatPrice(price: number): string {
  return `৳${toBengaliNumber(price)}`;
}
