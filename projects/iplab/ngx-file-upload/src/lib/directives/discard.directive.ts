import { Directive, Input, SimpleChanges, Optional, Host, Self, OnChanges, AfterViewInit } from '@angular/core';
import { FileUploadComponent } from '../components/multiple-file-upload/file-upload.component';
import { SimpleFileUploadComponent } from '../components/simple-file-upload/simple-file-upload.component';



@Directive({
    selector: 'file-upload[discard]',
    host: {'[attr.discard]': 'discard ? discard : null'},
    standalone: true
})
export class FilesDiscardDirective implements AfterViewInit, OnChanges {

    private discardValue: boolean | null = null;

    @Input()
    public set discard(discard: boolean | string) {
        if (typeof discard === 'string' && (discard === 'true' || discard === 'false')) {
            this.discardValue = JSON.parse(discard.toLowerCase());
        } else if (typeof discard === 'boolean') {
            this.discardValue = discard;
        } else {
            throw Error(`Provided value in directive [discard]="${discard}" is not boolean.`);
        }
    }

    private readonly fileUpload: FileUploadComponent | SimpleFileUploadComponent = null;

    constructor(
        @Optional() @Host() @Self() fileUpload: FileUploadComponent,
        @Optional() @Host() @Self() simpleFileUpload: SimpleFileUploadComponent) {
        this.fileUpload = fileUpload || simpleFileUpload;
    }

    public ngAfterViewInit(): void {
        this.setAccept(this.discardValue);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('discard' in changes && changes['discard'].currentValue !== changes['discard'].previousValue) {
            this.setAccept(this.discardValue);
        }
    }

    private setAccept(discard: boolean): void {
        if (this.fileUpload && this.fileUpload.control) {
            this.fileUpload.control.discardInvalid(discard);
        }
    }
}
