import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from '../services/team.service';
import { utils } from 'protractor';
import { merge } from 'lodash';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {

  passedTeam: any = {};
  responses: any = {};
  pickedMaps: any[] = [];

  constructor(private teamService: TeamService, private util:UtilitiesService) {  }
  
  @Input() set team(_team){
    if(_team != undefined || _team != null){
      this.passedTeam = _team;
      if (_team.questionnaire != null && _team.questionnaire != undefined){
        this.responses = _team.questionnaire
        if (_team.questionnaire.pickedMaps != null && _team.questionnaire.pickedMaps != undefined){
          this.pickedMaps = _team.questionnaire.pickedMaps
        }
      } 
    }
  }

  maps = {
    ControlPoints: 'Sky Temple',
    TowersOfDoom: 'Towers of Doom',
    BattlefieldOfEternity: 'Battlefield of Eternity',
    CursedHollow: 'Cursed Hollow',
    DragonShire: 'Dragon Shire',
    HauntedWoods: 'Garden of Terror',
    Shrines: 'Infernal Shrines',
    Crypts: 'Tomb of the Spider Queen',
    Volskaya: 'Volskaya Foundry',
    'Warhead Junction': 'Warhead Junction',
    BraxisHoldout: 'Braxis Holdout',
    Hanamura: 'Hanamura',
    AlteracPass: 'Alterac Pass'
  };

  
  selectedMap:string;
  
  

  checkTeamMates(){
    // if(this.passedTeam && this.passedTeam.teamMembers){
    //   if (this.passedTeam.teamMembers.length >= 5) {
    //     return true;
    //   }
    // }
    
    // return false;
    return true;
  }


  completeRegistration(){
    if (this.checkTeamMates() && this.checkQuestionnaire() && this.pickedMaps.length == 9){
      this.responses['pickedMaps'] = this.pickedMaps;
      this.responses['registered']=true;
      this.teamService.saveTeamQuestionnaire(this.passedTeam.teamName_lower, this.responses).subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      })
    }else{
      alert('you tricked me');
    }
  }

  checkQuestionnaire(){
      if(this.responses.lastSeason=='yes'){

        return this.util.returnBoolByPath(this.responses, 'eastWest') &&
          this.util.returnBoolByPath(this.responses, 'oldTeam') && 
          this.util.returnBoolByPath(this.responses, 'oldDivision') &&
          this.util.returnBoolByPath(this.responses, 'returningPlayers') &&
          this.util.returnBoolByPath(this.responses, 'returningPlayersDiv') &&
          this.util.returnBoolByPath(this.responses, 'otherLeagues');

      } else if (this.responses.lastSeason == 'no'){

        return this.util.returnBoolByPath(this.responses, 'eastWest') &&
          this.util.returnBoolByPath(this.responses, 'otherLeagues') &&
          this.util.returnBoolByPath(this.responses, 'skillGuess')
      
      }else{
        return false;
      }
  }

  checkValid(){
    return this.checkTeamMates() && this.checkQuestionnaire() && this.pickedMaps.length==9;
  }

  remove(map){
   let ind = this.pickedMaps.indexOf(map);
   this.pickedMaps.splice(ind, 1);
  }

  filterMaps(){
    let returnArray = [];
    let keys = Object.keys(this.maps);
    keys.forEach(key=>{
      if(this.pickedMaps.indexOf(this.maps[key])==-1){
        returnArray.push(this.maps[key]);
      }
    });
    return returnArray;
  }

  save(){
    this.responses['pickedMaps']=this.pickedMaps;
    this.teamService.saveTeamQuestionnaire(this.passedTeam.teamName_lower,this.responses).subscribe(res=>{
      console.log(res);
    },err=>{
      console.log(err);
    })
  }

  addMap(map){
    this.pickedMaps.push(map);
  }


  ngOnInit() {

  }

}
