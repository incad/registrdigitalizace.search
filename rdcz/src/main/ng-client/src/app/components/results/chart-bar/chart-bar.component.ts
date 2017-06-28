import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { URLSearchParams } from '@angular/http';

import { FlotComponent } from '../../flot/flot.component';

import { AppService } from '../../../app.service';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss']
})
export class ChartBarComponent implements OnInit {

  @ViewChild('chart') chart: FlotComponent;
  @Input() height: string;
  @Input() width: string;


  public data: any = {};
  public options = {
    series: {
      bars: {
        show: true,
        lineWidth: 1,
        barWidth: 10,
        order: 2
      },
      hoverable: true
    },
    grid: {
      hoverable: true,
      borderWidth: 0,
      color: '#546e7a',
      clickable: true

    },
    selection: {
      mode: 'x'
    },
    tooltip: {
      show: true,                 //false
      content: 'Rok %x (%y)'      //"%s | X: %x | Y: %y"
    },
    colors: ["#ffab40","#ffab40","#ffab40"]
  }
  subscriptions: Subscription[] = [];

  constructor(private service: AppService, private state: AppState) {
  }

  ngOnInit() {
    this.state.currentDo = (new Date()).getFullYear();
    this.data = [{ data: [] }];
    this.chart.setData(this.data);
    this.subscriptions.push(this.state.searchSubject.subscribe(
      (resp) => {
        if (resp['type'] === 'home' || resp['type'] === 'results') {
          if (resp['state'] === 'start') {
            this.data = [{ data: [] }];
            this.chart.setData(this.data);
          } else {
          if(resp['res']["facet_counts"]["facet_ranges"]['rokvyd']){
            this.data = [{ data: resp['res']["facet_counts"]["facet_ranges"]['rokvyd']['counts'] }];
            this.chart.setData(this.data);
          }
          }
        }
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  onSelection(ranges) {
    this.state.currentOd = Math.floor(ranges['xaxis']['from']);
    this.state.currentDo = Math.ceil(ranges['xaxis']['to']);
    this.state.addRokFilter();
    this.service.goToResults();
    //console.log(ranges['xaxis']['from'].toFixed(1) + " to " + ranges['xaxis']['to'].toFixed(1));
  }

  onClick(item) {
    console.log('Rok: ' + item['datapoint'][0]);
    //this.getData();
  }

  getData() {

    let params: URLSearchParams = new URLSearchParams();
    params.set('q', 'rokvyd:[' + this.state.currentOd + ' TO ' + this.state.currentDo + ']');
    params.set('fq', '-rokvyd:0');
    params.set('facet', 'true');
    //params.set('facet.field', 'rokvyd');
    params.set('facet.range', 'rokvyd');
    params.set('facet.range.start', this.state.currentOd + '');
    params.set('facet.range.end', this.state.currentDo + '');
    params.set('facet.range.gap', '10');
    params.set('facet.limit', '-1');
    params.set('facet.mincount', '1');

    //    this.service.search(params).subscribe(res => {
    //      
    //      this.data = [{ data: res["facet_counts"]["facet_ranges"]['rokvyd']['counts']}];
    //      this.chart.setData(this.data);
    //    });
    this.service.search(params);
  }


}
/*
 * 
 */