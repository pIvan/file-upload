import {
    Input,
    OnInit,
    ElementRef,
    HostListener,
    Renderer2,
    OnDestroy,
    Inject,
    ViewChild,
    ContentChild,
    TemplateRef,
    Component,
    AfterViewInit,
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet, NgComponentOutlet } from '@angular/common';

import { FileUploadControl } from '../../helpers/control.class';
import { IsNullOrEmpty } from '../../helpers/helpers.class';
import { FileUploadService } from '../../services/file-upload.service';
import { DRAGOVER_CLASS_NAME, TOUCHED_CLASS_NAME } from './../multiple-file-upload/file-upload.component';
import { Subscription, merge } from 'rxjs';
import { FileUploadDropZoneComponent } from './../drop-zone/file-upload-drop-zone.component';
import { HAS_FILES_CLASS_NAME, IS_INVALID_CLASS_NAME } from './../file-upload-abstract.component';


@Component({
    selector: `[file-drop-zone]`,
    template: `
        <ng-content></ng-content>
        @if (fileUploadService.isFileDragDropAvailable()) {
            <div #overlay class="overlay">
                <div class="upload-input">
                    <ng-container *ngTemplateOutlet="templateRef ? templateRef : defaultTemplate"></ng-container>

                    <ng-template #defaultTemplate>
                        <file-upload-drop-zone>
                            <b>Drop</b> it here
                        </file-upload-drop-zone>
                    </ng-template>
                </div>
            </div>
        }
    `,
    styleUrls: [`./file-upload-attr.component.scss`],
    providers: [
        FileUploadService,
    ],
    imports: [
        NgTemplateOutlet,
        NgComponentOutlet,
        FileUploadDropZoneComponent
    ],
    standalone: true
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
        private readonly hostElementRef: ElementRef,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document
    ) {}

    public ngOnInit() {
        if (IsNullOrEmpty(this.control)) {
            this.control = new FileUploadControl();
        }

        this.subscriptions.push(
            merge(
                this.control.listVisibilityChanges,
                this.control.valueChanges
            )
            .subscribe(() => this.checkAndSetFilesClass())
        );

        this.subscriptions.push(
            merge(
                this.control.statusChanges,
                this.control.valueChanges
            )
            .subscribe(() => this.checkAndSetInvalidClass())
        );
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

    private hasFiles(): boolean {
        return this.control.isListVisible && this.control.size > 0;
    }

    private isInvalid(): boolean {
        return !this.control.disabled && this.control.invalid;
    }

    private checkAndSetFilesClass(): void {
        if (this.hasFiles() && this.hostElementRef) {
            this.renderer.addClass(this.hostElementRef.nativeElement, HAS_FILES_CLASS_NAME);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, HAS_FILES_CLASS_NAME);
        }
    }

    private checkAndSetInvalidClass(): void {
        if (this.isInvalid() && this.hostElementRef) {
            this.renderer.addClass(this.hostElementRef.nativeElement, IS_INVALID_CLASS_NAME);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, IS_INVALID_CLASS_NAME);
        }
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
        this.renderer.addClass(this.hostElementRef.nativeElement, DRAGOVER_CLASS_NAME);
    }

    /**
     * on mouse out remove class name
     */
    private onDragLeave(event: Event): void {
        this.renderer.removeClass(this.hostElementRef.nativeElement, DRAGOVER_CLASS_NAME);
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
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED_CLASS_NAME);
    }

}
