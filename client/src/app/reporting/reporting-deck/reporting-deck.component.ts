import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import {merge, forEach as _forEach } from 'lodash';
import { Match } from 'src/app/classes/match.class';

@Component({
  selector: 'app-reporting-deck',
  templateUrl: './reporting-deck.component.html',
  styleUrls: ['./reporting-deck.component.css']
})
export class ReportingDeckComponent implements OnInit {

  hideButton:boolean=false;


  recMatch = new Match();

  totalGames = 3;
  requiredScore:number
  offScore:number

  uploading = false;

  homeTeam
  awayTeam
  homeTeamPlayer
  awayTeamPlayer
  allPlayers = [];

  @Input() set match(match){
    if(match!=null && match != undefined){


      merge( this.recMatch, match);

      let teams = [];
      teams.push(match.away.teamName);
      teams.push(match.home.teamName);
      this.team.getTeam(match.home.teamName).subscribe(
        res=>{
          this.homeTeam = res;

          this.allPlayers = this.allPlayers.concat(this.homeTeam.teamMembers);
        },
        err=>{
          console.log(err);
        }
      )
      this.team.getTeam(match.away.teamName).subscribe(
        res => {
          this.awayTeam = res;

          this.allPlayers = this.allPlayers.concat(this.awayTeam.teamMembers);
        },
        err => {
          console.log(err);
        }
      )
      if(match.boX){
        this.totalGames = match.boX;


      }
      this.requiredScore = (this.totalGames + 1) / 2;
      this.offScore = this.totalGames - this.requiredScore;

    }

    if(this.recMatch.other != null && this.recMatch.mapBans != undefined){
      let obj = this.recMatch.other;
      _forEach(obj, (value, key)=>{
        if( key != 'homeTeamPlayer' && key != 'awayTeamPlayer'){
          this.games[key]=value;
        }
      });
    }

    if(this.recMatch.mapBans != null && this.recMatch.mapBans != undefined){
      this.mapBans = this.recMatch.mapBans;
    }

    if(this.recMatch.reported){
      this.hideButton = true;


    }

  }

  constructor(private scheduleService: ScheduleService, private util: UtilitiesService, public team:TeamService) { }

  maps = {
  ControlPoints: 'Sky Temple',
  TowersOfDoom: 'Towers of Doom',
  // HauntedMines: 'Haunted Mines',
  BattlefieldOfEternity: 'Battlefield of Eternity',
  // BlackheartsBay: "Blackheart's Bay",
  CursedHollow: 'Cursed Hollow',
  DragonShire: 'Dragon Shire',
  // HauntedWoods: 'Garden of Terror',
  Shrines: 'Infernal Shrines',
  Crypts: 'Tomb of the Spider Queen',
  Volskaya: 'Volskaya Foundry',
  // 'Warhead Junction': 'Warhead Junction',   // blizz why
  BraxisHoldout: 'Braxis Holdout',
  // Hanamura: 'Hanamura',
  AlteracPass: 'Alterac Pass'
};

returnMaps(ban1, ban2, ban3){
  let selectable = [];

  _forEach(this.maps, (map)=>{
    if(ban1 != map && ban2 != map && ban3 != map){
      selectable.push(map);
    }
  });

  return selectable;
}

removeBan(hero, arr){
  let ind = arr.indexOf(hero);
  if(ind!=-1){
    arr = arr.splice(ind, 1);
  }
}

  mapBans = {
    awayOne:'',
    homeOne:'',
    awayTwo: '',
    homeTwo: ''
  };

  games = {};
  showAdd:boolean = true;

  addGame(){
    let keys = Object.keys(this.games);
    if(keys.length<this.totalGames){
      this.games[(keys.length + 1).toString()] = {
        homeBans: [],
        awayBans: [],
        winner: '',
        replay: null,
        tmp: {}
      };
    }

    if(keys.length>=this.totalGames-1){
      this.showAdd=false;
    }

  }



addBan(hero, arr){
  arr.push(hero);
  hero=null;
}

resetReplay(game){
  game.value.replay=null;
}

showReportButton(){
  let show = true;
  if(this.recMatch.reported){
    show = false;
  }else if(this.uploading){
    show = false;
  }else{
    show = !this.disableSubmit();
  }
  return show;
}

  removeGame(game, games){
    delete games[game];
  }



  ngOnInit() {
    // this.util.markFormGroupTouched(this.reportForm);
  }

  initGetTeamsInfo(teams){
    this.team.getTeams(teams).subscribe(
      res=>{
        console.log(res);
      },
      err=>{
        console.log(err);
      }
    )
  }


  thirdReplayRequired:boolean = false;




