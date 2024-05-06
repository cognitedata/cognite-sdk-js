export class Datapoints {
  protected code: number;
  protected symbol: string;

  constructor(code: number, symbol: string) {
    this.code = code;
    this.symbol = symbol;
  }

  public getCode(): number {
    return this.code;
  }

  public getStatusCodeHexadecimal(): string {
    return this.code.toString(16);
  }

  public getSymbol(): string {
    return this.symbol;
  }
}
