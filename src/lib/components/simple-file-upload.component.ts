import {
    Component,
    Input,
    OnInit,
    ElementRef,
    Renderer2,
    OnDestroy,
    HostBinding,
    TemplateRef,
    ViewChild,
    ChangeDetectionStrategy,
    ContentChild,
    forwardRef,
    ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FileUploadControl, FileEvent } from './../helpers/control.class';
import { IsNullOrEmpty } from './../helpers/helpers.class';
import { FileUploadService } from './../services/file-upload.service';
import { TOUCHED } from './file-upload.component';

@Component({
    selector: `file-upload[simple]`,
    templateUrl: `./simple-file-upload.component.html`,
    styleUrls: [`./simple-file-upload.component.scss`],
    providers: [
        FileUploadService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SimpleFileUploadComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleFileUploadComponent implements OnInit, OnDestroy, ControlValueAccessor {

    @Input()
    public control: FileUploadControl = null;

    @ContentChild('button')
    public buttonRef: TemplateRef<any> = null;

    @ContentChild('placeholder')
    public placeholderRef: TemplateRef<any> = null;

    @ViewChild('inputRef')
    public input: ElementRef<HTMLInputElement>;

    @ViewChild('labelRef')
    public label: ElementRef<HTMLLabelElement>;

    private subscriptions: Array<Subscription> = [];

    constructor(
        public fileUploadService: FileUploadService,
        private hostElementRef: ElementRef,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef
    ) {}

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
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions.length = 0;
    }

    @HostBinding('class.has-files')
    public get hasFiles(): boolean {
        return this.control.isListVisible && this.control.size > 0;
    }

    @HostBinding('class.ng-invalid')
    public get isInvalid(): boolean {
        return !this.control.disabled && this.control.invalid;
    }

    private setEvents(): void {
        this.subscriptions.push(
            this.control.statusChanges.subscribe((status) => this.checkAndMarkAsDisabled())
        );

        this.subscriptions.push(
            this.control.eventsChanges.subscribe((event: FileEvent) => this.triggerEvent(event))
        );
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

    public onInputChange(event: Event): void {
        const input = (event.target) as HTMLInputElement;

        if (!this.control.disabled) {
            this.control.setValue(Array.from(input.files));
        }
        this.clearInputEl();
        this.onTouch();
    }

    private clearInputEl(): void {
        this.input.nativeElement.value = null;
    }

    /**
     * ControlValueAccessor implementation
     */
    private connectToForm(): void {
        this.subscriptions.push(
            this.control.valueChanges.subscribe((v) => this.onChange(v))
        );
    }

     /**
      * model -> view changes
      */
    public writeValue(files: any): void {
        if (files != null) {
            this.control.setValue(files);
        }
    }

    private onChange: (v: Array<File>) => void = () => {};

    /**
     * register function which will be called on UI change
     * to update view -> model
     */
    public registerOnChange(fn: (v: Array<File>) => void): void {
        this.onChange = fn;
    }

    private onTouch: () => void = () => {
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED);
    };

    public registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.control.disable(isDisabled);
    }

    private triggerEvent(event: FileEvent): void {
        if (typeof this.label.nativeElement[event] === 'function') {
            this.label.nativeElement[event]();
        }
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            this.control.click();
        }
    }
}
