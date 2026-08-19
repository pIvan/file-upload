import {
  Component,
  HostListener,
  Inject,
  TemplateRef,
  ChangeDetectionStrategy,
  forwardRef,
  booleanAttribute,
  contentChild,
  Signal,
  input,
  InputSignalWithTransform,
  effect,
  DOCUMENT,
  signal,
  WritableSignal,
  viewChild,
  ElementRef
} from '@angular/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { FileUploadService } from './../../services/file-upload.service';
import { FileUploadAbstract, DRAGOVER_CLASS_NAME, HAS_ANIMATION_CLASS_NAME } from './../file-upload-abstract.component';
import { FileUploadDropZoneComponent } from './../drop-zone/file-upload-drop-zone.component';
import { FileUploadListItemComponent } from './../file-list/file-upload-list-item.component';
import { FileUploadControl } from './../../helpers/control.class';
import { fromEvent, Subscription } from 'rxjs';


export enum AnimationState {
    ZOOM_OUT = 'zoom-out',
    ZOOM_IN = 'zoom-in',
    STATIC = 'static',
    FADE_IN = 'fade-in',
    FADE_OUT = 'fade-out'
}

export enum ListAnimationState {
    VISIBLE = 'list-visible',
    HIDE_TEXT = 'hide-text'
}

@Component({
    selector: `file-upload:not([simple])`,
    templateUrl: `./file-upload.component.html`,
    styleUrls: [
        `../../file-upload-theme.scss`,
        `./file-upload.component.scss`
    ],
    providers: [
        FileUploadService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploadComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
    AsyncPipe,
    NgTemplateOutlet,
    FileUploadDropZoneComponent,
    FileUploadListItemComponent],
    host: {
        '[class.animated]': 'animation()'
    }
})
export class FileUploadComponent extends FileUploadAbstract implements ControlValueAccessor {

    public animation: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(true, { transform: booleanAttribute });

    protected templateRef: Signal<TemplateRef<any> | undefined> = contentChild('placeholder', { read: TemplateRef });

    protected listItem: Signal<TemplateRef<any> | undefined> = contentChild('item', { read: TemplateRef });

    protected listContainerRef: Signal<ElementRef<any> | undefined> = viewChild('listContainerRef');

    protected templateContext = {
        $implicit: this.fileUploadService.isFileDragDropAvailable(),
        isFileDragDropAvailable: this.fileUploadService.isFileDragDropAvailable()
    };

    /** animation fields */
    protected readonly zoomState: WritableSignal<AnimationState> = signal(AnimationState.STATIC);
    protected readonly isListVisible: WritableSignal<boolean> = signal(false);
    private animationListener: Subscription | null = null

    constructor(
        private readonly fileUploadService: FileUploadService,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {
        super();

        effect((onCleanup) => {
            this.checkAndSetMultiple();

            if (this.isAnimationDisabled()) {
                // rewmove css animated class if needed
                this.renderer.removeClass(this.hostElementRef.nativeElement, HAS_ANIMATION_CLASS_NAME);
            } else {
                this.animationListener = fromEvent<AnimationEvent>(this.label().nativeElement, 'animationend')
                                            .subscribe((event) => {
                                                const STATE = event.animationName.endsWith(AnimationState.ZOOM_OUT) ?
                                                AnimationState.ZOOM_OUT : event.animationName.endsWith(AnimationState.ZOOM_IN) ?
                                                AnimationState.ZOOM_IN : AnimationState.STATIC;

                                                this.zoomAnimationDone(STATE);
                                            });
            }

            onCleanup(() => {
                // cleanup previous animation listener
                this.animationListener?.unsubscribe();
            });
        });

        effect(() => {
            // setup and cleanup previous list animation state
            if (this.listContainerRef()) {
                this.animationListEnter()
            } else {
                this.animationListLeave();
            }
        });
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            const control = this.getControlInstance();
            control.click();
        }
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: Event): void {
        const control = this.getControlInstance();
        if (control.disabled) {
            return;
        }
        // There is some issue with DragEvent in typescript lib.dom.d.ts
        const files = (event as any).dataTransfer.files;
        control.addFiles(files);
        this.onTouch();
    }

