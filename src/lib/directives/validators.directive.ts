import { Directive, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { ValidationErrors, ValidatorFn, FileUploadValidators } from './../helpers/validators.class';


/**
 * A Directive that adds the `filesize` validator to controls marked with the
 * `filesize` attribute.
 *
 * ### Example
 *
 * ```
 * <file-upload name="files" ngModel filesize="830000"></file-upload>
 * <file-upload name="files" ngModel [filesize]="830000"></file-upload>
 * ```
 *
 */
@Directive({
    selector: '[filesize][formControlName],[filesize][formControl],[filesize][ngModel]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => FileSizeValidator),
        multi: true
    }],
    host: {'[attr.filesize]': 'filesize ? filesize : null'}
})
export class FileSizeValidator implements Validator, OnChanges {
    
    @Input()
    private filesize: string|number;

    private validator: ValidatorFn;

    private onChange: () => void;
  
    public ngOnChanges(changes: SimpleChanges): void {
        if ('filesize' in changes) {
          this._createValidator();
          if (this.onChange) this.onChange();
        }
    }

    public validate(c: AbstractControl): ValidationErrors|null {
        return this.filesize != null ? this.validator(c) : null;
    }
  
    public registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn; 
    }

    private _createValidator(): void {
        this.validator = FileUploadValidators.fileSize(typeof this.filesize === 'string' ? parseInt(this.filesize, 10) : this.filesize);
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
    selector: '[fileslimit][formControlName],[fileslimit][formControl],[fileslimit][ngModel]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => FilesLimitValidator),
        multi: true
    }],
    host: {'[attr.fileslimit]': 'fileslimit ? fileslimit : null'}
})
export class FilesLimitValidator implements Validator, OnChanges {
    
    @Input()
    private fileslimit: string|number;

    private validator: ValidatorFn;

    private onChange: () => void;
  
    public ngOnChanges(changes: SimpleChanges): void {
        if ('fileslimit' in changes) {
          this._createValidator();
          if (this.onChange) this.onChange();
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
    selector: '[accept][formControlName],[accept][formControl],[accept][ngModel]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => FilesLimitValidator),
        multi: true
    }],
    host: {'[attr.accept]': 'accept ? accept : null'}
})
export class FilesAcceptValidator implements Validator, OnChanges {
    
    @Input()
    private accept: string;

    private validator: ValidatorFn;

    private onChange: () => void;
  
    public ngOnChanges(changes: SimpleChanges): void {
        if ('accept' in changes) {
          this._createValidator();
          if (this.onChange) this.onChange();
        }
    }

    public validate(c: AbstractControl): ValidationErrors|null {
        return this.accept != null ? this.validator(c) : null;
    }
  
    public registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn; 
    }

    private _createValidator(): void {
        this.validator = FileUploadValidators.accept(this.accept.split(','));
    }
}
