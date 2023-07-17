type EventType =
  | 'AccountBorrowed'
  | 'AccountReturned'
  | 'AccountRegistered'
  | 'AccountOpened'
  | 'AccountSuspened'
  | 'AccountClosed'

export function getEventTopic(event: EventType): string {
  switch (event) {
    case 'AccountBorrowed':
      return '0x25e16b23f4151af78a7aa799ac8ab9be8de857409238a98d68cf98a4f19e020d'
    default:
      throw new Error(`Unknown event type: ${event}`)
  }
}
