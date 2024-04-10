declare class Bowser {
    static getParser(UA: string, skipParsing?: boolean): Parser;
}

declare class Parser {
    constructor(UA: string, skipParsing?: boolean);

    parsedResult: {
        platform: {
            type: string
        }
    };

    getUA(): string;
    test(regex: string): boolean;
    parseBrowser(): void;
    getBrowser(): void;
    parse(): Parser;

}

declare module 'bowser/es5' {
    export = Bowser;
}
