console.log("STEP 3");
import { generator } from '../utils/utils';

export default class AufgabeModel {
    private _id: string;
    private _platform: string;
    private _subject: string;
    private _deadline: string;
    private _moodleId: string;

    constructor(platform: string, subject: string, deadline: string, moodleId: string, id?: string) {
        id ? this._id = id : this._id = generator();
        this._platform = platform;
        this._subject = subject;
        this._deadline = deadline;
        this._moodleId = moodleId;
    }

    public get id(): string {
        return this._id;
    }

    public get platform(): string {
        return this._platform
    }

    public get subject(): string {
        return this._subject;
    }

    public get deadline(): string {
        return this._deadline;
    }

    public get moodleId(): string {
        return this._moodleId;
    }


    public set deadline(deadline: string) {
        this._deadline = deadline;
    }


    public toString(): string {
        return `Fach:\`${this._subject}\`\nAbgabe-Platform:\`${this._platform}\n\`Deadline:\`${this._deadline}\`\nMoodle-ID: \`${this.moodleId}\``;
    }
}