import { Directive, Input, SimpleChanges, Optional, Host, Self, OnChanges, AfterViewInit, input, InputSignalWithTransform, booleanAttribute, effect } from '@angular/core';
import { FileUploadComponent } from '../components/multiple-file-upload/file-upload.component';
import { SimpleFileUploadComponent } from '../components/simple-file-upload/simple-file-upload.component';


export function booleanTransform(value: unknown): boolean {
    if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        return JSON.parse(value.toLowerCase());
    } else if (typeof value === 'boolean') {
        return value;
    } else {
        throw Error(`Provided value in directive [discard]="${value}" is not boolean.`);
    }
}


@Directive({
    selector: 'file-upload[discard]',
    host: { '[attr.discard]': 'discard ? discard : null' },
    standalone: true
})
export class FilesDiscardDirective {

    public discard: InputSignalWithTransform<boolean, boolean | string | null> = input<boolean, boolean | string | null>(true, { transform: booleanAttribute });

    private readonly fileUpload: FileUploadComponent | SimpleFileUploadComponent = null;

    constructor(
        @Optional() @Host() @Self() fileUpload: FileUploadComponent,
        @Optional() @Host() @Self() simpleFileUpload: SimpleFileUploadComponent) {
        this.fileUpload = fileUpload || simpleFileUpload;
        effect(() => {
            this.setAccept(this.discard());
        });
    }

    private setAccept(discard: boolean): void {
        const control = this.fileUpload?.control();
        if (control) {
            control.discardInvalid(discard);
        }
    }
}
