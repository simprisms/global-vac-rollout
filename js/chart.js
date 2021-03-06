async function plotChart() {

    let data = await d3.csv('Processing/chart2.csv').then(data => {
        data.forEach(d => {
            d.Population = Number(d.Population)
            d.GDPpc = Number(d.GDPpc)
            d.total_vaccinations_per_hundred = Number(d.total_vaccinations_per_hundred)
        })
        return data
    })

    // Filter data
    const filteredData = data.filter(d => {
        return d.location !== "World" &&
            d.location !== 'Upper middle income' &&
            d.location !== 'Lower middle income' &&
            d.location !== 'Low income' &&
            d.location !== 'High income' &&
            d.location !== 'European Union' &&
            d.location !== 'North America' &&
            d.location !== 'South America' &&
            d.location !== 'Gibraltar' &&
            d.location !== 'British Virgin Islands' 
            
    })

    // Number formatter
    const numFormatter = d3.format(",");

    // Create accessor function 
    const xAccessor = d => d.total_vaccinations_per_hundred
    const yAccessor = d => d.GDPpc
    const sizeAccessor = d => d.Population
    // const width = (window.innerWidth < 500) ? window.innterwidth : window.innerWidth * 0.52
    // Set dimensions
    const width = window.innerWidth * 0.52
    const dimensions = {
        width,
        height: width,
        margins: {
            top: 90,
            right: 30,
            left: 30,
            bottom: 40
        }
    }

    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom

    // Create wrapper 
    const wrapper = d3.select("#chart").append('svg')
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        // .attr("viewBox", `0 0 ${dimensions.width - 150} ${dimensions.width -150}`)
         
    // Create bounds
    const bounds = wrapper.append('g')
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    // Create chart background
    bounds.append("rect")
        .attr("height", dimensions.boundedHeight)
        .attr("width", dimensions.boundedWidth)
        .attr("opacity", "0.5")
        .attr("fill", "#f5f3f3")


    // Create scales
    const xScale = d3.scaleLog()
        .domain(d3.extent(filteredData, xAccessor))
        .range([0, dimensions.boundedWidth])
        .base(10)
        .nice()

    const yScale = d3.scaleLog()
        .domain([100, d3.max(filteredData, yAccessor)])
        .range([dimensions.boundedHeight, 0])
        .base(10)

    const area = d3.scaleLinear()
        .domain(d3.extent(data, sizeAccessor))
        .range([15 * Math.PI, 1000 * Math.PI])

    const contcolor = d3.scaleOrdinal()
        .domain(filteredData.map(d => d.IncomeGroup))
        .range(['#315873', '#b1b2b7', '#c29174', '#648C6C'])

    // Create tooltip
    const chartTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => {
            return `<p class="geo">${d.location}</p><p class="region"><strong>${d.Region}</strong></p><p id="income">${d.IncomeGroup} income group</p><p class="figures">Vaccinations per 100 people:&nbsp;&nbsp;&nbsp;<strong>${d.total_vaccinations_per_hundred}</strong></p><p class="figures">GDP per capita:&nbsp;&nbsp;&nbsp;<strong>$${numFormatter(Math.trunc(d.GDPpc))}</strong></p>`
        })
    bounds.call(chartTip)

    // Draw data
    const circles = bounds.selectAll('circle')
        .data(filteredData)

    circles.exit().remove()

    circles.enter()
        .append("circle")
        .attr("class", "circles")
        .attr("cx", d => xScale(xAccessor(d)))
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", d => Math.sqrt(1.5 * area(sizeAccessor(d)) / Math.PI))
        .attr("r", d => {
            if (window.innerWidth >= 1300) {
                return Math.sqrt(1.5 * area(sizeAccessor(d)) / Math.PI)
            } else if (window.innerWidth  > 800 & window.innerWidth  < 1299) {
                return Math.sqrt(1 * area(sizeAccessor(d)) / Math.PI)
            } else if (window.innerWidth  > 300 & window.innerWidth  < 800) {
                return Math.sqrt(0.3 * area(sizeAccessor(d)) / Math.PI)
            }
        })
        .attr("opacity", "0.7")
        .attr("fill", d => contcolor(d.IncomeGroup))
        .on("mouseover", chartTip.show)
        .on("mouseleave", chartTip.hide)


    // Country labels
    const countries = ['United States', 'China', "Burkina Faso", 'India',
        'Nigeria', "Malawi", "Zambia", "Togo", "Monaco", "Somalia", "Australia", "Lesotho", "Japan", "United Kingdom", "Gabon", "Thailand", "Mongolia", "Chad", "Philippines", "Mali"]

    const labels = bounds.selectAll('text')
        .data(filteredData)

    labels.enter().append("text")
        .attr("class", "labels")
        .attr("x", d => {
            switch (d.location) {
                case "United States":
                    return xScale(xAccessor(d)) + 30
                case "China":
                    return xScale(xAccessor(d)) + 42
                case "United Kingdom":
                    return xScale(xAccessor(d)) + 20
                default:
                    return xScale(xAccessor(d))
            }
        })
        .attr("y", d => {
            switch (d.location) {
                case "India":
                    return yScale(yAccessor(d)) - 21
                case "Togo":
                    return yScale(yAccessor(d)) + 18
                case "Japan":
                    return yScale(yAccessor(d)) + 19
                case "United Kingdom":
                    return yScale(yAccessor(d)) + 19
                case "Malawi":
                    return yScale(yAccessor(d)) + 20
                case "Nigeria":
                    return yScale(yAccessor(d)) - 14
                case "United States":
                    return yScale(yAccessor(d)) + 4
                case "Lesotho":
                    return yScale(yAccessor(d)) - 10
                case "Philippines":
                    return yScale(yAccessor(d)) + 18
                case "China":
                    return yScale(yAccessor(d)) + 20
                case "Chad":
                    return yScale(yAccessor(d)) + 18
                default:
                    return yScale(yAccessor(d)) - 10
            }
        })
        .attr("text-anchor", 'middle')
        .attr("opacity", "1")
        .attr("fill", d3.rgb(80, 80, 80))
        .attr("font-weight", "400")
        .text(d => {
            if (d.location == "United Kingdom") {
                return "UK"
            } else if (d.location == "United States") {
                return "US"
            } else {
                return countries.includes(d.location) ? d.location : ""
            }
        })

    // Label lines
    const lines = bounds.selectAll("line")
        .data(filteredData)

    lines.enter().append("line")
        .attr("opacity", "0.5")
        .attr("stroke", d3.rgb(80, 80, 80))
        .attr("x1", d => {
            switch (d.location) {
                case "China":
                    return xScale(xAccessor(d))
                case 'United States':
                    return xScale(xAccessor(d)) - 3
                case 'United Kingdom':
                    return xScale(xAccessor(d))
            }
        })
        .attr("y1", d => {
            switch (d.location) {
                case "China":
                    return yScale(yAccessor(d))
                case 'United States':
                    return yScale(yAccessor(d))
                case 'United Kingdom':
                    return yScale(yAccessor(d))
            }
        })
        .attr("x2", d => {
            switch (d.location) {
                case "China":
                    return xScale(xAccessor(d)) + 25
                case 'United States':
                    return xScale(xAccessor(d)) + 20
                case 'United Kingdom':
                    return xScale(xAccessor(d)) + 10
            }
        })
        .attr("y2", d => {
            switch (d.location) {
                case "China":
                    return yScale(yAccessor(d)) + 15
                case 'United States':
                    return yScale(yAccessor(d))
                case 'United Kingdom':
                    return yScale(yAccessor(d)) + 15
            }
        })
        .attr("stroke", "black")

    // Create axes
    const xAxisGenerator = d3.axisBottom(xScale)
        .tickValues([0.1, 1, 10, 100])
        .tickArguments([5, ".3"])
        .tickSizeOuter(0)

    const xAxis = bounds.append('g')
        .attr("class", "axis")
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

    // x axis labels
    const xLabel = xAxis.append("text")
        .attr("x", dimensions.boundedWidth)
        .attr("y", 30)
        .attr("fill", "black")
        .attr("font-size", "12px")
        .attr("text-anchor", "end")
        .text("Vaccinations per 100 people")

    const yAxisGenerator = d3.axisLeft(yScale)
        // .tickSize(-dimensions.boundedWidth)
        .tickArguments([5, ".1s"])
        .tickValues([1000, 10000, 100000])
        .tickSizeOuter(0)

    const yAxis = bounds.append('g')
        .attr("class", "axis")
        .call(yAxisGenerator)

    // y axis label
    const yLabel = yAxis.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("fill", "black")
        .attr("font-size", "12px")
        .attr("text-anchor", "start")
        .text("GDP per capita ($)")


    // Create legend
    const income = ["Low", "Lower middle", "Upper middle", "High"]

    const legend = bounds.selectAll('.legendItems')
        .data(income)

    let totalWidth = 0

    legend.enter().append("text")
        .attr("class", "legendText")
        .attr("x", 120)
        .attr("y", -40)
        .attr("font-weight", "600")
        .attr("class", "legendItems")
        .attr("font-size", "15px")
        .text(d => d)
        .each(function () {
            let current = d3.select(this);
            current.attr('transform', `translate(${totalWidth}, 0)`);
            totalWidth += current.node().getBBox().width + 15;
        })
        .attr("fill", d => contcolor(d))
    

    bounds.append("text")
        .attr("font-weight", "600")
        .attr("fill", "#5c5a5a")
        .attr("font-size", "15px")
        .attr("x", 0)
        .attr("y", -40)
        .text("Income group")

    // Add header
    bounds.append("text")
        .attr("x", 0)
        .attr("y", -70)
        .attr("text-anchor", "start")
        .attr("font-size", "19px")
        .text("Rich countries come out on top")

    
}

plotChart()

window.addEventListener('resize', plotChart.render )