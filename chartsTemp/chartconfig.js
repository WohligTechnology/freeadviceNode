function createGraph(tenure, median1, median50, median99) {
    console.log(tenure);
    console.log(median1);
    console.log(median50);
    console.log(median99);
    
    $('#container').highcharts({
        title: {
            text: 'Graph 1',
            x: -20 //center
        },
        subtitle: {
            text: 'Medians',
            x: -20
        },
        xAxis: {
            categories: tenure
        },
        yAxis: {
            title: {
                text: 'Amount'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: 'Rs.'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Median 1',
            data: median1
        }, {
            name: 'Median 50',
            data: median50
        }, {
            name: 'Median 99',
            data: median99
        }]
    });
}