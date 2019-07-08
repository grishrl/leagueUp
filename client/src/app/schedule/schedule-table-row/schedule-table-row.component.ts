import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-schedule-table-row',
  templateUrl: './schedule-table-row.component.html',
  styleUrls: ['./schedule-table-row.component.css']
})
export class ScheduleTableRowComponent implements OnInit {

  constructor(public teamServ:TeamService, public util:UtilitiesService) { }

  _match = {
    away:{
      teamName:'',
      logo:''
    },
    home: {
      teamName: '',
      logo: ''
    },
    scheduledTime:{
      startTime:''
    },
    casterName:'',
    casterUrl:''
  };

  @Input() set match(val){
    if(val){
      console.log('val ' ,val)
      this._match = val;
    }

  }

  ngOnInit() {
  }

}
