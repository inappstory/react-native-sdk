function byteLength(str: string) {
    // returns the byte length of an utf8 string
    let s = str.length;
    for (let i=str.length-1; i>=0; i--) {
        const code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s+=2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--;
    }
    return s;
}
export class StoryManagerSdkConfigChecker {

    public static instance: StoryManagerSdkConfigChecker;

    constructor() {
        if (!StoryManagerSdkConfigChecker.instance) {
            StoryManagerSdkConfigChecker.instance = this;
        }
        return StoryManagerSdkConfigChecker.instance;
    }

    static getInstance(): StoryManagerSdkConfigChecker {
        if (!StoryManagerSdkConfigChecker.instance) {
            return new StoryManagerSdkConfigChecker();
        }
        return StoryManagerSdkConfigChecker.instance;
    }

    private _sdkConfigIsIncorrect = false;
    get sdkConfigIsIncorrect() {
        return this._sdkConfigIsIncorrect;
    }
    private _userIdByteLimit = 255;
    private _tagsByteLimit = 4000;


    private userMessage = "";
    private tagsMessage = "";

    get sdkConfigErrorsAsArray(): Array<string> {
        const errors: Array<string> = [];
        if (this.userMessage) {
            errors.push(this.userMessage);
        }
        if (this.tagsMessage) {
            errors.push(this.tagsMessage);
        }

        return errors;
    }

    public checkUserIdLength(userId: any) {
        this.userMessage = "";
        if (userId != null) {
            if (byteLength(String(userId)) > this._userIdByteLimit) {
                console.error(`UserId is bigger then ${this._userIdByteLimit} bytes`);
                this._sdkConfigIsIncorrect = true;
                this.userMessage = `UserId "${String(userId)}" is bigger then ${this._userIdByteLimit} bytes`;
            }
        }
    }

    public checkTagsLength(tags: any) {
        this.tagsMessage = "";
        if (tags != null && Array.isArray(tags)) {
            if (byteLength(tags.join(",")) > this._tagsByteLimit) {
                console.error(`Tags (joined by ',') is bigger then ${this._tagsByteLimit} bytes`);
                this._sdkConfigIsIncorrect = true;
                this.tagsMessage = `Tags (joined by ',') "${tags.join(",")}" is bigger then ${this._tagsByteLimit} bytes`;
            }
        }
    }

}