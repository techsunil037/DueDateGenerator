import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import _ from 'lodash';
import * as moment from 'moment';
import * as holidaList from './holiday-list.json';
type OccuranceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
import { HolidayListType } from './HolidayList';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'DueDateGenerator';
  isResponsibilityChecked: boolean = false;
  viewdueDateStatus: boolean = false;

  dueDates = [];
  holidayList : HolidayListType;
  constructor(private http: HttpClient){

  }
  ngOnInit(){
    this.holidayList = {...(holidaList as any).default};
  }
  getDaysFromFrequencyType(frequencyType: OccuranceType){
    switch (frequencyType) {
      case 'daily':
        return 1;
      case 'weekly':
        return 7;
      default:
        break;
    }
  }
  isTheDayIsHoliday(date){
    if (
      _.filter(this.holidayList.weeklyOff, function(o){return o=== date}).length > 0 ||
      _.filter(this.holidayList.holiday, function(o){return o=== date}).length > 0
    ) {
      return true;
    }
    return false;
  }
  getNonHolidayDate(date){
    if(!this.isTheDayIsHoliday(date)){
      return date;
    }
    let nextDate = moment(date.setDate(date.getDate() + 1)).format('DD-MM-YYYY');
    this.getNonHolidayDate(nextDate);
  }
  getNextDateOfOccurance(date, frequencyNo){
    let requiredDate = moment(date.setDate(date.getDate() + frequencyNo)).format('DD-MM-YYYY');
    return this.getNonHolidayDate(requiredDate);
  }
  updateDueDates(frequencyType: OccuranceType, occuranceNumber?, startDate?) {
    this.dueDates = [];
    let occuranceNo = occuranceNumber? occuranceNumber : 10;
    let startingDate = startDate ? startDate : moment().format('DD-MM-YYYY');
    let frequencyDayNo = this.getDaysFromFrequencyType(frequencyType);

    let nonHolidayStartingDate = this.getNonHolidayDate(startingDate);
    let nextDateOfOccurance = nonHolidayStartingDate;
    for (let i = 0; i < occuranceNo; i++) {
      nextDateOfOccurance = this.getNextDateOfOccurance(nextDateOfOccurance, frequencyDayNo);
      this.dueDates.push(nextDateOfOccurance);
    }
  }
  viewDueDates(form: NgForm) {
    console.log('form', form.value);
    this.updateDueDates(form.value.frequency);
    this.viewdueDateStatus = true;
  }
  responsibilityChange(event) {
    console.log(this.isResponsibilityChecked);
  }
}
