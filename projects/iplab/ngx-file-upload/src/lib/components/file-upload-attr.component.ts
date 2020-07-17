import {
    Input,
    OnInit,
    ElementRef,
    HostListener,
    Renderer2,
    OnDestroy,
    HostBinding,
    Inject,
    ViewChild,
    ContentChild,
    TemplateRef,
    Component,
    AfterViewInit
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { FileUploadControl } from '../helpers/control.class';
import { IsNullOrEmpty } from '../helpers/helpers.class';
import { FileUploadService } from '../services/file-upload.service';
import { DRAGOVER, TOUCHED } from './file-upload.component';
import { Subscription } from 'rxjs';


@Component({
    selector: `[file-drop-zone]`,
    template: `
        <ng-content></ng-content>
        <div #overlay class="overlay" *ngIf="fileUploadService.isFileDragDropAvailable()">

            <div class="upload-input">
                <ng-container *ngTemplateOutlet="templateRef ? templateRef : defaultTemplate"></ng-container>

                <ng-template #defaultTemplate>
                    <file-upload-drop-zone>
                        <b>Drop</b> it here
                    </file-upload-drop-zone>
                </ng-template>
            </div>
        </div>
    `,
    styleUrls: [`./file-upload-attr.component.scss`],
    providers: [ 
        FileUploadService
    ]
})
export class FileUploadAttributeComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input()
    public control: FileUploadControl = null;

    @ViewChild('overlay')
    public overlay: ElementRef<HTMLDivElement>;

    @ContentChild('placeholder')
    public templateRef: TemplateRef<any> = null;

    private hooks: Array<Function> = [];

    private subscriptions: Array<Subscription> = [];

    constructor(
        public fileUploadService: FileUploadService,
        private hostElementRef: ElementRef,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document
    ) {}

    public ngOnInit() {
        if (IsNullOrEmpty(this.control)) {
            this.control = new FileUploadControl();
        }
    }

    public ngAfterViewInit(): void {
        if (this.fileUploadService.isFileDragDropAvailable()) {
            this.setEvents();
            this.checkAndMarkAsDisabled();
        }
    }

    public ngOnDestroy(): void {
        this.hooks.forEach((hook) => hook());
        this.hooks.length = 0;
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions.length = 0;
    }

    @HostBinding('class.has-files')
    public get hasFiles(): boolean {
        return this.control.isListVisible && this.control.size > 0;
    }

    @HostBinding('class.ng-invalid')
    public get isInvalid(): boolean {
        return !this.control.disabled && this.control.invalid;
    }

    private setEvents(): void {
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.document, eventName, (event: any) => this.preventDragEvents(event))
            );
        });

        ['dragover', 'dragenter'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.hostElementRef.nativeElement, eventName, (event: any) => this.onDragOver(event))
            );
        });

        ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.hostElementRef.nativeElement, eventName, (event: any) => {
                    if(this.control.disabled && eventName === 'dragleave' || eventName !== 'dragleave') {
                        this.onDragLeave(event);
                    }
                })
            );
        });

        ['dragleave'].forEach((eventName) => {
            this.hooks.push(
                this.renderer.listen(this.overlay.nativeElement, eventName, (event: any) => this.onDragLeave(event))
            );
        });

        this.subscriptions.push(
            this.control.statusChanges.subscribe((status) => this.checkAndMarkAsDisabled())
        );
    }

    private checkAndMarkAsDisabled(): void {
        if (this.control.disabled) {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'disabled');
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'disabled');
        }
    }

    private preventDragEvents(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * on file over add class name
     */
    private onDragOver(event: Event): void {
        this.renderer.addClass(this.hostElementRef.nativeElement, DRAGOVER);
    }

    /**
     * on mouse out remove class name
     */
    private onDragLeave(event: Event): void {
        this.renderer.removeClass(this.hostElementRef.nativeElement, DRAGOVER);
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: Event): void {
        if (this.control.disabled) {
            return;
        }
        const files = (event as any).dataTransfer.files;
        this.control.addFiles(files);
        this.onTouch();
    }

    private onTouch: () => void = () => {
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED);
    }

}
