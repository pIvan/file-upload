# @iplab/ngx-file-upload
> Angular module used for file upload.



[![npm version](https://badge.fury.io/js/%40iplab%2Fngx-file-upload.svg)](https://www.npmjs.com/package/@iplab/ngx-file-upload)
[![Build Status](https://travis-ci.com/pIvan/file-upload.svg?branch=master)](https://travis-ci.org/pIvan/file-upload)



# Demo
more detailed instructions can be found
[here](https://pivan.github.io/file-upload/)


# Tested with

- Firefox (latest)
- Chrome (latest)
- Chromium (latest)
- Edge

# Compatible with

- Angular 17 (@iplab/ngx-file-upload@version >= 17.0.0)
- Angular 16 (@iplab/ngx-file-upload@version >= 16.0.0)
- Angular 15 (@iplab/ngx-file-upload@version >= 15.0.0)
- Angular 14 (@iplab/ngx-file-upload@version >= 14.0.0)
- Angular 13 (@iplab/ngx-file-upload@version >= 13.0.0)
- Angular 12 (@iplab/ngx-file-upload@version >= 12.0.0)
- Angular 11 (@iplab/ngx-file-upload@version >= 11.0.0)
```shell
with older version of Angular use @iplab/ngx-file-upload@version < 4.0.0
```

## Installing / Getting started


```shell
npm install @iplab/ngx-file-upload
```

Use the following snippet inside your app module: 
```shell
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
...
...

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        FileUploadModule,
        BrowserAnimationsModule // or use NoopAnimationsModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

Use the following snippet inside your component: 
```shell
import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';


@Component({
    selector: `app-root`,
    template: `<file-upload [control]="fileUploadControl"></file-upload>`
})
export class AppComponent {

    public fileUploadControl = new FileUploadControl(null, FileUploadValidators.filesLimit(2));

    constructor() {
    }
}
```

With angular reactive form you can use the following snippet: 
```shell
import { FileUploadValidators } from '@iplab/ngx-file-upload';


@Component({
    selector: `app-root`,
    template: `
    <form [formGroup]="demoForm">
        <file-upload formControlName="files"></file-upload>
    </form>`
})
export class AppComponent {

    private filesControl = new FormControl(null, FileUploadValidators.filesLimit(2));
  
    public demoForm = new FormGroup({
        files: this.filesControl
    });

    constructor() {
    }
}
```


With angular template driven form you can use the following snippet: 
```shell
@Component({
    selector: `app-root`,
    template: `
    <form #demoForm="ngForm">
        <file-upload [(ngModel)]="uploadedFiles" name="files" fileslimit="2"></file-upload>
    </form>`
})
export class AppComponent {

    public uploadedFiles: Array<File> = [];
}
```

## Developing

### Built With: 
- Angular
- RxJS

### Setting up Dev

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

[Angular CLI](https://github.com/angular/angular-cli) must be installed before building @iplab/ngx-file-upload project.

```shell
npm install -g @angular/cli
```

```shell
git clone https://github.com/pIvan/file-upload.git
cd file-upload/
npm install
npm run start
```
Open "http://localhost:4200" in browser


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [link to tags on this repository](https://github.com/pIvan/file-upload/tags).

## Tests

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.


[Angular CLI](https://github.com/angular/angular-cli) must be installed before testing @iplab/ngx-file-upload project.

```shell
npm install -g @angular/cli
```


```shell
git clone https://github.com/pIvan/file-upload.git
cd file-upload/
npm install
npm run test
```

## Contributing

### Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our [contributing guide](https://github.com/pIvan/file-upload/blob/master/CONTRIBUTING.md) and then check out one of our [issues](https://github.com/pIvan/file-upload/issues).



## Licensing

@iplab/ngx-file-upload is freely distributable under the terms of the [MIT license](https://github.com/pIvan/file-upload/blob/master/LICENSE).