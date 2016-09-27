//Linear gauge
//The way to implement it would be: 
// - To take a stacked bar graph as a basis
// - Ignore all the graph related attributes 
//   (like: axis, ticks and so on)
// - Define a single set of data 
// - Swap the x and y axis values


function drawChart(ticks_count,min_val,max_val,lowrate,moderate,highrate,cur_value,valueFontSize,min_green,max_green,min_yellow,max_yellow,min_red,max_red){

    var range = max_val - min_val;

    var margins = {
        top: 48,
        left: 16,
        right: 36,
        bottom: 24
    },
    width = 400 - margins.left - margins.right
        height = 50,
        dataset = [{
            data: [{
                barId: '1', // we assign some random value, the most important to keep it same for all the entries 
                percent: lowrate, // percentage that we want a specific value to occupy as a part of the gauge: values betwee 0-1
                severity: 'LOW_COLOR',// color id that we'll used to reference gradient value
                stroke_color: '#b4d25a',
                start_pos:min_green/100,
                end_pos:max_green/100
            }]
        }, {
            data: [{
                barId: '1',
                percent: moderate,
                severity: 'MODERATE_COLOR',
                stroke_color: '#f3d168',
                start_pos:min_yellow/100,
                end_pos:max_yellow/100
            }]
        }, {
            data: [{
                barId: '1',
                percent: highrate,
                severity: 'HIGH_COLOR',
                stroke_color: '#f99c8e',
                start_pos:min_red/100,
                end_pos:max_red/100
            }]
        }],
        dataset = dataset.map(function (d) {
            return d.data.map(function (o, i) {
                // Structure it so that your numeric
                // axis (the stacked amount) is y
                return {
                    y: o.percent,
                    x: o.barId,
                    start_pos: o.start_pos,
                    end_pos: o.end_pos,
                    severity:o.severity,
                    stroke_color:o.stroke_color
                };
            });
        }),
        stack = d3.layout.stack();

    stack(dataset);

    $('#chart_div').html('');

    var dataset = dataset.map(function (group) {
        return group.map(function (d) {
            // Invert the x and y values, and y0 becomes x0
            return {
                x: d.y,
                y: d.x,
                x0: d.y0,
                start_pos: d.start_pos,
                end_pos: d.end_pos,
                severity:d.severity,
                stroke_color:d.stroke_color
            };
        });
    }),
        svg = d3.select('#chart_div')
            .append('svg')
            .attr('width', width + margins.left + margins.right)
            .attr('height', height + margins.top + margins.bottom)
            .append('g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
        xMax = d3.max(dataset, function (group) {
            return d3.max(group, function (d) {
                return 1;
            });
        }),
        xScale = d3.scale.linear()
            .domain([0, xMax])
            .range([0, width]),
        yValue = dataset[0].map(function (d) {
            return d.y;
        }),
        yScale = d3.scale.ordinal()
            .domain(yValue)
            .rangeRoundBands([0, height], .1),
        // this color funciton referencing the linearGradient defind in the HTML part by id 
        color = function (index) {
            return "url(#" + dataset[index][0].severity + ")";
        },
        border_color = function (index) {
            return dataset[index][0].stroke_color;
        },
        groups = svg.selectAll('g')
            .data(dataset)
            .enter()
            .append('g')
            .style('fill', function (d, i) {
                return color(i);
            });
        var rects = groups.selectAll('rect')
            .data(function (d) {
            return d;
        }).enter();
        rects.append('rect')
            .attr('x', function (d) {
            return xScale(d.start_pos);
        })
            .attr('y', function (d, i) {
            return yScale(d.y);
        })
            .attr('height', function (d) {
            return yScale.rangeBand();
        })
            .attr('width', function (d) {
            return xScale(d.end_pos - d.start_pos);
        });



        svg.selectAll('rect')
            .data(dataset)
        .style('stroke', function (d, i) {
            return border_color(i);
        });

        svg.selectAll('g')
            .append('line')
            .style('fill', function (d, i) {
                return color(i);
            });

        svg.append("line")
                    .style("stroke","black")
                    .attr("x1", 0)     // x position of the first end of the line
                    .attr("y1", 0)      // y position of the first end of the line
                    .attr("x2", width)     // x position of the second end of the line
                    .attr("y2", 0);
        interval = width / (ticks_count);

        for(i = 0; i<= ticks_count; i++){
            var tick_height = 3;
            if(i % (ticks_count/4) == 0){
                tick_height = 5;
            }
            svg.append("line")
            .style("stroke","black")
            .attr("x1", i*interval)     // x position of the first end of the line
            .attr("y1", -tick_height)      // y position of the first end of the line
            .attr("x2", i*interval)     // x position of the second end of the line
            .attr("y2", 0);
        }

    // locate a label with percentage above each section of the gauge    
    label_count = 5;
    label_interval = range / (label_count - 1);
    interval = width / (label_count - 1);
    for(i = 0; i < label_count; i++){
        var num = Math.round((min_val+i*label_interval)*10)/10;
        rects.append("text")
              .text('$'+num)
              .attr("x",i*interval-10)
              .attr("y","-10")
              .style("fill", '#555555')
              .style("stroke-width","0px")
    }

    // locate a label with percentage above each section of the gauge
    var green_pos = min_yellow<max_green?min_yellow:max_green;
    green_pos = green_pos*width/200 - 15;
    rects.append("text")
          .text("Low")
          .attr("x",green_pos)
          .attr("y",height/2+6)
          .style("fill", '#5f6451')
          .style("stroke-width","0px")
          .style("font-size","12px");

    var yellow_pos = min_red<max_yellow?min_red:max_yellow;
    yellow_pos = (min_yellow+(yellow_pos- min_yellow)/2)/100*width - 26;

    rects.append("text")
          .text("Moderate")
          .attr("x",yellow_pos)
          .attr("y",height/2+6)
          .style("fill", '#5f6451')
          .style("stroke-width","0px")
          .style("font-size","12px");
    
    var red_pos = (min_red+(max_red-min_red)/2)/100*width - 15;

    rects.append("text")
          .text("High")
          .attr("x",red_pos)
          .attr("y",height/2+5)
          .style("fill", '#5f6451')
          .style("stroke-width","0px")
          .style("font-size","12px");

    if(cur_value >= min_val){
        var start_pos = (cur_value-min_val)/range;

        var trianglePoints = xScale(start_pos) + ' 13' + ', ' + xScale(start_pos-0.03) + ' -2' + ', ' + xScale(start_pos+0.03) + ' -2' + ',' + xScale(start_pos) + ' 13';

        svg.append('polyline')
            .attr('points', trianglePoints)
            .style('stroke', '#545454');

        
        var offset_x = (cur_value.toString().length+2)/100;
        var xPos = xScale(start_pos-offset_x);
        svg.append("text")
          .text('$'+cur_value)
          .attr("x",xPos)
          .attr("y",30)
          .style("fill", '#565655')
          .style("stroke-width","0px")
          .style("font-weight","bold")
          .style("font-size",valueFontSize+"px");
    }
}