  scoreError:string ='';
  disableSubmit():boolean{
    let disable = true;
    let homeScore = 0;
    let awayScore = 0;
    _forEach(this.games, (game)=>{
      if(game['winner'] == 'home'){
        homeScore +=1;
      }else if(game['winner']=='away'){
        awayScore +=1;
      }
    });

    if(homeScore == this.requiredScore){
      if (awayScore <= this.offScore){
        disable = false;
        this.scoreError = '';
      }else{
        disable = true;
        this.scoreError = 'Invalid Score';
      }
    } else if (homeScore == this.offScore){
      if (awayScore == this.requiredScore){
        disable = false;
        this.scoreError = '';
      }else{
        disable = true;
        this.scoreError = 'Invalid Score';
      }
    }else if(homeScore == 0){
      if (awayScore == this.requiredScore){
        disable = false;
        this.scoreError = '';
      }else{
        disable = true;
        this.scoreError = 'Invalid Score';
      }
    }

    // if (this.thirdReplayRequired) {
    //   if (this.homeScore != null && this.awayScore != null && this.replay1 != null && this.replay2 != null && this.replay3 != null) {
    //     disable = false;
    //   }else{
    //     disable = true;
    //   }
    // } else {
    //   if (this.homeScore != null && this.awayScore != null && this.replay1 != null && this.replay2 != null) {
    //     disable = false;
    //   }else{
    //     disable = true;
    //   }
    // }

    return disable;
  }

  show:boolean=false;

  showHide(){
    this.show = !this.show;
  }

