import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ValidatorFn, ValidationErrors } from './validators.class';
import { IsNullOrEmpty } from './helpers.class';

export enum STATUS {
    INVALID,
    VALID,
    DISABLED
}

export enum FileEvent {
    click = 'click',
    focus = 'focus',
    blur = 'blur'
}

export class FileUploadControl {

    private readonly files: Set<File> = new Set();

    private listVisible = true;

    private status: STATUS = STATUS.VALID;

    private errors: Array<{[key: string]: any}> = [];

    private validators: Array<ValidatorFn> = [];

    private multipleEnabled: boolean = true;

    private readonly multipleChanged: BehaviorSubject<boolean> = new BehaviorSubject(this.multipleEnabled);

    private readonly statusChanged: Subject<STATUS> = new Subject();

    private readonly eventsChanged: Subject<FileEvent> = new Subject();

    private accept: string = null;

    private readonly acceptChanged: BehaviorSubject<string> = new BehaviorSubject(this.accept);

    /**
     * track status `VALID`, `INVALID` or `DISABLED`
     */
    public statusChanges: Observable<STATUS> = this.statusChanged.asObservable();

    /**
     * emit an event every time the value of the control
     * changes.
     * Initially returns last value
     */
    public readonly valueChanges: BehaviorSubject<Array<File>> = new BehaviorSubject([]);

    /**
     * @internal
     * used to trigger layout change for list visibility
     */
    public readonly listVisibilityChanges: BehaviorSubject<boolean> = new BehaviorSubject(this.listVisible);

    /**
     * track changed on accept attribute
     */
    public readonly acceptChanges: Observable<string> = this.acceptChanged.asObservable();

    /**
     * emit an event every time user programmatically ask for certain event
     */
    public readonly eventsChanges: Observable<FileEvent> = this.eventsChanged.asObservable();

    /**
     * track changed on multiple attribute
     */
    public readonly multipleChanges: Observable<boolean> = this.multipleChanged.asObservable();

    constructor(validators?: ValidatorFn|Array<ValidatorFn>) {
        this.defineValidators(validators);
    }

    /**
     * set functions that determines the synchronous validity of this control.
     */
    public setValidators(newValidators: ValidatorFn|Array<ValidatorFn>): this {
        this.defineValidators(newValidators);
        this.validate();
        return this;
    }

    private defineValidators(validators: ValidatorFn|Array<ValidatorFn>): void {
        if (!IsNullOrEmpty(validators)) {
            this.validators = Array.isArray(validators) ? [...validators] : [validators];
        }
    }

    public addFile(file: File): this {
        /**
         * if multiple is disabled and one file exists
         * clear it and reupload a new one
         */
        if (!this.multipleEnabled && this.files.size === 1) {
            this.files.clear();
        }
        this.files.add(file);
        this.validate();
        this.valueChanges.next(Array.from(this.files.values()));
        return this;
    }

    public removeFile(file: File): this {
        this.files.delete(file);
        this.validate();
        this.valueChanges.next(Array.from(this.files.values()));
        return this;
    }

    public addFiles(files: FileList): this {
        this.addMultipleFiles(Array.from(files));
        return this;
    }

    /**
     * @internal
     * used to prevent valueChanges emit more times
     * when multiple files are uploaded
     */
    private addMultipleFiles(files: Array<File>): void {
        if (!this.multipleEnabled && !IsNullOrEmpty(files)) {
            // add only one file
            this.addFile(files[0]);
            return;
        }
        files.forEach(file => this.files.add(file));
        this.validate();
        this.valueChanges.next(Array.from(this.files.values()));
    }

    public get valid(): boolean {
        return this.errors.length === 0 && this.status !== STATUS.DISABLED;
    }

    public get invalid(): boolean {
        return this.errors.length > 0;
    }

    public getError(): Array<ValidationErrors> {
        return this.errors;
    }

    /**
     * number of uploaded files
     */
    public get size(): number {
        return this.files.size;
    }

    /**
     * return list of Files
     */
    public get value(): Array<File> {
        return Array.from(this.files.values());
    }

    public setValue(files: Array<File>): this {
        this.files.clear();

        if (files instanceof Array) {
            this.addMultipleFiles(files);
        } else {
            throw Error(`FormControl.setValue was provided with wrong argument type, ${files} was provided instead Array<File>`);
        }

        return this;
    }

    /**
     * reset the control
     */
    public clear(): this {
        this.files.clear();
        this.validate();
        this.valueChanges.next(Array.from(this.files.values()));
        return this;
    }

    public get isListVisible(): boolean {
        return this.listVisible;
    }

    public setListVisibility(isVisible: boolean = true): this {
        this.listVisible = isVisible;
        this.listVisibilityChanges.next(this.listVisible);
        return this;
    }

    public get disabled() {
        return this.status === STATUS.DISABLED;
    }

    public enable(isEnabled: boolean = true): this {
        this.status = isEnabled ? STATUS.VALID : STATUS.DISABLED;
        this.validate();
        this.statusChanged.next(this.status);
        return this;
    }

    public disable(isDisabled: boolean = true): this {
        this.status = isDisabled ? STATUS.DISABLED : STATUS.VALID;
        this.validate();
        this.statusChanged.next(this.status);
        return this;
    }

    public click(): this {
        this.eventsChanged.next(FileEvent.click);
        return this;
    }

    public focus(): this {
        this.eventsChanged.next(FileEvent.focus);
        return this;
    }

    public blur(): this {
        this.eventsChanged.next(FileEvent.blur);
        return this;
    }

    /**
     * specifies the types of files that the server accepts
     *
     * ### Example
     *
     * ```
     * acceptFiles("file_extension|audio/*|video/*|image/*|media_type")
     * ```
     *
     * To specify more than one value, separate the values with a comma (e.g. acceptFiles("audio/*,video/*,image/*").
     *
     */
    public acceptFiles(accept: string): this {
        this.accept = accept;
        this.acceptChanged.next(this.accept);
        return this;
    }

    public acceptAll(): this {
        this.accept = null;
        this.acceptChanged.next(this.accept);
        return this;
    }

    public get isMultiple(): boolean {
        return this.multipleEnabled;
    }

    public multiple(isEnabled: boolean = true): this {
        this.multipleEnabled = isEnabled;
        this.multipleChanged.next(this.multipleEnabled);
        return this;
    }

    private validate(): void {
        if (this.status !== STATUS.DISABLED) {
            const currentState = this.valid;
            this.errors = this.validators.map((validator) => validator(this)).filter((isInvalid) => isInvalid);

            if (currentState !== this.valid) {
                this.statusChanged.next(this.valid ? STATUS.VALID : STATUS.INVALID);
            }
        } else {
            this.errors.length = 0;
        }
    }
}
