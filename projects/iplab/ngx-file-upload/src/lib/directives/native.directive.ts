import { Directive, Input, SimpleChanges, Optional, Host, Self, OnChanges, AfterViewInit } from '@angular/core';
import { FileUploadComponent } from '../components/multiple-file-upload/file-upload.component';
import { SimpleFileUploadComponent } from '../components/simple-file-upload/simple-file-upload.component';



@Directive({
    selector: 'file-upload[native]',
    host: {'[attr.native]': 'native ? native : null'}
})
export class FilesNativeDirective implements AfterViewInit, OnChanges {

    private nativeValue: boolean | null = null;

    @Input()
    public set native(isNative: boolean | string) {
        if (typeof isNative === 'string' && (isNative === 'true' || isNative === 'false')) {
            this.nativeValue = JSON.parse(isNative.toLowerCase());
        } else if (typeof isNative === 'boolean') {
            this.nativeValue = isNative;
        } else {
            throw Error(`Provided value in directive [native]="${isNative}" is not boolean.`);
        }
    }

    private readonly fileUpload: FileUploadComponent | SimpleFileUploadComponent = null;

    constructor(
        @Optional() @Host() @Self() fileUpload: FileUploadComponent,
        @Optional() @Host() @Self() simpleFileUpload: SimpleFileUploadComponent) {
        this.fileUpload = fileUpload || simpleFileUpload;
    }

    public ngAfterViewInit(): void {
        this.enableNative(this.nativeValue);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('native' in changes && changes['native'].currentValue !== changes['native'].previousValue) {
            this.enableNative(this.nativeValue);
        }
    }

    private enableNative(isNative: boolean): void {
        if (this.fileUpload && this.fileUpload.control) {
            this.fileUpload.control.native(isNative);
        }
    }
}
