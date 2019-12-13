/*=========================================================================================
    File Name: jsgrid.js
    Description: jsgrid Datatable.
    ----------------------------------------------------------------------------------------
    Item Name: Modern Admin - Clean Bootstrap 4 Dashboard HTML Template
   Version: 3.0
    Author: Pixinvent
    Author URL: hhttp://www.themeforest.net/user/pixinvent
==========================================================================================*/

$(document).ready(function () {
    /****************************
     *      Basic Scenario       *
     ****************************/

    $.ajax({
        type: "GET",
        url: "/api/user/staffdashboardgetmodules",
        dataType: "json",
        success: function (modules) {
            modules.unshift({ value: "" });

            $.ajax({
                type: "GET",
                url: "/api/user/staffdashboardgetyears",
                dataType: "json",
                success: function (years) {
                    years.unshift({ ModuleStartDate: "" });
                    populateGrid(modules, years);
                },
                error: function (error) {
                    console.log({ error: error });
                }
            });
        },
        error: function (jqXHR, exception) {
            console.log({ error: exception });
        }
    });

    function contains(element, filters) {
        return element
            .toString()
            .toLowerCase()
            .includes(filters.toString().toLowerCase());
    }

    function isUserId(filters, element) {
        return filters.userid === "" || element.userid == filters.userid;
    }

    function isFirstname(filters, element) {
        return (
            filters.firstname === "" || contains(element.firstname, filters.firstname)
        );
    }

    function isLastname(filters, element) {
        return (
            filters.lastname === "" || contains(element.lastname, filters.lastname)
        );
    }
    /*
      function isDomain(filters, element) {
        return filters.domain === "" || contains(element.domain, filters.domain);
      } */

    function isEmail(filters, element) {
        return (
            filters.email === "" ||
            contains(element.email, filters.email)
        );
    }


    function filterResults(filters, results) {
        var filtered = [];
        for (let i = 0; i < results.length; i++) {
            const element = results[i];
            if (
                isUserId(filters, element) &&
                isFirstname(filters, element) &&
                isLastname(filters, element) &&
                isEmail(filters, element)

            ) {
                filtered.push(element);
            }
        }
        return filtered;
    }

    function populateGrid(modules, years) {
        $("#jsGrid1").jsGrid({
            width: "100%",
            filtering: true,
            editing: false,
            inserting: false,
            sorting: true,
            paging: true,
            autoload: true,
            // pageSize: 25,
            pageButtonCount: 5,

            //for loadData method Need to set auto load true
            autoload: true,
            pageSize: 25,
            pageButtonCount: 5,

            noDataContent: "Directory is empty",

            controller: {
                loadData: function (filters) {
                    var deferred = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: "/api/user/getallusers",
                        dataType: "json",
                        success: function (users) {
                            let response = users;

                            var filtered = filterResults(filters, response);
                            deferred.resolve(filtered);
                        },
                        error: function (response) {
                            console.log(response);
                        }
                    });
                    return deferred.promise();
                }
            },

            fields: [
                {
                    name: "userid",
                    title: "User Id",
                    type: "text",
                    width: 40,
                    align: "center",
                    filtering: true,
                    autosearch: true
                },
                {
                    name: "firstname",
                    title: "First Name",
                    width: 60,
                    align: "center",
                    type: "text",
                    filtering: true
                },
                {
                    name: "lastname",
                    title: "Last Name",
                    width: 60,
                    align: "center",
                    type: "text",
                    filtering: true
                },
                {
                    name: "email",
                    title: "Email",
                    align: "center",
                    type: "text",
                    filtering: true
                },

                {
                    name: "userid",
                    title: "Suspend",
                    type: "text",
                    filtering: false,
                    width: 80,
                    align: "center",
                    itemTemplate: function (value,data) {

                        var images="";
                        if(data.isActive==1){
                            images="<img src='/stop.png' alt='Suspend/Un-suspend student account' width='32' height='32' data-id='"+value+"'>";

                        }else{
                            images="<img src='/play.png' alt='Suspend/Un-suspend student account' width='32' height='32' data-id='"+value+"'>";

                        }
                        return $(images)
                            .on("click", function() {
                                var user=$(this).attr("data-id")
                                var str=$(this).attr("src");
                                var type="";

                                swal({
                                    title: "Are you sure?",
                                    text: "You want to perform this action?",
                                    icon: "warning",
                                    buttons: true,
                                    dangerMode: true,
                                })
                                    .then((willDelete) => {
                                        if (willDelete) {
                                            if(str.includes("play")==true){
                                                $(this).attr("src", "/stop.png");
                                            }else if (str.includes("stop")==true){
                                                $(this).attr("src", "/play.png");
                                            }

                                            if(str.includes("play")==true){
                                                type="act";
                                            }else if (str.includes("stop")==true){
                                                type="sus";
                                            }
                                            var settings= {
                                                type: "GET",
                                                dataType: "json",
                                                url: "/api/user/suspend/"+user+"?type="+type,
                                                success: function(response) {
                                                    swal("Student account has been suspended / un-suspended!", {
                                                        icon: "success",
                                                    });

                                                },
                                                error: function (err, type, httpStatus) {
                                                    alert('error has occured');
                                                }
                                            };

                                            $.ajax(settings);
                                        } else {
                                            swal("Action performed!");
                                        }
                                    });








                                return false;
                            });



                        return "";
                    }
                }






            ]
        });

        $("#jsGrid1 :input").keydown(function () {
            var self = this;
            if (self.timeout) {
                clearTimeout(self.timeout);
            }

            if (self.value.length == 0) {
                $("#jsGrid1").jsGrid("loadData");
            }

            self.timeout = setTimeout(function () {
                $("#jsGrid1").jsGrid("loadData");
            }, 500);
        });
    }
});
