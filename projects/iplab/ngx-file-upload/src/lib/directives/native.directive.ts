import { Directive, Optional, Host, Self, InputSignalWithTransform, input, booleanAttribute, effect } from '@angular/core';
import { FileUploadComponent } from '../components/multiple-file-upload/file-upload.component';
import { SimpleFileUploadComponent } from '../components/simple-file-upload/simple-file-upload.component';



@Directive({
    selector: 'file-upload[native]',
    host: { '[attr.native]': 'native ? native : null' },
    standalone: true
})
export class FilesNativeDirective {

    public native: InputSignalWithTransform<boolean, boolean | string | null> = input<boolean, boolean | string | null>(true, { transform: booleanAttribute });

    private readonly fileUpload: FileUploadComponent | SimpleFileUploadComponent = null;

    constructor(
        @Optional() @Host() @Self() fileUpload: FileUploadComponent,
        @Optional() @Host() @Self() simpleFileUpload: SimpleFileUploadComponent) {
        this.fileUpload = fileUpload || simpleFileUpload;
        effect(() => {
            this.enableNative(this.native());
        })
    }

    private enableNative(isNative: boolean): void {
        const control = this.fileUpload?.control();
        if (control) {
            control.native(isNative);
        }
    }
}
