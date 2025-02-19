export function formatMoney(amount: number, currency: 'RUB' | 'EUR' | 'USD' | string): string {
  switch (currency) {
    case 'EUR':
      return `€${ amount }`;
    case 'USD':
      return `$${ amount }`;
    case 'RUB':
      return `${ amount } ₽`;
    default:
      return `${ amount } ${ currency }`;
  }
}
