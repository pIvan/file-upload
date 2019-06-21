import { Directive, Input, SimpleChanges, Optional, Host, Self, OnChanges, AfterViewInit } from '@angular/core';
import { FileUploadComponent } from '../components/file-upload.component';
import { SimpleFileUploadComponent } from '../components/simple-file-upload.component';



@Directive({
    selector: 'file-upload[accept]',
    host: {'[attr.accept]': 'accept ? accept : null'}
})
export class FilesAcceptDirective implements AfterViewInit, OnChanges {

    @Input()
    public accept: string;

    private readonly fileUpload: FileUploadComponent | SimpleFileUploadComponent = null;

    constructor(
        @Optional() @Host() @Self() fileUpload: FileUploadComponent,
        @Optional() @Host() @Self() simpleFileUpload: SimpleFileUploadComponent) {
        this.fileUpload = fileUpload || simpleFileUpload;
    }

    public ngAfterViewInit(): void {
        this.setAccept(this.accept);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ('accept' in changes && changes['accept'].currentValue !== changes['accept'].previousValue) {
            this.setAccept(this.accept);
        }
    }

    private setAccept(accept: string): void {
        if (this.fileUpload && this.fileUpload.control) {
            this.fileUpload.control.acceptFiles(accept);
        }
    }
}
