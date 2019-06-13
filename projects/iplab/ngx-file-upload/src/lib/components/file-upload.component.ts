import {
    Component,
    Input,
    OnInit,
    ElementRef,
    HostListener,
    Renderer2,
    HostBinding,
    Inject,
    TemplateRef,
    ViewChild,
    ChangeDetectionStrategy,
    ContentChild,
    forwardRef,
    ChangeDetectorRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { AnimationEvent } from '@angular/animations';

import { FileUploadControl } from './../helpers/control.class';
import { FileUploadService } from './../services/file-upload.service';
import { InsertAnimation } from './../animations/insert.animation';
import { ZoomAnimation } from './../animations/zoom.animation';
import { FileUploadAbstract } from './file-upload-abstract.component';

export const DRAGOVER = 'dragover';
export const TOUCHED = 'ng-touched';

@Component({
    selector: `file-upload:not([simple])`,
    templateUrl: `./file-upload.component.html`,
    styleUrls: [`./file-upload.component.scss`],
    providers: [
        FileUploadService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploadComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        ZoomAnimation,
        InsertAnimation
    ]
})
export class FileUploadComponent extends FileUploadAbstract implements ControlValueAccessor {

    @Input()
    public control: FileUploadControl = null;

    @Input()
    public animation: boolean | string = true;

    @ContentChild('placeholder', { static: false })
    public templateRef: TemplateRef<any> = null;

    @ContentChild('item', { static: false })
    public listItem: TemplateRef<any> = null;

    @ViewChild('inputRef', { static: true })
    public input: ElementRef<HTMLInputElement>;

    @ViewChild('labelRef', { static: true })
    public label: ElementRef<HTMLLabelElement>;

    public templateContext = {
        $implicit: this.fileUploadService.isFileDragDropAvailable(),
        isFileDragDropAvailable: this.fileUploadService.isFileDragDropAvailable()
    };

    /** animation fields */
    public zoomText: 'zoomOut' | 'zoomIn' | 'static' = 'static';
    public listVisible: boolean = false;

    constructor(
        public fileUploadService: FileUploadService,
        hostElementRef: ElementRef,
        renderer: Renderer2,
        @Inject(DOCUMENT) private document,
        cdr: ChangeDetectorRef
    ) {
        super(hostElementRef, renderer, cdr);
    }

    @HostBinding('class.has-files')
    public get hasFiles(): boolean {
        return this.control.isListVisible && this.control.size > 0;
    }

    @HostBinding('class.ng-invalid')
    public get isInvalid(): boolean {
        return !this.control.disabled && this.control.invalid;
    }

    @HostBinding('@.disabled')
    public get isAnimationDisabled(): boolean {
        return this.animation === false || (this.animation as string) === 'false';
    }

    protected setEvents(): void {
        super.setEvents();
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
                this.renderer.listen(this.hostElementRef.nativeElement, eventName, (event: any) => this.onDragLeave(event))
            );
        });

        this.subscriptions.push(
            this.control.valueChanges.subscribe((files) => this.renderView())
        );

        this.subscriptions.push(
            this.control.listVisibilityChanges.subscribe((status) => this.toggleListVisibility())
        );
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            this.control.click();
        }
    }

    private preventDragEvents(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private renderView(): void {
        if (!this.listVisible) {
            this.zoomText = this.control.isListVisible && this.control.size > 0 ? 'zoomOut' : 'static';
        }
        this.cdr.markForCheck();
    }

    private showList(): void {
        if (this.zoomText !== 'static') {
            this.listVisible = true;
        }
    }

    private hideList(): void {
        this.listVisible = false;
    }

    private toggleListVisibility(): void {
        this.listVisible = this.control.isListVisible && this.control.size > 0;
        if (this.listVisible) {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'list-visible');
            this.zoomText = 'static';
        }
        this.cdr.markForCheck();
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

    public onInputChange(event: Event): void {
        const input = (event.target) as HTMLInputElement;

        if (!this.control.disabled && input.files.length > 0) {
            this.control.addFiles(input.files);
            this.clearInputEl();
        }

        this.onTouch();
    }

    private clearInputEl(): void {
        this.input.nativeElement.value = null;
    }

     /**
      * model -> view changes
      */
    public writeValue(files: any): void {
        if (files != null) {
            this.control.setValue(files);
        }
    }

    /**
     * register function which will be called on UI change
     * to update view -> model
     */
    public registerOnChange(fn: (v: Array<File>) => void): void {
        this.onChange = fn;
    }

    private onTouch: () => void = () => {
        this.renderer.addClass(this.hostElementRef.nativeElement, TOUCHED);
    };

    public registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.control.disable(isDisabled);
    }

    public zoomAnimationDone(event: AnimationEvent): void {
        if (this.control.isListVisible && this.control.size > 0) {
            this.showList();
        } else {
            this.hideList();
        }

        if (event.fromState === 'static' && event.toState === 'zoomOut') {
            this.renderer.addClass(this.hostElementRef.nativeElement, 'hide-text');
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'hide-text');
        }

        if (event.toState === 'zoomIn') {
            this.zoomText = 'static';
        }
    }

    public animationListFinished(event: AnimationEvent): void {
        if (event.toState === 'void') {
            this.zoomText = 'zoomIn';
            this.renderer.removeClass(this.hostElementRef.nativeElement, 'list-visible');
        }
        if (event.fromState === 'void') {
            this.zoomText = 'static';
            this.renderer.addClass(this.hostElementRef.nativeElement, 'list-visible');
        }
    }
}
