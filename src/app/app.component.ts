import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import _ from 'lodash';
import * as moment from 'moment';
import * as holidaList from './holiday-list.json';
type OccuranceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
import Swal from 'sweetalert2';
import { HolidayListType } from './HolidayList';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
  holidayList: HolidayListType;
  endsByModel: NgbDateStruct;
  startFromModel: NgbDateStruct;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.holidayList = { ...(holidaList as any).default };
    console.log(
      moment('11-03-2021', 'DD-MM-YYYY').isBefore(
        moment('11-03-2021', 'DD-MM-YYYY')
      )
    );
  }
  getDaysFromFrequencyType(frequencyType: OccuranceType, date) {
    switch (frequencyType) {
      case 'daily':
        return 1;
      case 'weekly':
        return 7;
      case 'monthly':
        return moment(date, 'DD-MM-YYYY').daysInMonth();
      case 'yearly':
        return 365;
      default:
        break;
    }
  }
  isTheDayIsHoliday(date) {
    if (
      _.filter(this.holidayList.weeklyOff, function (o) {
        return o === date;
      }).length > 0 ||
      _.filter(this.holidayList.holiday, function (o) {
        return o === date;
      }).length > 0
    ) {
      return true;
    }
    return false;
  }
  getNonHolidayDate(date) {
    if (!this.isTheDayIsHoliday(date)) {
      return date;
    } else {
      let nextDate = moment(date, 'DD-MM-YYYY')
        .add(1, 'days')
        .format('DD-MM-YYYY');
      return this.getNonHolidayDate(nextDate);
    }
  }
  getNextDateOfOccurance(date, frequencyNo) {
    let requiredDate = moment(date, 'DD-MM-YYYY')
      .add(frequencyNo, 'days')
      .format('DD-MM-YYYY');
    return this.getNonHolidayDate(requiredDate);
  }
  updateDueDates(
    frequencyType: OccuranceType,
    occuranceNumber,
    startDate,
    endDate
  ) {
    this.dueDates = [];
    let frequencyDayNo = this.getDaysFromFrequencyType(
      frequencyType,
      startDate
    );
    let nonHolidayStartingDate = this.getNonHolidayDate(startDate);
    let nextDateOfOccurance = nonHolidayStartingDate;
    console.log('nextDateOfOccurance', nextDateOfOccurance);
    for (let i = 0; i < occuranceNumber; i++) {
      frequencyDayNo = this.getDaysFromFrequencyType(
        frequencyType,
        nextDateOfOccurance
      );
      nextDateOfOccurance = this.getNextDateOfOccurance(
        nextDateOfOccurance,
        frequencyDayNo
      );
      if (
        endDate &&
        !moment(nextDateOfOccurance, 'DD-MM-YYYY').isBefore(
          moment(endDate, 'DD-MM-YYYY')
        )
      ){
        break;
      }
        this.dueDates.push(nextDateOfOccurance);
    }
  }
  getMomentSupportedDate(dateObj) {
    return moment(new Date(dateObj.year, dateObj.month, dateObj.day)).format(
      'DD-MM-YYYY'
    );
  }
  viewDueDates(form: NgForm) {
    if (form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill all the required field!',
      });
      return;
    }
    let startDate = moment().format('DD-MM-YYYY');
    let endDate = '';
    let occurance = 10;
    if (form.value.startFrom) {
      startDate = this.getMomentSupportedDate(form.value.startFrom);
    }
    if (form.value.endsBy) {
      endDate = this.getMomentSupportedDate(form.value.endsBy);
    }
    if (form.value.occurance) {
      occurance = +form.value.occurance;
    }
    this.updateDueDates(form.value.frequency, occurance, startDate, endDate);
    this.viewdueDateStatus = true;
  }
  responsibilityChange(event) {
    console.log(this.isResponsibilityChecked);
  }
}
