import { Directive, Input, SimpleChanges, Optional, Host, Self, OnChanges, AfterViewInit } from '@angular/core';
import { FileUploadComponent } from '../components/file-upload.component';



@Directive({
    selector: 'file-upload[accept]'
})
export class FilesAcceptDirective implements AfterViewInit, OnChanges {

    @Input()
    public accept: string;

    constructor(@Optional() @Host() @Self() private readonly fileUpload: FileUploadComponent) {
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
