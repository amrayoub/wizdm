import { Injectable, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { defineInjectable, inject} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ 
  providedIn: 'root', 
  useFactory: () => new WindowRef(inject<string>(PLATFORM_ID), window)
})
/**
 * Implements a simple service to inject the global window object accordin to angular DI model
 */
export class WindowRef {

  constructor(private platformId: string, public nativeWindow: any) {}

  private get isPlatformBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  get navigator(): any {
    return this.isPlatformBrowser ? this.nativeWindow.navigator : {};
  }

  public detectLanguage() : string {

    // Detects the preferred language according to the browser, whenever possible
    return (this.navigator.languages ? this.navigator.languages[0] : null) || 
            this.navigator.language || 
            this.navigator.browserLanguage || 
            this.navigator.userLanguage || 'en';

    // Returns the relevant part of the language code (ex: 'en-US' -> 'en')
    //return code.split('-')[0];
  }
}