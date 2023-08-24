import {
    Component,
    Input,
    ElementRef,
    HostBinding,
    TemplateRef,
    ViewChild,
    ChangeDetectionStrategy,
    ContentChild,
    forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { FileUploadControl } from './../../helpers/control.class';
import { FileUploadService } from './../../services/file-upload.service';
import { TOUCHED } from './../multiple-file-upload/file-upload.component';
import { FileUploadAbstract } from './../file-upload-abstract.component';

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
export class SimpleFileUploadComponent extends FileUploadAbstract implements ControlValueAccessor {

    @Input()
    public control: FileUploadControl = null;

    @ContentChild('button')
    public buttonRef: TemplateRef<any> = null;

    @ContentChild('placeholder')
    public placeholderRef: TemplateRef<any> = null;

    @ViewChild('inputRef', { static: true })
    public input: ElementRef<HTMLInputElement>;

    @ViewChild('labelRef', { static: true })
    public label: ElementRef<HTMLLabelElement>;

    protected isMultiple: boolean | string = null;

    constructor(public fileUploadService: FileUploadService) {
        super();
    }

    @HostBinding('class.has-files')
    public get hasFiles(): boolean {
        return this.control.isListVisible && this.control.size > 0;
    }

    @HostBinding('class.ng-invalid')
    public get isInvalid(): boolean {
        return !this.control.disabled && this.control.invalid;
    }

    public onInputChange(event: Event): void {
        const input = (event.target) as HTMLInputElement;

        if (!this.control.disabled && input.files.length > 0) {
            this.control.setValue(Array.from(input.files));
            this.clearInputEl();
        }

        this.onTouch();
    }

     /**
      * model -> view changes
      */
    public writeValue(files: any): void {
        if (files != null) {
            this.control.setValue(files);
        }
    }

    public trackByFn(index: number, item: File): string {
        return item.name;
    }

    /**
     * register function which will be called on UI change
     * to update view -> model
     */
    public registerOnChange(fn: (v: Array<File>) => void): void {
        this.onChange = fn;
    }

    private onTouch: () => void = () => {
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED);
    }

    public registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.control.disable(isDisabled);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            this.control.click();
        }
    }
}
