import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commonPipe',
  pure: true
})
export class CommonPipePipe implements PipeTransform {

  transform(value: unknown, ...args: any[]): unknown {
    let runFn = args[0];
    if(args.length>0){
      return runFn(value, args[1]);
    }else{
      return runFn(value);
    }
  }

}
