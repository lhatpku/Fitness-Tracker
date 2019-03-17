// Graph Set up
const svgWidth = 560;
const svgHeight = 400;

const margin = {top:40, right:20, bottom: 50, left:100};

const graphWidth = svgWidth - margin.left - margin.right;
const graphHeight = svgHeight - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width',svgWidth)
    .attr('height',svgHeight);

const graph = svg.append('g')
    .attr('width',graphWidth)
    .attr('height',graphHeight)
    .attr('transform',`translate(${margin.left},${margin.top})`);

// Scales
const x = d3.scaleTime().range([0,graphWidth]);
const y = d3.scaleLinear().range([graphHeight,0]);

// Axes Groups
const xAxisGroup = graph.append('g')
    .attr('class','x-axis')
    .attr('transform',`translate(0,${graphHeight})`);

const yAxisGroup = graph.append('g')
    .attr('class','y-axis');

// D3 line generator
const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.distance));

// Line path element
const path = graph.append('path');

// create dotted line group and append to graph
const dottedLines = graph.append('g')
    .attr('class','lines')
    .style('opacity',0);

// x dotted line
const xDottedLine = dottedLines.append('line')
    .attr('stroke','#aaa')
    .attr('stroke-width',1)
    .attr('stroke-dasharray',4);

const yDottedLine = dottedLines.append('line')
    .attr('stroke','#aaa')
    .attr('stroke-width',1)
    .attr('stroke-dasharray',4);


const update = (date) => {

    data = data.filter(item => item.activity === activity);
    data.sort((a,b) => new Date(a.date) - new Date(b.date));

    x.domain(d3.extent(data,d => new Date(d.date)));
    y.domain([0,d3.max(data,d => d.distance)]);

    // Update data path
    path.data([data])
        .attr('fill','none')
        .attr('stroke','#00bfa5')
        .attr('stroke-width',2)
        .attr('d',line)

    // Create Circles for Objects
    const circles = graph.selectAll('circle')
        .data(data);

    // Remove deleted circles
    circles.exit().remove();

    // Add new points
    circles.enter()
        .append('circle')
            .merge(circles)
            .attr('r',4)
            .attr('cx',d => x(new Date(d.date)))
            .attr('cy',d => y(d.distance))
            .attr('fill','#ccc');

    graph.selectAll('circle')
        .on('mouseover',(d,i,n) => {
            d3.select(n[i])
                .transition()
                .duration(100)
                    .attr('r',8)
                    .attr('fill','#fff');

            xDottedLine
                .attr('x1',x(new Date(d.date)))
                .attr('x2',x(new Date(d.date)))
                .attr('y1',graphHeight)
                .attr('y2',y(d.distance));


            yDottedLine
                .attr('x1',0)
                .attr('x2',x(new Date(d.date)))
                .attr('y1',y(d.distance))
                .attr('y2',y(d.distance));

            dottedLines.style('opacity',1);
        })
        .on('mouseleave',(d,i,n) => {
            d3.select(n[i])
                .transition()
                .duration(100)
                    .attr('r',4)
                    .attr('fill','#fff');
            dottedLines.style('opacity',0);
        })


    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm');

    // Call Axis
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Rotate axis text
    xAxisGroup.selectAll('text')
        .attr('transform','rotate(-40)')
        .attr('text-anchor','end');
     
}

// Data and Firestore
var data = [];

db.collection('activities').onSnapshot(res => {

    res.docChanges().forEach(change => {

        const doc = {...change.doc.data(),id: change.doc.id};

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }

    });

    update(data);


})