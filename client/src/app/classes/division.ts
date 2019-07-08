export class Division {
  sorting:number;
  displayName:string;
  divisionName:string;
  divisionCoast:string;
  divisionConcat:string;
  maxMMR:number;
  minMMR:number
  teams:Array<string>;
  lastTouched:string;
  public:boolean;
  cupDiv:boolean;
  participants:Array<string>;
  tournaments: Array<string>;
  moderator:string;

  constructor (){
    this.sorting=null;
    this.displayName=null;
    this.divisionName=null;
    this.divisionCoast=null;
    this.divisionConcat=null;
    this.maxMMR=null;
    this.minMMR=null;
    this.teams=[];
    this.lastTouched=null;
    this.public=null;
    this.cupDiv=false;
    this.participants=[];
    this.tournaments=[];
    this.moderator=null;
  }
}
