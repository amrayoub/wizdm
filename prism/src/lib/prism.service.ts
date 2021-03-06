import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { default as prismjs, Token, Grammar } from 'prismjs';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';

/** Prism Language Modules Token */
export const LANGUAGE_MODULES = new InjectionToken<PrismLanguage[]>('wizdm.prism.language.modules');

/** List of language modules */
export type PrismLanguages = PrismLanguage[];

/** Language loader */
export interface PrismLanguage {
  name: string|string[]|'*'; 
  load: (name: string) => Promise<any>;
}

/** @dynamic - tells ngc to ignore the error on type PrismLanguages generated by strictEmitMetadata: true */
@Injectable()
export class PrismService {

  constructor(@Optional() @Inject(LANGUAGE_MODULES) private languages: PrismLanguages) {}

  /** Tokenizes the input source by loading the grammar dynamically whenever necessary */
  public tokenize(source: string, language: string): Observable<(string|Token)[]> {

    // Skips invalid source
    if(!source) { return of(['']); }
    
    // Loads the grammar and tokenizes the source accordingly
    return this.loadGrammar(language).pipe(
      map( grammar => !!grammar ? prismjs.tokenize(source, grammar) : [source] )
    );
  }

  /** Loads the Grammar */
  private loadGrammar(language: string): Observable<Grammar> {

    // No language, no grammar...
    if(!language) { return of(undefined); }

    // Verifies the grammar has been already loaded
    if(prismjs.languages[language]) { return of(prismjs.languages[language]); }

    // Attempts to load the grammar dynamically
    const loader = this.languages && this.languages.find( ({ name }) => {

      // Matches the requested language
      return Array.isArray(name) ? (name.indexOf(language) >= 0) : (name === language || name === '*');
    });

    // Abort when no loader is found
    if(!loader) { return of(undefined); }

    // Resolves the grammar by loading the module
    return from(loader.load(language)).pipe( map( () => prismjs.languages[language] ) );
  }
}