  report() {

    let submittable = true;

    let report = {
      matchId:this.recMatch.matchId,
      homeTeamScore:0,
      awayTeamScore:0
    };
    let otherData = {};

    if(!this.homeTeamPlayer){
      submittable = false;
      alert('Home team player is not selected, can not submit.');
    }else{
      otherData['homeTeamPlayer'] = this.homeTeamPlayer;
    }
    if (!this.awayTeamPlayer) {
      submittable = false;
      alert('Away team player is not selected, can not submit.');
    }else{
      otherData['awayTeamPlayer'] = this.awayTeamPlayer;
    }
    let keys = Object.keys(this.games);
    keys.forEach(key => {
      let game = this.games[key];
      if(game.winner == 'home'){
        report.homeTeamScore+=1;
      }else if(game.winner == 'away'){
        report.awayTeamScore+=1;
      }else{
        submittable = false;
        alert('Game ' + key + ' winner is not selected, can not submit.');
      }

      if (game.replay == null && game.replay == undefined){
          submittable = false;
          alert('Game ' + key + ' replay is not attached, can not submit.');
        }

      report['replay'+key.toString()]=game.replay;

      let gamenum = key.toString();
      //hero bans
      // if(game.homeBans.length<3){
      //   alert('Game ' + key + ' home bans is not filled, can not submit.');
      //   submittable = false
      // }
      // if (game.awayBans.length < 3) {
      //   alert('Game ' + key + ' away bans is not filled, can not submit.');
      //   submittable = false
      // }
      otherData[gamenum]={

        winner : game.winner
      }
    });

    if (this.mapBans.awayOne == ''){
      submittable = false;
      alert('This match\'s away map ban not filled out, can not submit.');
    }

    if (this.mapBans.homeOne == '') {
      submittable = false;
      alert('This match\'s home map ban not filled out, can not submit.');
    }

    if (this.mapBans.awayTwo == '') {
      submittable = false;
      alert('This match\'s away map ban not filled out, can not submit.');
    }

    if (this.mapBans.homeTwo == '') {
      submittable = false;
      alert('This match\'s home map ban not filled out, can not submit.');
    }


    if (report.homeTeamScore == 1 && report.awayTeamScore == 1 || report.awayTeamScore == 1 && report.homeTeamScore == 1){
      submittable = false;
      alert('This out come is not allowed, matches must end 2-0 or 2-1');
    }

    report['otherDetails']=JSON.stringify(otherData);
    report['mapBans']=JSON.stringify(this.mapBans);


    if(submittable){
      this.uploading=true;
      this.scheduleService.reportMatch(report).subscribe( res=>{
        this.uploading=false;
        this.recMatch.reported = true;
      },
      err=>{
        this.uploading = false
        console.log(err);
      })
    }

  }

}
 // depricated will be removed if this goes well
  // returnFilteredHeroes(game){
  //   let disArr = [];
  //   let currentArr = game.value.homeBans.concat(game.value.awayBans);
  //   let keys = Object.keys(this.heroes);
  //   keys.forEach(element=>{
  //     let heroName = this.heroes[element];
  //     if(heroName == "Missed"){
  //       disArr.push(this.heroes[element]);
  //     } else if(currentArr.indexOf(heroName)==-1){
  //       disArr.push(this.heroes[element]);
  //     }
  //   });
  //   return disArr;
  // }

  // heroes = {
  //   "miss":"Missed",
  //   "Abat": "Abathur",
  //   "Alar": "Alarak",
  //   "Alex": "Alexstrasza",
  //   "HANA": "Ana",
  //   "Anub": "Anub'arak",
  //   "Arts": "Artanis",
  //   "Arth": "Arthas",
  //   "Auri": "Auriel",
  //   "Azmo": "Azmodan",
  //   "Fire": "Blaze",
  //   "Faer": "Brightwing",
  //   "Amaz": "Cassia",
  //   "Chen": "Chen",
  //   "CCho": "Cho",
  //   "Chro": "Chromie",
  //   "DECK": "Deckard",
  //   "Deha": "Dehaka",
  //   "Diab": "Diablo",
  //   "DVA0": "D.Va",
  //   "L90E": "E.T.C.",
  //   "Fals": "Falstad",
  //   "FENX": "Fenix",
  //   "Gall": "Gall",
  //   "Garr": "Garrosh",
  //   "Tink": "Gazlowe",
  //   "Genj": "Genji",
  //   "Genn": "Greymane",
  //   "Guld": "Gul'dan",
  //   "Hanz": "Hanzo",
  //   "Illi": "Illidan",
  //   "IMP": "Imperius",
  //   "Jain": "Jaina",
  //   "Crus": "Johanna",
  //   "Junk": "Junkrat",
  //   "Kael": "Kael'thas",
  //   "KelT": "Kel'Thuzad",
  //   "Kerr": "Kerrigan",
  //   "Monk": "Kharazim",
  //   "Leor": "Leoric",
  //   "LiLi": "Li Li",
  //   "Wiza": "Li-Ming",
  //   "Medi": "Lt. Morales",
  //   "Luci": "Lucio",
  //   "Drya": "Lunara",
  //   "Maie": "Maiev",
  //   "Malf": "Malfurion",
  //   "Malg":"Mal'Ganis",
  //   "MALT": "Malthael",
  //   "Mdvh": "Medivh",
  //   "MEP":"Mephisto",
  //   "Mura": "Muradin",
  //   "Murk": "Murky",
  //   "Witc": "Nazeebo",
  //   "Nova": "Nova",
  //   "Oprh":"Orphea",
  //   "Prob": "Probius",
  //   "Ragn": "Ragnaros",
  //   "Rayn": "Raynor",
  //   "Rehg": "Rehgar",
  //   "Rexx": "Rexxar",
  //   "Samu": "Samuro",
  //   "Sgth": "Sgt. Hammer",
  //   "Barb": "Sonya",
  //   "Stit": "Stitches",
  //   "STUK": "Stukov",
  //   "Sylv": "Sylvanas",
  //   "Tass": "Tassadar",
  //   "Butc": "The Butcher",
  //   "Lost": "The Lost Vikings",
  //   "Thra": "Thrall",
  //   "Tra0": "Tracer",
  //   "Tych": "Tychus",
  //   "Tyrl": "Tyrael",
  //   "Tyrd": "Tyrande",
  //   "Uthe": "Uther",
  //   "VALE": "Valeera",
  //   "Demo": "Valla",
  //   "Vari": "Varian",
  //   "Whit":"Whitemane",
  //   "Necr": "Xul",
  //   "YREL": "Yrel",
  //   "Zaga": "Zagara",
  //   "Zary": "Zarya",
  //   "Zera": "Zeratul",
  //   "ZULJ": "Zul'jin"
  // }

    // awayScoreControl = new FormControl('', [
  //   Validators.required
  // ]);
  // homeScoreControl = new FormControl('', [
  //   Validators.required
  // ]);
  // replay1Control = new FormControl('', [
  //   Validators.required
  // ]);
  // replay2Control = new FormControl('', [
  //   Validators.required
  // ]);
  // replay3Control = new FormControl('', [
  //   Validators.required
  // ]);

  // reportForm = new FormGroup({
  //   awayScore: this.awayScoreControl,
  //   homeScore: this.homeScoreControl,
  //   replay1: this.replay1Control,
  //   replay2: this.replay2Control
  // })

    // formControlsDisable(){
  //   this.awayScoreControl.disable();
  //   this.homeScoreControl.disable();
  //   this.replay1Control.disable();
  //   this.replay2Control.disable();
  // }
    // recMatch = {
  //   away:{logo:null,teamName:''},
  //   home: { logo: null, teamName: ''},
  //   mapBans: {
  //     awayOne: '',
  //     homeOne: '',
  //     awayTwo: '',
  //     homeTwo: ''
  //   },
  //   other:{},
  //   reported:false,
  //   replays:{},
  //   matchId:''
  // }

  // scoreSelected(changed) {
  // //  if(this.homeScore + this.awayScore > 2){

  // //  }else{

  // //  }
  // }
