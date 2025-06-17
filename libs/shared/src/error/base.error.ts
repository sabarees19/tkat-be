export class BaseError<T extends string> extends Error {
  override name: string;
  override message: string;
  override cause: unknown;

  constructor({ name, message, cause }: { name: T; message: string; cause?: unknown; }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
