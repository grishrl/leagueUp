import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-storm-league',
  templateUrl: './storm-league.component.html',
  styleUrls: ['./storm-league.component.css']
})
export class StormLeagueComponent implements OnInit {

  constructor() { }

  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Unranked'];
  hlDivision = [1, 2, 3, 4, 5];
  assetLookup = {
    'Bronze':'bronzeMedal.png',
    'Silver':'silverMedal.png',
    'Gold':'goldMedal.png',
    'Platinum':'platinumMedal.png',
    'Diamond':'diamondMedal.png',
    'Master':'masterMedal.png',
    'Grand Master':'grandMasterMedal.png'
  }

  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  divisionValue: string;

  @Output()
  divisionChange = new EventEmitter();

  @Input()
  get division() {
    return this.divisionValue;
  }

  set division(val) {
    this.divisionValue = val;
    this.divisionChange.emit(this.divisionValue);
  }

  rankValue: string;

  @Output()
  rankChange = new EventEmitter();

  @Input()
  get rank() {
    return this.divisionValue;
  }

  set rank(val) {
    this.rankValue = val;
    this.rankChange.emit(this.rankValue);
  }

  modifyForm(metal) {
    if (metal == 'Unranked') {
      this.heroeLeagueRankControl.setErrors(null);
    } else {

    }
  }

  heroeLeagueDivisionControl = new FormControl({ value: '', disabled: true }, [
    // Validators.required
  ]);

  heroeLeagueRankControl = new FormControl({ value: '', disabled: true }, [
    // Validators.required
  ]);

  ngOnInit() {
  }

}
