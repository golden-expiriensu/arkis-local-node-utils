import { Scenario } from './types'

export class Logger {
  private name: string

  constructor(scenario: Scenario) {
    this.name = scenario.owner.name
  }

  log(message?: any, ...optionalParams: any[]): void {
    console.log(`${this.name} ---> ${message}`, ...optionalParams)
  }
}