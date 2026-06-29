export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class InvalidActivationKeyError extends DomainError {}
export class DuplicateCompanyError extends DomainError {}