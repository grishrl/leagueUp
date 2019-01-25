import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpecialCharactersService {

  constructor() { }

  reserveCharacterMap = [

    { "char": "(", "replace": "-open-parentheses-" },
    { "char": ")", "replace": "-close-parentheses-" },
    { "char":"{", "replace":"-open-curl-bracket-" },
    { "char": "}", "replace": "-close-curl-bracket-" },
    { "char": ";", "replace": "-semicolon-" },
    { "char": "=", "replace": "-equals-" },
    { "char": "+", "replace": "-plus-" },
    { "char": "/", "replace": "-forwardslash-" },
    { "char": "?", "replace": "-question-" },
    { "char": "#", "replace": "-number-" },
    { "char": "[", "replace": "-open-bracket-" },
    { "char": "]", "replace": "-close-bracket-" },
    { "char": "%", "replace": "-percent-" },
    { "char": "^", "replace": "-caret-" },
    { "char": "`", "replace": "-backtick-" },
    { "char": "\\", "replace": "-backslash-" },
    {"char":" ", "replace":"_"},
    { "char": "|", "replace": "-pipe-" },

  ]

  reverse(segment){
    this.reserveCharacterMap.forEach(char=>{

      let regex =  char.replace ;
      segment = segment.replace(new RegExp(regex, 'gi'), char.char);

    });
    return segment;
  }

  mapIndexOfReplace(replace){
    let ind = -1;
    this.reserveCharacterMap.forEach((map, index) => {
      if (map.replace === replace) {
        ind = index;
      }
    })
    return ind;
  }

  replace(char){
    let ind = this.mapIndexOf(char);
      if(ind>-1){
        return this.reserveCharacterMap[ind].replace;
      }else{
        return char;
      }
  }

  mapIndexOf(char):number{
    let ind = -1;
    this.reserveCharacterMap.forEach((map, index)=>{
      if(map.char === char){
          ind = index;
      }
    })
    return ind;
  }
}
