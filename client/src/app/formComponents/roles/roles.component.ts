import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  constructor() { }

  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  displayText: string = "Player Roles:";

  @Input() set customDisplayText(val) {
    this.displayText = val;
  }

  editText: string = "Select Roles:";

  @Input() set customEditText(val) {
    this.editText = val;
  }

  roleValues = {
    tank: false,
    'meleeassassin': false,
    'rangedassassin': false,
    offlane: false,
    healer: false,
    support:false,
    flex: false
  }

  selectRole(role){
    this.roleValues[role]=!this.roleValues[role];
  }

  @Output()
  rolesChange = new EventEmitter();

  @Input()
  get roles() {
    return this.roleValues;
  }

  set roles(val) {
    this.roleValues = val;
    this.rolesChange.emit(this.roleValues);
  }

  ngOnInit() {
  }

}
