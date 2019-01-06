import { Component, OnInit } from '@angular/core';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-questionaire',
  templateUrl: './questionaire.component.html',
  styleUrls: ['./questionaire.component.css']
})
export class QuestionaireComponent implements OnInit {

  constructor(private teamService: TeamService) {  }

  questions:any[]=[];
  ngOnInit() {
    this.teamService.getSysData('questionaire').subscribe(res=>{
      console.log(res);
      res.data.forEach(element => {
        let o = {
          'question':element,
          'response':''
        }
        this.questions.push(o);
      });
      // this.questions = res.data;
    },err=>{
      console.log('err ', err);
    })
  }

}
