import React from 'react';
import moment from 'moment';
import d3 from 'd3';
import d3Tip from 'd3-tip';
d3Tip(d3);

import lines from '../modules/chart/lines.js';
import axes from '../modules/chart/axes.js';

export default class Chart extends React.Component {

  displayName: 'Chart.jsx'

  constructor(props) {
    super(props);
  }

  render() {
    return <div id="chart" ref="el" style={this.props.style} />;
  }

  componentDidMount() {
    let { data } = this.props;

    console.log('DATA', data);

    // Skip charts that have nothing to show.
    if (data.stats.isEmpty) return;

    let issues = data.issues;
    // Total number of points in the milestone.
    let total = issues.open.size + issues.closed.size;

    // An issue may have been closed before the start of a milestone.
    if (issues.closed.size > 0) {
      let head = issues.closed.list[0].closed_at;
      if (issues.length && data.created_at > head) {
        // This is the new start.
        data.created_at = head;
      }
    }

    // Set created date to the beginning of the day, makes for a better display
    //  when issues get closed right at the beginning.
    data.created_at = moment(data.created_at, moment.ISO_8601)
    .startOf('day').toISOString();

    // Actual, ideal & trend lines.
    let actual = lines.actual(issues.closed.list, data.created_at, total);
    let ideal = lines.ideal(data.created_at, data.due_on, total);
    let trend = lines.trend(actual, data.created_at, data.due_on);

    // Get available space.
    let { height, width } = this.refs.el.getBoundingClientRect();

    let margin = { 'top': 30, 'right': 30, 'bottom': 40, 'left': 50 };
    width -= margin.left + margin.right;
    height -= margin.top + margin.bottom;

    // Scales.
    let x = d3.time.scale().range([ 0, width ]);
    let y = d3.scale.linear().range([ height, 0 ]);

    // Axes.
    let xAxis = axes.time(height, x, data.stats.span);
    let yAxis = axes.points(width, y);

    // Line generator.
    let line = d3.svg.line()
    .interpolate("linear")
    .x((d) => x(new Date(d.date))) // convert to Date only now
    .y((d) => y(d.points));

    // Get the minimum and maximum date, and initial points.
    let first = ideal[0], last = ideal[ideal.length - 1];
    x.domain([ new Date(first.date), new Date(last.date) ]);
    y.domain([ 0, first.points ]).nice();

    // Add an SVG element with the desired dimensions and margin.
    let svg = d3.select(this.refs.el).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the clip path so that lines are not drawn outside of the boundary.
    svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("id", "clip-rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

    // Add the days x-axis.
    svg.append("g")
    .attr("class", "x axis day")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

    // Add the years x-axis?
    let yrAxis = axes.year(height, xAxis, data.stats.span);

    svg.append("g")
    .attr("class", "x axis year")
    .attr("transform", `translate(0,${height})`)
    .call(yrAxis);

    // Add the y-axis.
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    // Add a line showing where we are now.
    svg.append("svg:line")
    .attr("class", "today")
    .attr("x1", x(new Date))
    .attr("y1", 0)
    .attr("x2", x(new Date))
    .attr("y2", height);

    // Add the ideal line path.
    svg.append("path")
    .attr("class", "ideal line")
    // Piecewise linear segments, as in a polyline.
    .attr("d", line.interpolate("linear")(ideal));

    // Add the trendline path.
    svg.append("path")
    .attr("class", "trendline line")
    // Piecewise linear segments, as in a polyline.
    .attr("d", line.interpolate("linear")(trend));

    // Add the actual line path.
    svg.append("path")
    .attr("class", "actual line")
    // Piecewise linear segments, as in a polyline.
    .attr("d", line.interpolate("linear").y((d) => y(d.points))(actual));

    // Collect the tooltip here.
    let tooltip = d3.tip().attr('class', 'd3-tip')
    .html(({ number, title }) => `#${number}: ${title}`);

    svg.call(tooltip);

    // Show when we closed an issue.
    svg.selectAll("a.issue")
    .data(actual.slice(1)) // skip the starting point
    .enter()
    // A wrapping link.
    .append('svg:a')
    .attr("xlink:href", ({ html_url }) => html_url )
    .attr("xlink:show", 'new')
    .append('svg:circle')
    .attr("cx", ({ date }) => x(new Date(date)))
    .attr("cy", ({ points }) => y(points))
    .attr("r", ({ radius }) => 5)
    .on('mouseover', function(d, i) {
      tooltip.show(d, this);
    })
    .on('mouseout', tooltip.hide);
  }

}
