import { AbstractControl } from '@angular/forms';
import { IsNullOrEmpty } from './helpers.class';
import { FileUploadControl } from './control.class';
import { FileUploadTypes } from './file-types.class';

export interface ValidationError {
    actual: any;
    file: File;
    [key: string]: any;
}

export interface ValidationErrors {
    [key: string]: any;
}

export type  ValidatorFn = (c: AbstractControl | FileUploadControl) => ValidationErrors | null;

/**
 * function used to check file size
 */
const checkFileSize = (actualSize: number, maxSize: number, minSize: number = 0, file?: File): ValidationErrors | null => {
    return (!IsNullOrEmpty(maxSize) && actualSize > maxSize) || actualSize < minSize ?
        {maxSize, minSize, actual: actualSize, file} : null;
};

const getFileType = (file: File, fileExtension: string): FileUploadTypes => {
    const type = file.type;
    if (!IsNullOrEmpty(type)) {
        return type as FileUploadTypes;
    }

    return FileUploadTypes[fileExtension];
};

enum CheckType {
    ALLOWED,
    NOTALLOWED
}

const FILE_EXT_REG = /(^[.]\w*)$/m;
/**
 * function used to check file type
 *
 * #### allowedTypes
 * file_extension|audio/*|video/*|image/*|media_type
 */
const checkFileTypes = (file: File, types: Array<string>, checkType: CheckType): ValidationErrors | null => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileType = getFileType(file, fileExtension);

    for (const type of types) {
        const isFound = FILE_EXT_REG.test(type) ? type === `.${fileExtension}` : new RegExp(type).test(fileType);
        if (isFound) {
            return checkType === CheckType.ALLOWED ? null : {notAllowedTypes: types, actual: fileType, file};
        }
    }

    return checkType === CheckType.ALLOWED ? {allowedTypes: types, actual: fileType, file} : null;
};

const checkValueType = (value: any ): void => {
    if (!Array.isArray(value)) {
        throw Error(`FormControl.setValue was provided with wrong argument type, ${value} was provided instead Array<File>`);
    }
};

// @dynamic
export class FileUploadValidators {

    /**
     * Validator that compare the summary size of all files
     */
    public static sizeLimit(maxSize: number): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): {sizeLimit: ValidationErrors} | null => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const sum = files.map(file => file.size).reduce((a, b) => a + b, 0);
            const toLargeFiles = checkFileSize(sum, maxSize);

            return toLargeFiles ?
                    {'sizeLimit': toLargeFiles} : null;
        };
    }

    /**
     * Validator that validate individually file maximum size length.
     * Compare the File size in bytes
     * @dynamic
     */
    public static fileSize(maxSize: number): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): {fileSize: Array<ValidationErrors>} => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const toLargeFiles = files.map((file) => checkFileSize(file.size, maxSize, 0, file))
                                        .filter((error) => error);

            return toLargeFiles.length > 0 ?
                    {'fileSize': toLargeFiles} : null;
        };
    }

    /**
     * Compare the File size in bytes with max and min size limits
     * @dynamic
     */
    public static sizeRange({ minSize, maxSize }: { minSize?: number; maxSize?: number }): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): {sizeRange: Array<ValidationErrors>} => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const sizeMismatch = files.map((file) => checkFileSize(file.size, maxSize, minSize, file))
                                        .filter((error) => error);

            return sizeMismatch.length > 0 ?
                    {'sizeRange': sizeMismatch} : null;
        };
    }

    /**
     * validator that requires control to have limit on files number
     * @dynamic
     */
    public static filesLimit(numFiles: number): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): ValidationErrors => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const filesLimit = files.slice(-1 * (files.length - numFiles))
                                    .map(file => ({'max': numFiles, 'actual': files.length, file }));

            return files.length > numFiles ?
                {'filesLimit': filesLimit} : null;
        };
    }

    /**
     * validator that requires control to have limit on media types
     *
     * ##### Allowed media types are
     *
     * - file_extension - a file extension starting with the STOP character,
     * e.g: .gif, .jpg, .png, .doc
     * - audio/* -        All sound files are accepted
     * - video/* -        All video files are accepted
     * - image/* -        All image files are accepted
     * - media_type -     A valid media type, with no parameters. Look at [IANA Media Types]
     *      (https://www.iana.org/assignments/media-types/media-types.xhtml) for a complete list of standard media types
     *
     * #### Example
     * `FileUploadValidators.accept([file_extension, audio/*, video/*, image/*, media_type])`
     * @dynamic
     */
    public static accept(allowedFileTypes: Array<string>): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): ValidationErrors => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const notAllowedFiles = files.map((file) => checkFileTypes(file, allowedFileTypes, CheckType.ALLOWED))
                                        .filter((error) => error);

            return notAllowedFiles.length > 0 ?
                {'fileTypes': notAllowedFiles} : null;
        };
    }

    /**
     * validator that requires control to have limit on media types
     *
     * ##### Not allowed media types are
     *
     * - file_extension - a file extension starting with the STOP character,
     * e.g: .gif, .jpg, .png, .doc
     * - audio/* -        All sound files are accepted
     * - video/* -        All video files are accepted
     * - image/* -        All image files are accepted
     * - media_type -     A valid media type, with no parameters. Look at [IANA Media Types]
     *      (https://www.iana.org/assignments/media-types/media-types.xhtml) for a complete list of standard media types
     *
     * #### Example
     * `FileUploadValidators.reject([file_extension, audio/*, video/*, image/*, media_type])`
     * @dynamic
     */
    public static reject(rejectFileTypes: Array<string>): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): ValidationErrors => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const notAllowedFiles = files.map((file) => checkFileTypes(file, rejectFileTypes, CheckType.NOTALLOWED))
                                        .filter((error) => error);

            return notAllowedFiles.length > 0 ?
                {'fileTypes': notAllowedFiles} : null;
        };
    }

}
