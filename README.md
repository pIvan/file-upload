# @iplab/ngx-file-upload

Angular file upload components with support for native file selection, drag and drop, Angular forms, validation, custom templates and CSS custom property theming.

[![npm version](https://badge.fury.io/js/%40iplab%2Fngx-file-upload.svg)](https://www.npmjs.com/package/@iplab/ngx-file-upload)

## Demo

Live demo and complete examples:

<https://pivan.github.io/file-upload/>

The demo covers reactive forms, template-driven forms, standalone controls, custom templates, localized templates, separate file lists, discarded files, attribute drop zones, simple single-file upload and theming.

## Compatibility

The current package version is `22.0.0` and its peer dependencies require Angular 22:

- `@angular/common`: `^22.0.0`
- `@angular/core`: `^22.0.0`
- `@angular/forms`: `^22.0.0`
- `rxjs`: `^7.0.0`

The demo compatibility table documents the library's Angular major-version lines from Angular 11 through Angular 22. For older Angular applications, install the matching library major version instead of the current `22.x` release. For example, an Angular 20 application should use the `20.x` library release.

Supported browsers are current Firefox, Chrome, Chromium and Edge releases.

## Installation

```shell
npm install @iplab/ngx-file-upload
```

### NgModule application

Import `FileUploadModule` together with the Angular forms module required by the application:

```typescript
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        FileUploadModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

### Standalone application

Import `FileUploadModule`, or the individual standalone components needed by the application:

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-root',
    template: `<file-upload [control]="fileUploadControl"></file-upload>`,
    standalone: true,
    imports: [ReactiveFormsModule, FileUploadModule]
})
export class AppComponent {}
```

## Usage

### Standalone control

```typescript
import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';

export class AppComponent {
    public readonly fileUploadControl = new FileUploadControl(
        { multiple: false },
        FileUploadValidators.fileSize(80000)
    );
}
```

```html
<file-upload [control]="fileUploadControl"></file-upload>
```

### Reactive forms

```typescript
import { FormControl, FormGroup } from '@angular/forms';
import { FileUploadValidators } from '@iplab/ngx-file-upload';

export class AppComponent {
    public readonly filesControl = new FormControl<File[] | null>(
        null,
        FileUploadValidators.accept(['video/*', 'image/*', '.mp3'])
    );

    public readonly demoForm = new FormGroup({
        files: this.filesControl
    });
}
```

```html
<form [formGroup]="demoForm">
    <file-upload formControlName="files"></file-upload>
</form>
```

### Template-driven forms

```html
<form #demoForm="ngForm">
    <file-upload
        [(ngModel)]="uploadedFiles"
        [disabled]="isDisabled"
        name="files"
        fileslimit="2">
    </file-upload>
</form>
```

## Validation and options

`FileUploadControl` accepts options such as `multiple`, `listVisible`, `accept` and `discardInvalid`. Available validators include:

- `FileUploadValidators.fileSize(size)`
- `FileUploadValidators.filesLimit(limit)`
- `FileUploadValidators.accept(types)`
- `FileUploadValidators.reject(types)`

Accepted types can be file extensions such as `.mp3`, media types such as `image/*`, or complete MIME types. Multiple values can be provided as an array.

The library also provides `filesize`, `fileslimit` and `accept` directives for template-based validation, plus `discard` and `native` behavior directives.

## Custom templates

Use `#placeholder` to replace the upload placeholder and `#item` to replace the file-list item:

```html
<file-upload [control]="fileUploadControl">
    <ng-template let-isFileDragDropAvailable="isFileDragDropAvailable" #placeholder>
        @if (isFileDragDropAvailable) {
            <span>Drop or click to choose files</span>
        } @else {
            <span>Click to choose a file</span>
        }
    </ng-template>

    <ng-template let-file="file" let-control="control" #item>
        <div (click)="control.removeFile(file)">{{ file.name }}</div>
    </ng-template>
</file-upload>
```

Built-in templates can also be localized by using `file-upload-drop-zone` and `file-upload-list-item` directly.

## Theming

The default CSS custom properties are provided by the upload component theme. No application-level stylesheet import is required. Override them on the `file-upload` host element or an ancestor wrapper:

```scss
file-upload.theme-demo-file-upload {
    --ngx-file-upload-surface: #202124;
    --ngx-file-upload-surface-subtle: #2b2d31;
    --ngx-file-upload-text: #f1f3f4;
    --ngx-file-upload-radius: 8px;
    --ngx-file-upload-shadow: 0 8px 24px rgb(0 0 0 / 25%);
    --ngx-file-upload-border-strong: #62c7b5;
    --ngx-file-upload-accent: #62c7b5;
    --ngx-file-upload-border: 1px solid #4b4d52;
    --ngx-file-upload-dashed-border: 1px dashed #62c7b5;
    --ngx-file-upload-icon-color: #9adbd1;
    --ngx-file-upload-danger: #ffd1cd;
    --ngx-simple-file-upload-button-surface: #35383e;
}
```

Available properties:

`--ngx-file-upload-surface`, `--ngx-file-upload-surface-subtle`, `--ngx-file-upload-text`, `--ngx-file-upload-radius`, `--ngx-file-upload-shadow`, `--ngx-file-upload-border-strong`, `--ngx-file-upload-accent`, `--ngx-file-upload-border`, `--ngx-file-upload-dashed-border`, `--ngx-file-upload-icon-color`, `--ngx-file-upload-danger` and `--ngx-simple-file-upload-button-surface`.

## Development

This repository contains both the demo application and the `ngx-library` Angular library project. The current workspace uses Angular CLI 22, Angular 22 and TypeScript 6.

```shell
git clone https://github.com/pIvan/file-upload.git
cd file-upload
npm install
```

Start the demo application:

```shell
npm run start
```

The development server uses port `4200` and opens the application at <http://localhost:4200/>. The production demo is generated into the `docs/` directory and uses `/file-upload/` as its base href.

## Build and test

Build the demo application:

```shell
npm run build
```

Build the production demo:

```shell
npm run build:git:demo
```

Build and test the library, copy package documentation and build the demo:

```shell
npm run build:library
```

Run the application tests:

```shell
npm run test
```

The library build output is written to `dist/lib`. The demo build output is written to `docs/`.

## Publishing

After a successful library build, publish the generated package with:

```shell
npm run build:publish
```

This publishes `dist/lib` as the `latest` npm tag.

## Versioning

The project follows [Semantic Versioning](https://semver.org/). Angular major versions are tracked by matching major versions of `@iplab/ngx-file-upload`.

## Contributing

Bug reports, code contributions and documentation improvements are welcome. See the [contributing guide](https://github.com/pIvan/file-upload/blob/master/CONTRIBUTING.md) and [open issues](https://github.com/pIvan/file-upload/issues).

## License

`@iplab/ngx-file-upload` is distributed under the [MIT license](https://github.com/pIvan/file-upload/blob/master/LICENSE).
