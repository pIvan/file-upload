import { AbstractControl } from '@angular/forms';
import { IsNullOrEmpty } from './helpers.class';
import { FileUploadControl } from './control.class';

export interface ValidationErrors {
    [key: string]: any;
}

export interface ValidatorFn {
    (c: AbstractControl | FileUploadControl): ValidationErrors | null;
}

/**
 * function used to check file size
 */
const checkFileSize = (file: File, maxSize: number): ValidationErrors | null => {
    return file.size > maxSize ?
        {maxSize, actual: file.size, file} : null;
}

const FILE_EXT_REG = /(^[.]\w*)$/gm;
/**
 * function used to check file type
 * 
 * #### allowedTypes
 * file_extension|audio/*|video/*|image/*|media_type
 */
const checkFileType = (file: File, allowedTypes: Array<string>): ValidationErrors | null => {
    const fileExtension = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 1);
    let isValid = false;
    for(let i = 0; i < allowedTypes.length; i++ ) {
        let type = allowedTypes[i];

        isValid = FILE_EXT_REG.test(type) ? type === fileExtension : new RegExp(type).test(file.type);
        if(isValid) {
            break;
        }
    }

    return isValid ?
            null : {allowedTypes, actual: file.type, file};
}

const checkValueType = (value: any ): void => {
    if (!Array.isArray(value)) {
        throw Error(`FormControl.setValue was provided with wrong argument type, ${value} was provided instead Array<File>`);
    }
}

// @dynamic
export class FileUploadValidators {

    /**
     * Validator that requires controls to have a file maximum size length.
     * Compare the File size in bytes
     * @dynamic
     */
    public static fileSize(maxSize: number): ValidatorFn {
        return (control: AbstractControl | FileUploadControl): {fileSize: Array<ValidationErrors>} => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const toLargeFiles = files.map((file) => checkFileSize(file, maxSize))
                                        .filter((error) => error);

            return toLargeFiles.length > 0 ?
                    {'fileSize': toLargeFiles} : null;
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

            return files.length > numFiles ?
                {'filesLimit': {'max': numFiles, 'actual': files.length}} : null;
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
     * - media_type -     A valid media type, with no parameters. Look at [IANA Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml) for a complete list of standard media types
     * 
     * #### Example
     * `FileUploadValidators.accept([file_extension, audio/*, video/*, image/*, media_type])`
     * @dynamic
     */
    public static accept(allowedFileTypes: Array<string>) {
        return (control: AbstractControl | FileUploadControl): ValidationErrors => {
            const files: Array<File> = control.value;
            if (IsNullOrEmpty(files)) { return null; }
            checkValueType(files);

            const notAllowedFiles = files.map((file) => checkFileType(file, allowedFileTypes))
                                        .filter((error) => error);

            return notAllowedFiles.length > 0 ?
                {'fileTypes': notAllowedFiles} : null;
        };
    }

}