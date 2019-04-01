import { FileEvent, FileUploadControl } from './../helpers/control.class';
import { ElementRef, OnDestroy, Renderer2, ChangeDetectorRef, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IsNullOrEmpty } from './../helpers/helpers.class';



export abstract class FileUploadAbstract implements OnInit, OnDestroy {

    public control: FileUploadControl = null;

    public abstract input: ElementRef<HTMLInputElement>;

    public abstract label: ElementRef<HTMLLabelElement>;

    protected readonly hooks: Array<Function> = [];

    protected readonly subscriptions: Array<Subscription> = [];

    protected onChange: (v: Array<File>) => void = () => {};

    constructor(
        protected readonly hostElementRef: ElementRef,
        protected readonly renderer: Renderer2,
        protected readonly cdr: ChangeDetectorRef) {
        }

    public ngOnInit() {
        if (IsNullOrEmpty(this.control)) {
            this.control = new FileUploadControl();
        }

        this.setEvents();
        this.checkAndMarkAsDisabled();
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

    /**
     * ControlValueAccessor implementation
     */
    private connectToForm(): void {
        this.subscriptions.push(
            this.control.valueChanges.subscribe((v) => this.onChange(v))
        );
    }
}
