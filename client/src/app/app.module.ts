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
import { DialogOverviewExampleDialog } from './profile-edit/profile-edit.component';
import { DeleteMemberComponent } from './admin/delete-member/delete-member.component';
import { DeleteTeamComponent } from './admin/delete-team/delete-team.component';
import { TeamSearchComponent } from './team-search/team-search.component';
import { ChangeCaptainModalComponent } from './modal/change-captain-modal/change-captain-modal.component';
import { ChangeCaptainComponent } from './admin/change-captain/change-captain.component';
import { DivisionManagementComponent } from './admin/division-management/division-management.component';
import { AddTeamComponent } from './admin/division-management/add-team/add-team.component';
import { DivisionPropsComponent } from './admin/division-management/division-props/division-props.component';
import { RemoveTeamComponent } from './admin/division-management/remove-team/remove-team.component';
import { SheduleViewComponent } from './schedule/shedule-view/shedule-view.component';
import { MatchScheduleComponent } from './schedule/match-schedule/match-schedule.component';
import { TeamScheduleComponent } from './schedule/team-schedule/team-schedule.component';
import { ReportingComponent } from './reporting/reporting.component';
import { ReportingDeckComponent } from './reporting/reporting-deck/reporting-deck.component';
import { ngfModule } from 'angular-file';

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
    DialogOverviewExampleDialog,
    DeleteMemberComponent,
    DeleteTeamComponent,
    TeamSearchComponent,
    ChangeCaptainModalComponent,
    ChangeCaptainComponent,
    DivisionManagementComponent,
    AddTeamComponent,
    DivisionPropsComponent,
    RemoveTeamComponent,
    SheduleViewComponent,
    MatchScheduleComponent,
    TeamScheduleComponent,
    ReportingComponent,
    ReportingDeckComponent
  ],
  entryComponents:[
    DialogOverviewExampleDialog,
    ChangeCaptainModalComponent
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
    ngfModule
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
