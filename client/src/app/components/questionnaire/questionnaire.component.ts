import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { merge, forEach as _forEach, includes as _includes } from 'lodash';
import { UtilitiesService } from '../../services/utilities.service';
import { AuthService } from '../../services/auth.service';
import { TimeserviceService } from '../../services/timeservice.service';
import { PlayerRankService } from '../../services/player-rank.service';


@Component({
  selector: "app-questionnaire",
  templateUrl: "./questionnaire.component.html",
  styleUrls: ["./questionnaire.component.css"],
})
export class QuestionnaireComponent implements OnInit {
  passedTeam: any = {};
  responses: any = {};
  pickedMaps: any[] = [];
  registrationOpen = false;
  seasonNumber;

  constructor(
    private teamService: TeamService,
    private util: UtilitiesService,
    public auth: AuthService,
    private timeService: TimeserviceService,
    private playerRank: PlayerRankService
  ) {}

  @Input() source;

  @Input() set team(_team) {
    if (_team != undefined || _team != null) {
      this.passedTeam = _team;

      //timing must be right to have team members; so we dont get false red X
          if (this.passedTeam.teamMembers && this.passedTeam.teamMembers.length>0){
            this.playerRank
              .getReportingCount(this.passedTeam.teamMembers)
              .subscribe(
                (res) => {
                  if (res.reported == this.passedTeam.teamMembers.length) {
                    this.ranksVerified = true;
                  }
                },
                (err) => {
                  console.warn(err);
                }
              );
          }

      if (_team.questionnaire != null && _team.questionnaire != undefined) {
        this.responses = _team.questionnaire;
        if (
          _team.questionnaire.pickedMaps != null &&
          _team.questionnaire.pickedMaps != undefined
        ) {
          this.pickedMaps = _team.questionnaire.pickedMaps;
        }
      }
    }
  }

  maps = {
    ControlPoints: "Sky Temple",
    TowersOfDoom: "Towers of Doom",
    BattlefieldOfEternity: "Battlefield of Eternity",
    CursedHollow: "Cursed Hollow",
    DragonShire: "Dragon Shire",
    HauntedWoods: "Garden of Terror",
    Shrines: "Infernal Shrines",
    Crypts: "Tomb of the Spider Queen",
    Volskaya: "Volskaya Foundry",
    "Warhead Junction": "Warhead Junction",
    BraxisHoldout: "Braxis Holdout",
    Hanamura: "Hanamura Temple",
    AlteracPass: "Alterac Pass",
  };

  selectedMap: string;

  checkTeamMates() {
    if (this.passedTeam && this.passedTeam.teamMembers) {
      if (this.passedTeam.teamMembers.length >= 5) {
        return true;
      }
    }
    return false;
  }

  completeRegistration() {
    //&& this.pickedMaps.length == 9
    if (this.checkTeamMates() && this.checkQuestionnaire()) {
      // this.responses["pickedMaps"] = this.pickedMaps;
      this.responses["registered"] = true;
      this.teamService
        .saveTeamQuestionnaire(this.passedTeam.teamName_lower, this.responses)
        .subscribe(
          (res) => {},
          (err) => {
            console.warn(err);
          }
        );
    } else {
      alert("you tricked me");
    }
  }

  checkQuestionnaire() {
    if (this.responses.lastSeason == "yes") {
      return (
        this.util.returnBoolByPath(this.responses, "eastWest") &&
        this.util.returnBoolByPath(this.responses, "compLevel") &&
        this.util.returnBoolByPath(this.responses, "oldTeam") &&
        this.util.returnBoolByPath(this.responses, "oldDivision") &&
        this.util.returnBoolByPath(this.responses, "returningPlayers") &&
        this.util.returnBoolByPath(this.responses, "returningPlayersDiv")
      );
    } else if (this.responses.lastSeason == "no") {
      return (
        this.util.returnBoolByPath(this.responses, "eastWest") &&
        this.util.returnBoolByPath(this.responses, "compLevel") &&
        this.util.returnBoolByPath(this.responses, "skillGuess")
      );
    } else {
      return false;
    }
  }

  showRegisteredQuestionnaire() {
    if (this.source) {
      if (this.source == "admin") {
        return true;
      }
    } else if (this.auth.getUser() == this.passedTeam.captain) {
      return !this.responses["registered"];
    } else {
      return false;
    }
  }

  checkValid() {
    //this.pickedMaps.length == 9
    return (
      this.checkTeamMates() &&
      this.checkQuestionnaire() &&
      this.responses.acknowledge == true &&
      this.ranksVerified
    );
  }

  remove(map) {
    let ind = this.pickedMaps.indexOf(map);
    this.pickedMaps.splice(ind, 1);
  }

  filterMaps() {
    let returnArray = [];

    _forEach(this.maps, (value, key) => {
      if (!_includes(this.pickedMaps, value)) {
        returnArray.push(this.maps[key]);
      }
    });
    return returnArray;
  }

  save() {
    // this.responses['pickedMaps']=this.pickedMaps;
    this.teamService
      .saveTeamQuestionnaire(this.passedTeam.teamName_lower, this.responses)
      .subscribe(
        (res) => {},
        (err) => {
          console.warn(err);
        }
      );
  }

  addMap(map) {
    this.pickedMaps.push(map);
  }

  ranksVerified = false;

  ngOnInit() {
    this.timeService.getSesasonInfo().subscribe((res) => {
      this.seasonNumber = res["value"];
      if (this.source == "admin") {
        this.registrationOpen = true;
      } else {
        this.registrationOpen = res["data"].registrationOpen;
      }
    });
  }
}
