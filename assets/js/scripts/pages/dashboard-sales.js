/*=========================================================================================
    File Name: dashboard-analytics.js
    Description: intialize advance cards
    ----------------------------------------------------------------------------------------
    Item Name: Modern Admin - Clean Bootstrap 4 Dashboard HTML Template
   Version: 3.0
    Author: Pixinvent
    Author URL: hhttp://www.themeforest.net/user/pixinvent
    ==========================================================================================*/
    $(window).on('load', function() {

        var settings= {
            type: "GET",
            dataType: "json",
            url: "/api/user/getlogincount",
            success: function(response) {
                var currentYear=response.current;
                var prevYear=response.prev;
                Chart.defaults.derivedLine = Chart.defaults.line;
                var draw = Chart.controllers.line.prototype.draw;
                var custom = Chart.controllers.line.extend({
                    draw: function() {
                        draw.apply(this, arguments);
                        var ctx = this.chart.chart.ctx;
                        var _stroke = ctx.stroke;
                        ctx.stroke = function() {
                            ctx.save();
                            ctx.shadowColor = '#ffb6c0';
                            ctx.shadowBlur = 30;
                            ctx.shadowOffsetX = 0;
                            ctx.shadowOffsetY = 20;
                            _stroke.apply(this, arguments)
                            ctx.restore();
                        }
                    }
                });

                Chart.controllers.derivedLine = custom;
                var ctx = document.querySelector("#thisYearRevenue").getContext('2d');
                var thisYearRevenueChart = new Chart(ctx, {
                    type: 'derivedLine',
                    data: {
                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "july", "Aug","Sep","Oct","Nov","Dec"],
                        datasets: [{
                            data: currentYear,
                            borderWidth: 4,
                            borderColor: '#FF4961',
                            pointBackgroundColor: "#FFF",
                            pointBorderColor: "#FF4961",
                            pointHoverBackgroundColor: "#FFF",
                            pointHoverBorderColor: "#FF4961",
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            fill: false,
                        }]
                    },
                    options: {
                        responsive: true,
                        tooltips: {
                            displayColors: false,
                            callbacks: {
                                label: function(e, d) {
                                    // return '${e.xLabel} : ${e.yLabel}'
                                },
                                title: function() {
                                    return;
                                }
                            }
                        },
                        legend: {
                            display: false
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: false,
                                },
                            }],
                            yAxes: [{
                                ticks: {
                                    padding: 10,
                                    stepSize: 50,
                                    max: 200,
                                    min: 0,
                                },
                                gridLines: {
                                    display: true,
                                    drawBorder: false,
                                    lineWidth: 1,
                                    zeroLineColor: '#e5e5e5',
                                }
                            }]
                        }
                    }
                });

                var ctx2 = document.querySelector("#lastYearRevenue").getContext('2d');
                var lastYearRevenueChart = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "july", "Aug","Sep","Oct","Nov","Dec"],
                        datasets: [{
                            data: prevYear,
                            borderWidth: 4,
                            borderDash: [8, 4],
                            borderColor: '#c3c3c3',
                            pointBackgroundColor: "#FFF",
                            pointBorderColor: "#c3c3c3",
                            pointHoverBackgroundColor: "#FFF",
                            pointHoverBorderColor: "#c3c3c3",
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            fill: false,
                        }]
                    },
                    options: {
                        responsive: true,
                        tooltips: {
                            displayColors: false,
                            callbacks: {
                                label: function(e, d) {
                                    // return '${e.xLabel} : ${e.yLabel}'
                                },
                                title: function() {
                                    return;
                                }
                            }
                        },
                        legend: {
                            display: false
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: false,
                                },
                            }],
                            yAxes: [{
                                ticks: {
                                    padding: 10,
                                    stepSize: 50,
                                    max: 200,
                                    min: 0,
                                },
                                gridLines: {
                                    display: true,
                                    drawBorder: false,
                                    zeroLineColor: '#e5e5e5',
                                }
                            }]
                        }
                    }
                });




            },
            error: function (err, type, httpStatus) {
                alert('error has occured');
            }
        };

        $.ajax(settings);
    // Revenue - CharJS Line

     


});