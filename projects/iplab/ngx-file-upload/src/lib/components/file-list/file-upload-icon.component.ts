import { Component, OnInit, ChangeDetectionStrategy, Signal, input } from '@angular/core';
import { FileUploadService } from '../../services/file-upload.service';


export type IFileType = 'text' | 'audio' | 'video' | 'image';


@Component({
    selector: `file-upload-icon`,
    templateUrl: `./file-upload-icon.component.html`,
    styleUrls: [`./file-upload-icon.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class FileUploadIconComponent implements OnInit {

    public file: Signal<File> = input.required<File>();

    private fileType: string = 'unknown';

    constructor(private fileUploadService: FileUploadService) {
    }

    public ngOnInit(): void {
        this.fileType = this.fileUploadService.getFileType(this.file());
    }

    public comparationType(): IFileType {
        if (this.isIcon('image')) {
            return 'image';
        } else if (this.isIcon('text')) {
            return 'text';
        } else if (this.isIcon('audio')) {
            return 'audio';
        } else if (this.isIcon('video')) {
            return 'video';
        }
        return null;
    }

    private isIcon(type: IFileType): boolean {
        switch (type) {
            case 'text':
                return this.fileType === 'html' || this.fileType === 'css' ||
                    this.fileType === 'csv' || this.fileType === 'js' ||
                    this.fileType === 'pdf' || this.fileType === 'ppt' ||
                    this.fileType === 'xls' || this.fileType === 'xlsx' ||
                    this.fileType === 'xml' || this.fileType === 'doc' ||
                    this.fileType === 'txt' || this.fileType === 'docx';
            case 'audio':
                return this.fileType === 'aac' || this.fileType === 'midi' ||
                    this.fileType === 'oga' || this.fileType === 'wav' ||
                    this.fileType === 'weba';
            case 'image':
                return this.fileType === 'png' || this.fileType === 'bmp' ||
                    this.fileType === 'gif' || this.fileType === 'jpg' ||
                    this.fileType === 'svg' || this.fileType === 'webp' ||
                    this.fileType === 'ico';
            case 'video':
                return this.fileType === 'avi' || this.fileType === 'mpeg' ||
                    this.fileType === 'ogv' || this.fileType === 'webm' ||
                    this.fileType === '3gp' || this.fileType === '3g2';
        }
    }
}
