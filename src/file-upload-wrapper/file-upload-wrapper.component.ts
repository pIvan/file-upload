import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common'
import { FileUploadComponent, FileUploadControl } from '@iplab/ngx-file-upload';
import { BehaviorSubject, Subscription } from 'rxjs';


@Component({
    selector: 'file-upload-wrapper-component',
    templateUrl: './file-upload-wrapper.component.html',
    styleUrls: ['./file-upload-wrapper.component.scss'],
    imports: [
        FileUploadComponent,
        AsyncPipe
    ]
})
export class FileUploadWrapperComponent implements OnInit, OnDestroy {

    public readonly uploadedFile: BehaviorSubject<string|ArrayBuffer> = new BehaviorSubject(null);

    private subscription: Subscription;

    @Input()
    public control: FileUploadControl;

    public ngOnInit(): void {
        if (this.control) {
            this.subscription = this.control.valueChanges.subscribe((values: Array<File>) => this.getImage(values[0]));
        }
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private getImage(file: File): void {
        if (FileReader && file) {
            const fr = new FileReader();
            fr.onload = (e) => this.uploadedFile.next(e.target.result);
            fr.readAsDataURL(file);
        } else {
            this.uploadedFile.next(null);
        }
    }

}
