import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-marketplace',
  templateUrl: './user-marketplace.component.html',
  styleUrls: ['./user-marketplace.component.css']
})
export class UserMarketplaceComponent implements OnInit {

  constructor() { }

  availability = {
    "monday": {
      "available": false,
      "startTime": null,
      "endTime": null
    },
    "tuesday": {
      "available": false,
      "startTime": null,
      "endTime": null
    },
    "wednesday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "thursday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "friday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "saturday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "sunday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
  };

  localResults = [];
  hasSearched = false;
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]
  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Unranked'];
  selectedDivision
  searchParameters = {
    "divisions": [],
    "lowerMMR": null,
    "upperMMR": null,
    "competitiveLevel": null,
    "rolesNeeded": {
      "tank": false,
      "meleeassassin": false,
      "rangedassassin": false,
      "support": false,
      "offlane": false,
      "flex": false
    },
    "customTime": null,
    "customtimeZone": null,
    "customAvail": Object.assign({}, this.availability),
    "timezone": null
  }

  ngOnInit() {
  }


  selected(div) {
    this.searchParameters.divisions.push(div);
  }

}
