import { Directive, forwardRef, Input, OnChanges, SimpleChanges, Host, Self, Optional, HostBinding } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { ValidationErrors, ValidatorFn, FileUploadValidators } from './../helpers/validators.class';
import { IsNullOrEmpty } from './../helpers/helpers.class';
import { FileUploadService } from './../services/file-upload.service';


/**
 * A Directive that adds the `filesize` validator to controls marked with the
 * `filesize` attribute. The size of the file is in bytes or any other unit
 *
 * ### Example
 *
 * ```
 * <file-upload name="files" ngModel filesize="830000"></file-upload>
 * <file-upload name="files" ngModel [filesize]="830000"></file-upload>
 * <file-upload name="files" ngModel minSize="0" max="6200"></file-upload>
 * <file-upload name="files" ngModel filesize="123MB"></file-upload>
 * <file-upload name="files" ngModel [filesize]="12 mb"></file-upload>
 * <file-upload name="files" ngModel minSize="0" max="324KB"></file-upload>
 * ```
 *
 */
@Directive({
    selector: `file-upload[filesize][formControlName],
    file-upload[filesize][formControl],
    file-upload[filesize][ngModel],
    file-upload[minsize][formControlName],
    file-upload[minsize][formControl],
    file-upload[minsize][ngModel],
    file-upload[maxsize][formControlName],
    file-upload[maxsize][formControl],
    file-upload[maxsize][ngModel]`,
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => FileSizeValidator),
        multi: true
    }],
    host: {
        '[attr.filesize]': 'filesize ? filesize : null',
        '[attr.minsize]': 'minsize ? minsize : null',
        '[attr.maxsize]': 'maxsize ? maxsize : null'
    }
})
export class FileSizeValidator implements Validator, OnChanges {

    @Input()
    public filesize: string|number;

    @Input()
    public minsize: string|number;

    @Input()
    public maxsize: string|number;

    private validator: ValidatorFn;

    constructor(private readonly fileUploadService: FileUploadService){}

    private onChange: () => void;

    public ngOnChanges(changes: SimpleChanges): void {
        if ('filesize' in changes 
            || 'maxsize' in changes 
            || 'minsize' in changes) {
          this._createValidator();
          if (this.onChange) {
              this.onChange();
          }
        }
    }

    public validate(c: AbstractControl): ValidationErrors|null {
        return this.validator(c);
    }

    public registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn; 
    }

    private _createValidator(): void {
        let maxSize = null;
        if (!IsNullOrEmpty(this.maxsize)) {
            maxSize = this.fileUploadService.parseSize(this.maxsize);
        } else if(!IsNullOrEmpty(this.filesize)) {
            maxSize = this.fileUploadService.parseSize(this.filesize);
        }

        const minSize = this.fileUploadService.parseSize(this.minsize);
        this.validator = FileUploadValidators.sizeRange({ maxSize, minSize });
    }
}


/**
 * A Directive that adds the `fileslimit` validator to controls marked with the
 * `fileslimit` attribute.
 *
 * ### Example
 *
 * ```
 * <file-upload name="files" ngModel fileslimit="2"></file-upload>
 * <file-upload name="files" ngModel [fileslimit]="2"></file-upload>
 * ```
 *
 */
@Directive({
    selector: 'file-upload[fileslimit][formControlName], file-upload[fileslimit][formControl], file-upload[fileslimit][ngModel]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => FilesLimitValidator),
        multi: true
    }],
    host: {'[attr.fileslimit]': 'fileslimit ? fileslimit : null'}
})
export class FilesLimitValidator implements Validator, OnChanges {

    @Input()
    public fileslimit: string|number;

    private validator: ValidatorFn;

    private onChange: () => void;

    public ngOnChanges(changes: SimpleChanges): void {
        if ('fileslimit' in changes) {
          this._createValidator();
          if (this.onChange) {
            this.onChange();
          }
        }
    }

    public validate(c: AbstractControl): ValidationErrors|null {
        return this.fileslimit != null ? this.validator(c) : null;
    }

    public registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn; 
    }

    private _createValidator(): void {
        this.validator = FileUploadValidators.filesLimit(typeof this.fileslimit === 'string' ? parseInt(this.fileslimit, 10) : this.fileslimit);
    }
}

/**
 * A Directive that adds the `accept` validator to controls marked with the
 * `accept` attribute.
 *
 * ### Example
 *
 * ```
 * <file-upload name="files" ngModel accept="file_extension|audio/*|video/*|image/*|media_type"></file-upload>
 * <file-upload name="files" ngModel [accept]="file_extension|audio/*|video/*|image/*|media_type"></file-upload>
 * ```
 * 
 * To specify more than one value, separate the values with a comma (e.g. <file-upload accept="audio/*,video/*,image/*"></file-upload>.
 *
 */
@Directive({
    selector: 'file-upload[accept][formControlName], file-upload[accept][formControl], file-upload[accept][ngModel]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => FilesAcceptValidator),
        multi: true
    }],
    host: {'[attr.accept]': 'accept ? accept : null'}
})
export class FilesAcceptValidator implements Validator, OnChanges {

    @Input()
    public accept: string;

    private validator: ValidatorFn;

    private onChange: () => void;

    public ngOnChanges(changes: SimpleChanges): void {
        if ('accept' in changes) {
          this._createValidator();
          if (this.onChange) {
              this.onChange();
          }
        }
    }

    public validate(c: AbstractControl): ValidationErrors|null {
        return !!this.validator ? this.validator(c) : null;
    }

    public registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn;
    }

    private _createValidator(): void {
        if (IsNullOrEmpty(this.accept)) {
            return;
        }
        this.validator = FileUploadValidators.accept(this.accept.split(','));
    }
}
