import { Injectable } from '@angular/core';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: "root",
})
export class PlayerRankService {
  constructor(private http: HttpServiceService) {}

  getRequiredRanks() {
    let url = "playerrank/get/required";
    const payload = {};
    return this.http.httpGet(url, payload);
  }

  upsertRequiredRanks(reqRanks) {
    let url = "playerrank/upsert";
    const payload = { requiredRanks: reqRanks };
    return this.http.httpPost(url, payload, true);
  }

  uploadRankImage(payload) {
    /** PAYLOAD
     * {
     * logo:,
     * seasonInf:{
     *  year:,
     *  season:
     * }
     * }
     */
    let url = "playerrank/upload";
    return this.http.httpPost(url, payload, true);
  }

  ///playerrank/capt/upload
  captUploadRankImage(payload) {
    /** PAYLOAD
     * {
     * logo:,
     * seasonInf:{
     *  year:,
     *  season:
     * }
     * }
     */
    let url = "playerrank/capt/upload";
    return this.http.httpPost(url, payload, true);
  }

  adminActionRank(payload){
    let url = 'admin/approveRank';
    return this.http.httpPost(url, payload, true);
  }

  getReportingCount(members){
    let url = "playerrank/usersReporting";
    const payload = {
      members
    }
    return this.http.httpPost(url, payload, false);
  }
}
