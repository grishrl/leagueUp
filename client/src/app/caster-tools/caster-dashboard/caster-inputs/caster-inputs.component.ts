import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-caster-inputs',
  templateUrl: './caster-inputs.component.html',
  styleUrls: ['./caster-inputs.component.css']
})
export class CasterInputsComponent implements OnInit {

  constructor(private scheduleService:ScheduleService) { }

  hideForm = true;
  _id:string;

  @Input() set matchId(id) {
    if (id != null && id != undefined) {
      this._id = id;
    }
  }

  casterNameControl = new FormControl('', [
    Validators.required
  ]);
  casterUrlControl = new FormControl('', [
    Validators.required
  ]);
  casterInputForm = new FormGroup({
    name: this.casterNameControl,
    url: this.casterUrlControl,

  })
  
  ngOnInit() {
  }

  saveCasterInfo(casterName, casterUrl) {
    let payload = {};
    if (this._id != null && this._id != undefined){
      payload['matchId'] = this._id;
      if (casterName != null && casterName != undefined) {
        payload['casterName'] = casterName;
        if (casterUrl != null && casterUrl != undefined) {
          payload['casterUrl'] = casterUrl;
          this.scheduleService.addCaster(payload).subscribe(
            (res)=>{
              
            },
            (err)=>{

            }
          )
        }else{
          alert('Null Caster Url');
        }
      }else{
        alert('Null Caster Name');
      }
    }else{
      alert('Null MatchId');
    }
    
  }
}
