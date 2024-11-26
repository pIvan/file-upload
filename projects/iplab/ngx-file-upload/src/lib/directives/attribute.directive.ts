import { Directive, Input, SimpleChanges, Optional, Host, Self, OnChanges, AfterViewInit, input, InputSignal, effect } from '@angular/core';
import { FileUploadComponent } from '../components/multiple-file-upload/file-upload.component';
import { SimpleFileUploadComponent } from '../components/simple-file-upload/simple-file-upload.component';



@Directive({
    selector: 'file-upload[accept]',
    host: { '[attr.accept]': 'accept ? accept : null' },
    standalone: true
})
export class FilesAcceptDirective {

    public accept: InputSignal<string> = input.required();

    private readonly fileUpload: FileUploadComponent | SimpleFileUploadComponent = null;

    constructor(
        @Optional() @Host() @Self() fileUpload: FileUploadComponent,
        @Optional() @Host() @Self() simpleFileUpload: SimpleFileUploadComponent) {
        this.fileUpload = fileUpload || simpleFileUpload;
        effect(() => {
            this.setAccept(this.accept());
        });
    }

    private setAccept(accept: string): void {
        const control = this.fileUpload?.control();
        if (control) {
            control.acceptFiles(accept);
        }
    }
}
