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
    case 'AccountRegistered':
      return '0x5f0651ae754e97c1f9b53e213b4ac64372e4f4441d6e6851b17bd129b4426076'
    default:
      throw new Error(`Unknown event type: ${event}`)
  }
}
