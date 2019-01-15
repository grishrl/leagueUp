import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DirectoryComponent } from './directory/directory.component';
import { AppRoutingModule } from './app.Routes';
import { NavComponent } from './nav/nav.component';
import { LoginComponent } from './login/login.component';
import { ResponseInterceptor } from './services/token-interceptor.service';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { InputFormMaterial } from './classes/aM-input-Import.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamProfileComponent } from './team-profile/team-profile.component';
import { DivisionComponent } from './division/division.component';
import { TeamDisplayComponent } from './team-display/team-display.component';
import { MembersDisplayComponent } from './members-display/members-display.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { OutreachEmailResponseComponent } from './outreach-email-response/outreach-email-response.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogViewComponent } from './blog-view/blog-view.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { NgxCroppieModule } from 'ngx-croppie';
import { LogoutComponent } from './logout/logout.component';
import { CreateTeamComponent } from './create-team/create-team.component';
import { ApproveMemberComponent } from './admin/approve-member/approve-member.component';
import { UserQuickViewComponent } from './admin/approve-member/user-quick-view/user-quick-view.component';
import { TeamQuickViewComponent } from './admin/approve-member/team-quick-view/team-quick-view.component';
import { ApproveMemberViewComponent } from './admin/approve-member/approve-member-view/approve-member-view.component';
import { DeleteMemberComponent } from './admin/delete-member/delete-member.component';
import { ManageSelectTeamComponent } from './admin/manage-team/manage-select-team.component';
import { TeamSearchComponent } from './team-search/team-search.component';
import { ChangeCaptainModalComponent } from './modal/change-captain-modal/change-captain-modal.component';
import { DivisionManagementComponent } from './admin/division-management/division-management.component';
import { AddTeamComponent } from './admin/division-management/add-team/add-team.component';
import { DivisionPropsComponent } from './admin/division-management/division-props/division-props.component';
import { RemoveTeamComponent } from './admin/division-management/remove-team/remove-team.component';
import { ScheduleViewComponent } from './schedule/schedule-view/schedule-view.component';
import { MatchScheduleComponent } from './schedule/match-schedule/match-schedule.component';
import { TeamScheduleComponent } from './schedule/team-schedule/team-schedule.component';
import { ReportingComponent } from './reporting/reporting.component';
import { ReportingDeckComponent } from './reporting/reporting-deck/reporting-deck.component';
import { ngfModule } from 'angular-file';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CasterDashboardComponent } from './caster-tools/caster-dashboard/caster-dashboard.component';
import { CasterInputsComponent } from './caster-tools/caster-dashboard/caster-inputs/caster-inputs.component';
import { MatchEditComponent } from './admin/match-management/match-edit/match-edit.component';
import { MatchManagementComponent } from './admin/match-management/match-management.component';
import { AdminAclManagementComponent } from './admin/admin-acl-management/admin-acl-management.component';
import { UpdateRolesComponent } from './admin/admin-acl-management/update-roles/update-roles.component';
import { StandingsViewComponent } from './standings-view/standings-view.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ManageTeamViewComponent } from './admin/manage-team/manage-team-view/manage-team-view.component';
import { DeleteConfrimModalComponent } from './modal/delete-confrim-modal/delete-confrim-modal.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { TimesAvailableComponent } from './times-available/times-available.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { LogsViewerComponent } from './admin/logs-viewer/logs-viewer.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventModalComponent } from './calendar-view/event-modal/event-modal.component';
import { EventLargeComponent } from './calendar-view/event-large/event-large.component';
import { SetDeadlineComponent } from './admin/match-management/set-deadline/set-deadline.component';
import { MatchViewComponent } from './match-view/match-view.component';
import { DropDownTimeComponent } from './times-available/drop-down-time/drop-down-time.component';
 

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DirectoryComponent,
    NavComponent,
    LoginComponent,
    ProfileEditComponent,
    TeamProfileComponent,
    DivisionComponent,
    TeamDisplayComponent,
    MembersDisplayComponent,
    UserSearchComponent,
    OutreachEmailResponseComponent,
    BlogListComponent,
    BlogViewComponent,
    AppFooterComponent,
    ImageUploadComponent,
    LogoutComponent,
    CreateTeamComponent,
    ApproveMemberComponent,
    UserQuickViewComponent,
    TeamQuickViewComponent,
    ApproveMemberViewComponent,
    DeleteMemberComponent,
    ManageSelectTeamComponent,
    TeamSearchComponent,
    ChangeCaptainModalComponent,
    DivisionManagementComponent,
    AddTeamComponent,
    DivisionPropsComponent,
    RemoveTeamComponent,
    ScheduleViewComponent,
    MatchScheduleComponent,
    TeamScheduleComponent,
    ReportingComponent,
    ReportingDeckComponent,
    DashboardComponent,
    CasterDashboardComponent,
    CasterInputsComponent,
    MatchManagementComponent,
    MatchEditComponent,
    AdminAclManagementComponent,
    UpdateRolesComponent,
    StandingsViewComponent,
    SnackbarComponent,
    ManageTeamViewComponent,
    DeleteConfrimModalComponent,
    NoAccessComponent,
    SessionTimeoutComponent,
    TimesAvailableComponent,
    QuestionnaireComponent,
    LogsViewerComponent,
    CalendarViewComponent,
    EventModalComponent,
    EventLargeComponent,
    SetDeadlineComponent,
    MatchViewComponent,
    DropDownTimeComponent
  ],
  entryComponents:[
    DeleteConfrimModalComponent,
    ChangeCaptainModalComponent,
    EventModalComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    InputFormMaterial,
    FormsModule,
    ReactiveFormsModule,
    NgxCroppieModule,
    ngfModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  providers: [
    {
    provide:HTTP_INTERCEPTORS,
    useClass:ResponseInterceptor,
    multi:true
    }
  ],
  bootstrap: [AppComponent]
})


export class AppModule { }
