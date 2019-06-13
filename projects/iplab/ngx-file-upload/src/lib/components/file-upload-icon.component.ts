import { Component, Input, OnInit } from '@angular/core';
import { FileUploadService } from './../services/file-upload.service';


@Component({
    selector: `file-upload-icon`,
    templateUrl: `./file-upload-icon.component.html`,
    styleUrls: [`./file-upload-icon.component.scss`]
})
export class FileUploadIconComponent implements OnInit {

    @Input()
    public file: File;

    public fileType: string = 'unknown';

    constructor(private fileUploadService: FileUploadService) {
    }

    public ngOnInit(): void {
        this.fileType = this.fileUploadService.getFileType(this.file);
    }

    public isIcon(type: 'text' | 'audio' | 'video' | 'image'): boolean {
        switch (type) {
            case 'text':
                return this.fileType === 'html' || this.fileType === 'css' ||
                    this.fileType === 'csv' || this.fileType === 'js' ||
                    this.fileType === 'pdf' || this.fileType === 'ppt' ||
                    this.fileType === 'xls' || this.fileType === 'xlsx' ||
                    this.fileType === 'xml' || this.fileType === 'doc' ||
                    this.fileType === 'docx';
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
