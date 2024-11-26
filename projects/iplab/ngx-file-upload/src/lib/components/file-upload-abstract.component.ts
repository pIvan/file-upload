import { FileEvent, FileUploadControl } from './../helpers/control.class';
import {
    ElementRef,
    OnDestroy,
    Renderer2,
    ChangeDetectorRef,
    OnInit,
    Directive,
    inject,
    input,
    InputSignal,
    Signal,
    viewChild,
    InputSignalWithTransform,
    booleanAttribute
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { IsNullOrEmpty } from './../helpers/helpers.class';

export const HAS_FILES_CLASS_NAME = 'has-files';
export const IS_INVALID_CLASS_NAME = 'ng-invalid';
export const DRAGOVER_CLASS_NAME = 'dragover';
export const TOUCHED_CLASS_NAME = 'ng-touched';

@Directive()
export abstract class FileUploadAbstract implements OnInit, OnDestroy {

    public control: InputSignal<FileUploadControl> = input<FileUploadControl>(new FileUploadControl());

    public input: Signal<ElementRef<HTMLInputElement>> = viewChild.required('inputRef', { read: ElementRef<HTMLInputElement> });

    public label: Signal<ElementRef<HTMLLabelElement>> = viewChild.required('labelRef', { read: ElementRef<HTMLLabelElement> });

    protected isMultiple: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(null, { transform: booleanAttribute, alias: 'multiple' });

    protected readonly hooks: Array<Function> = [];

    protected readonly subscriptions: Array<Subscription> = [];

    protected readonly hostElementRef: ElementRef = inject(ElementRef);

    protected readonly renderer: Renderer2 = inject(Renderer2);

    protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    protected onChange: (v: Array<File>) => void = () => { };

    protected onTouch: () => void = () => {
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED_CLASS_NAME);
    };

    constructor() {
        /**
         * TODO -> on input(control) change
         * unsubscribe from all events and register new one,
         * and run ngOnInit again
         */
    }

    public ngOnInit(): void {
        this.registerEvents();
        this.checkAndMarkAsDisabled();
        this.checkAndSetMultiple();
        this.connectToForm();
    }

    public ngOnDestroy(): void {
        this.cdr.detach();
        this.hooks.forEach((hook) => hook());
        this.hooks.length = 0;
        this.unregisterEvents();
    }

    /**
     * register function which will be called on UI change
     * to update view -> model
     */
    public registerOnChange(fn: (v: Array<File>) => void): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    protected unregisterEvents(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions.length = 0;
    }

    protected registerEvents(): void {
        const control = this.getControlInstance();
        this.subscriptions.push(
            control.statusChanges.subscribe((status) => this.checkAndMarkAsDisabled())
        );

        this.subscriptions.push(
            control.eventsChanges.subscribe((event: FileEvent) => this.triggerEvent(event))
        );

        this.subscriptions.push(
            control.acceptChanges.subscribe((accept: string) => this.updateAcceptAttr(accept))
        );

        this.subscriptions.push(
            control.multipleChanges.subscribe((isMultiple: boolean) => this.toggleMultiple(isMultiple))
        );

        this.subscriptions.push(
            merge(
                control.listVisibilityChanges,
                control.valueChanges
            )
                .subscribe(() => this.checkAndSetFilesClass())
        );

        this.subscriptions.push(
            merge(
                control.statusChanges,
                control.valueChanges
            )
                .subscribe(() => this.checkAndSetInvalidClass())
        );
    }

    protected clearInputEl(): void {
        this.input().nativeElement.value = null;
    }

    /**
     * used to update model once state is changed through @Input
     * or in case of simple-file-upload to override user value
     */
    protected checkAndSetMultiple(): void {
        const control = this.getControlInstance();
        const isMultiple = this.isMultiple();

        if (!control || isMultiple == null) {
            return;
        }

        if (isMultiple !== control.isMultiple) {
            control.multiple(isMultiple);
        }
    }

    protected getControlInstance(): FileUploadControl {
        return this.control();
    }

    private hasFiles(): boolean {
        const control = this.getControlInstance();
        return control.isListVisible && control.size > 0;
    }

    private isInvalid(): boolean {
        const control = this.getControlInstance();
        return !control.disabled && control.invalid;
    }

    private checkAndSetFilesClass(): void {
        if (this.hasFiles() && this.hostElementRef) {
            this.renderer.addClass(this.hostElementRef.nativeElement, HAS_FILES_CLASS_NAME);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, HAS_FILES_CLASS_NAME);
        }
    }

    private checkAndSetInvalidClass(): void {
        if (this.isInvalid() && this.hostElementRef) {
            this.renderer.addClass(this.hostElementRef.nativeElement, IS_INVALID_CLASS_NAME);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, IS_INVALID_CLASS_NAME);
        }
    }

    private triggerEvent(event: FileEvent): void {
        if (typeof this.label().nativeElement[event] === 'function') {
            this.label().nativeElement[event]();
        }
    }

    private updateAcceptAttr(accept: string): void {
        if (!IsNullOrEmpty(accept)) {
            this.renderer.setAttribute(this.input().nativeElement, 'accept', accept);
        } else {
            this.renderer.removeAttribute(this.input().nativeElement, 'accept');
        }
    }

    private checkAndMarkAsDisabled(): void {
        const control = this.getControlInstance();
        if (control?.disabled) {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'disabled');
            this.renderer.setProperty(this.input().nativeElement, 'disabled', true);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'disabled');
            this.renderer.setProperty(this.input().nativeElement, 'disabled', false);
        }
    }

    private toggleMultiple(isMultiple: boolean): void {
        if (isMultiple) {
            this.renderer.setAttribute(this.input().nativeElement, 'multiple', '');
        } else {
            this.renderer.removeAttribute(this.input().nativeElement, 'multiple');
        }
    }

    /**
     * ControlValueAccessor implementation
     */
    private connectToForm(): void {
        const control = this.getControlInstance();
        this.subscriptions.push(
            control.valueChanges.subscribe((v) => this.onChange(v))
        );
    }
}
