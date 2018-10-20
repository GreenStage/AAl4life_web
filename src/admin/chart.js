import {Line} from  'react-chartjs-2';
import React, { Component } from 'react';

export default class Chart extends Component{
	constructor(props){
		super(props)
	}

	render(){
		let values = [];
		let labels = [];
		let chartP = " ";
		let now = Date.now();
		let chartData = this.props.data;

		if(chartData){
			console.log("data")
			console.log(chartData)
			chartData.map((dt) =>{
				values.push(dt.value);
				labels.push("-" + Math.floor((now - dt.issued_at)/1000) +"s");
			})
			
			labels[labels.length -1] = "now";

			chartP = (<Line data={{
				labels: labels,
				datasets:[{
					label: this.props.label,
					borderColor:'rgba(216,53,53,1)',
					fill:false,
					data: values}]
				}}
				options={{
					maintainAspectRatio: false,
					datasets:{
						fontColor:'white',
						labels:{
							fontColor: 'rgba(65,65,65,1)',
						}
					},
					scales: {
						yAxes: [{
							ticks: {
								fontColor: 'rgba(65,65,65,1)',
								fontSize: 18,
							}
						}],
						xAxes: [{
							ticks: {
								fontColor: 'rgba(65,65,65,1)',
								fontSize: 14,
							}
						}]
					}
				}} />);
		}
		
		return(chartP);
	}
}