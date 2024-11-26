import {
    Component,
    TemplateRef,
    ChangeDetectionStrategy,
    forwardRef,
    Signal,
    contentChild,
    InputSignalWithTransform,
    booleanAttribute,
    input
} from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { FileUploadService } from './../../services/file-upload.service';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, NgTemplateOutlet]
})
export class SimpleFileUploadComponent extends FileUploadAbstract implements ControlValueAccessor {

    public buttonRef: Signal<TemplateRef<any>> = contentChild('button', { read: TemplateRef });

    public placeholderRef: Signal<TemplateRef<any>> = contentChild('placeholder', { read: TemplateRef });

    constructor(public fileUploadService: FileUploadService) {
        super();
    }

    public onInputChange(event: Event): void {
        const input = (event.target) as HTMLInputElement;
        const control = this.control();

        if (!control.disabled && input.files.length > 0) {
            control.setValue(Array.from(input.files));
            this.clearInputEl();
        }

        this.onTouch();
    }

     /**
      * model -> view changes
      */
    public writeValue(files: any): void {
        if (files != null) {
            const control = this.control();
            control.setValue(files, { emitEvent: false });
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

    public registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        const control = this.control();
        control.disable(isDisabled);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            const control = this.control();
            control.click();
        }
    }
}
