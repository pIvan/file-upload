import {FileUploadService} from './file-upload.service';
import {inject, TestBed} from '@angular/core/testing';
import {Renderer2} from '@angular/core';

describe('FileUploadService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileUploadService, Renderer2]
    });
  });

  it('should be initialized', inject([FileUploadService], (fileUploadService: FileUploadService) => {
    expect(fileUploadService.parseSize('10MB')).toBe(10485760);
    expect(fileUploadService.parseSize('10KB')).toBe(10240);
    expect(fileUploadService.parseSize('1024')).toBe(1024);
    expect(fileUploadService.parseSize(10233)).toBe(10233);
  }));

});