    public onInputChange(event: Event): void {
        const input = (event.target) as HTMLInputElement;
        const control = this.getControlInstance();
        const files = input.files;

        if (!control.disabled && files && files.length > 0) {
            control.addFiles(files);
            this.clearInputEl();
        }

        this.onTouch();
    }

     /**
      * model -> view changes
      */
    public writeValue(files: any): void {
        if (files != null) {
            const control = this.getControlInstance();
            control.setValue(files, { emitEvent: false });
            this.renderView();
        }
    }

    public setDisabledState(isDisabled: boolean): void {
        const control = this.getControlInstance();
        control.disable(isDisabled);
    }

    protected zoomAnimationDone(state: AnimationState): void {
        const control = this.getControlInstance();
        if (control.isListVisible && control.size > 0) {
            this.showList();
        } else {
            this.hideList();
        }

        if (state == AnimationState.ZOOM_OUT) {
            this.renderer.addClass(this.hostElementRef.nativeElement, ListAnimationState.HIDE_TEXT);
        } else {
            this.renderer.removeClass(this.hostElementRef.nativeElement, ListAnimationState.HIDE_TEXT);
        }

        if (state == AnimationState.ZOOM_IN) {
            this.zoomState.set(AnimationState.STATIC);
        }
    }

    // animation callbacks used only with css animation
    protected animationListLeave(): void {
        this.zoomState.set(AnimationState.ZOOM_IN);
        this.renderer.removeClass(this.hostElementRef.nativeElement, ListAnimationState.VISIBLE);
    }

    protected animationListEnter(): void {
        this.renderer.addClass(this.hostElementRef.nativeElement, ListAnimationState.VISIBLE);
        this.zoomState.set(AnimationState.STATIC);
    }

    protected getListItemTemplateContext(index: number, item: File):
        { $implicit: File, file: File, index: number, control: FileUploadControl } {
        return {
            $implicit: item,
            file: item,
            index,
            control: this.getControlInstance()
        };
    }

    protected trackByFn(index: number, item: File): string {
        return item.name;
    }

    protected override registerEvents(): void {
        super.registerEvents();
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

        const control = this.getControlInstance();
        this.subscriptions.push(
            control.valueChanges.subscribe((files) => this.renderView())
        );

        this.subscriptions.push(
            control.listVisibilityChanges.subscribe((status) => this.toggleListVisibility())
        );
    }

    private isAnimationDisabled(): boolean {
        return this.animation() === false;
    }

    private preventDragEvents(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * this triggers animation state
     */
    private renderView(): void {
        // ako nema animacije postaviti sve css klase da se statički prikaže sve
        if (!this.isListVisible()) {
            const control = this.getControlInstance();
            const ZOOM_STATE = control.isListVisible && control.size > 0 ? AnimationState.ZOOM_OUT : AnimationState.STATIC;
            this.zoomState.set(ZOOM_STATE);
        }

        if (this.isAnimationDisabled()) {
            // If animation is turned off, watch for changes in the list
            // and then dd the necessary CSS classes
            this.zoomAnimationDone(AnimationState.STATIC);
        }

        this.cdr.detectChanges();
    }

    private showList(): void {
        this.isListVisible.set(true);
    }

    private hideList(): void {
        this.isListVisible.set(false);
    }

    private toggleListVisibility(): void {
        const control = this.getControlInstance();
        this.isListVisible.set(control.isListVisible && control.size > 0);
        if (this.isListVisible()) {
            this.renderer.addClass(this.hostElementRef.nativeElement, ListAnimationState.VISIBLE);
            this.zoomState.set(AnimationState.STATIC);
        }
        this.cdr.detectChanges();
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
}
