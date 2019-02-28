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
                    <div class="icon">
                        <svg viewBox="0 0 96 96">
                            <g>
                                <path d="M62.8,68.1c0-0.6-0.2-1.1-0.6-1.5c-0.4-0.4-0.9-0.6-1.5-0.6s-1.1,0.2-1.5,0.6
                                    c-0.4,0.4-0.6,0.9-0.6,1.5c0,0.6,0.2,1.1,0.6,1.5c0.4,0.4,0.9,0.6,1.5,0.6s1.1-0.2,1.5-0.6S62.8,68.7,62.8,68.1z M71.3,68.1
                                    c0-0.6-0.2-1.1-0.6-1.5c-0.4-0.4-0.9-0.6-1.5-0.6c-0.6,0-1.1,0.2-1.5,0.6C67.2,67,67,67.5,67,68.1c0,0.6,0.2,1.1,0.6,1.5
                                    s0.9,0.6,1.5,0.6c0.6,0,1.1-0.2,1.5-0.6C71.1,69.2,71.3,68.7,71.3,68.1z M75.5,60.7v10.6c0,0.9-0.3,1.6-0.9,2.2
                                    c-0.6,0.6-1.4,0.9-2.2,0.9H23.7c-0.9,0-1.6-0.3-2.2-0.9c-0.6-0.6-0.9-1.4-0.9-2.2V60.7c0-0.9,0.3-1.6,0.9-2.2
                                    c0.6-0.6,1.4-0.9,2.2-0.9h14.1c0.5,1.2,1.2,2.2,2.3,3c1.1,0.8,2.3,1.2,3.7,1.2h8.5c1.3,0,2.6-0.4,3.7-1.2c1.1-0.8,1.9-1.8,2.3-3
                                    h14.1c0.9,0,1.6,0.3,2.2,0.9C75.2,59.1,75.5,59.8,75.5,60.7z M64.8,39.3c-0.4,0.9-1,1.3-2,1.3h-8.5v14.8c0,0.6-0.2,1.1-0.6,1.5
                                    c-0.4,0.4-0.9,0.6-1.5,0.6h-8.5c-0.6,0-1.1-0.2-1.5-0.6c-0.4-0.4-0.6-0.9-0.6-1.5V40.6h-8.5c-0.9,0-1.6-0.4-2-1.3
                                    c-0.4-0.9-0.2-1.6,0.5-2.3l14.8-14.8c0.4-0.4,0.9-0.6,1.5-0.6s1.1,0.2,1.5,0.6L64.3,37C65,37.7,65.1,38.4,64.8,39.3z"/>
                            </g>
                        </svg>
                    </div>
                
                    <div class="upload-text">
                        <b>Drop</b> it here
                    </div>
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

    private preventDragEvents(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * on file over add class name
     */
    private onDragOver(event: DragEvent): void {
        this.renderer.addClass(this.hostElementRef.nativeElement, DRAGOVER);
    }

    /**
     * on mouse out remove class name
     */
    private onDragLeave(event: DragEvent): void {
        this.renderer.removeClass(this.hostElementRef.nativeElement, DRAGOVER);
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        if (this.control.disabled) {
            return;
        }
        const files = event.dataTransfer.files;
        this.control.addFiles(files);
        this.onTouch();
    }

    private onTouch: () => void = () => {
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED);
    }

}
