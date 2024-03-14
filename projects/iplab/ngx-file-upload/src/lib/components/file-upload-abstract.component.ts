import { FileEvent, FileUploadControl } from './../helpers/control.class';
import { ElementRef, OnDestroy, Renderer2, ChangeDetectorRef, OnInit, Directive, AfterContentInit, inject } from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { IsNullOrEmpty } from './../helpers/helpers.class';

export const HAS_FILES_CLASS_NAME = 'has-files';
export const IS_INVALID_CLASS_NAME = 'ng-invalid';

@Directive()
export abstract class FileUploadAbstract implements OnInit, OnDestroy {

    public control: FileUploadControl = null;

    public abstract input: ElementRef<HTMLInputElement>;

    public abstract label: ElementRef<HTMLLabelElement>;

    protected isMultiple: boolean | string = null;

    protected readonly hooks: Array<Function> = [];

    protected readonly subscriptions: Array<Subscription> = [];

    protected readonly hostElementRef: ElementRef = inject(ElementRef);

    protected readonly renderer: Renderer2 = inject(Renderer2);

    protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    protected onChange: (v: Array<File>) => void = () => {};

    public ngOnInit(): void {
        if (IsNullOrEmpty(this.control)) {
            this.control = new FileUploadControl();
        }

        this.setEvents();
        this.checkAndMarkAsDisabled();
        this.checkAndSetMultiple();
        this.connectToForm();
    }

    public ngOnDestroy(): void {
        this.cdr.detach();
        this.hooks.forEach((hook) => hook());
        this.hooks.length = 0;
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions.length = 0;
    }

    protected setEvents(): void {
        this.subscriptions.push(
            this.control.statusChanges.subscribe((status) => this.checkAndMarkAsDisabled())
        );

        this.subscriptions.push(
            this.control.eventsChanges.subscribe((event: FileEvent) => this.triggerEvent(event))
        );

        this.subscriptions.push(
            this.control.acceptChanges.subscribe((accept: string) => this.updateAcceptAttr(accept))
        );

        this.subscriptions.push(
            this.control.multipleChanges.subscribe((isMultiple: boolean) => this.toggleMultiple(isMultiple))
        );

        this.subscriptions.push(
            merge(
                this.control.listVisibilityChanges,
                this.control.valueChanges
            )
            .subscribe(() => this.checkAndSetFilesClass())
        );

        this.subscriptions.push(
            merge(
                this.control.statusChanges,
                this.control.valueChanges
            )
            .subscribe(() => this.checkAndSetInvalidClass())
        );
    }

    protected clearInputEl(): void {
        this.input.nativeElement.value = null;
    }

    /**
     * used to update model once state is changed through @Input
     * or in case of simple-file-upload to override user value
     */
    protected checkAndSetMultiple(): void {
        if (!this.control || this.isMultiple == null) {
            return;
        }

        const isMultiple = this.isMultiple === true || (this.isMultiple as string) === 'true';
        if (isMultiple !== this.control.isMultiple) {
            this.control.multiple(isMultiple);
        }
    }

    private hasFiles(): boolean {
        return this.control.isListVisible && this.control.size > 0;
    }

    private isInvalid(): boolean {
        return !this.control.disabled && this.control.invalid;
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
        if (typeof this.label.nativeElement[event] === 'function') {
            this.label.nativeElement[event]();
        }
    }

    private updateAcceptAttr(accept: string): void {
        if (!IsNullOrEmpty(accept)) {
            this.renderer.setAttribute(this.input.nativeElement, 'accept', accept);
        } else {
            this.renderer.removeAttribute(this.input.nativeElement, 'accept');
        }
    }

    private checkAndMarkAsDisabled(): void {
        if (this.control.disabled) {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'disabled');
            this.renderer.setProperty(this.input.nativeElement, 'disabled', true);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'disabled');
            this.renderer.setProperty(this.input.nativeElement, 'disabled', false);
        }
    }

    private toggleMultiple(isMultiple: boolean): void {
        if (isMultiple) {
            this.renderer.setAttribute(this.input.nativeElement, 'multiple', '');
        } else {
            this.renderer.removeAttribute(this.input.nativeElement, 'multiple');
        }
    }

    /**
     * ControlValueAccessor implementation
     */
    private connectToForm(): void {
        this.subscriptions.push(
            this.control.valueChanges.subscribe((v) => this.onChange(v))
        );
    }
}
