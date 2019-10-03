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

    $("#basicScenario").jsGrid({
        width: "100%",
        filtering: true,
        editing: false,
        inserting: true,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 15,
        pageButtonCount: 5,
        controller: db,
        fields: [
            { name: "Name", type: "text", width: 100 },
            {
                name: "Domain", type: "text",
                itemTemplate: function (value) {
                    // return $("<a>").attr("href", value).text(value);
                    return '<a href="http://' + value + '" target="_blank">' + value + '</a>';
                }, width: 200, filtering: true
            },
            { name: "Module_Year", type: "number", width: 50 },
            //{ name: "Domain", type: "text", width: 200 },
            { name: "Module", type: "select", items: db.Modules, valueField: "Id", textField: "Name" },
            { name: "isActive", type: "checkbox", title: "Is Active", sorting: false },
            { type: "control" },
            { name: "fieldname" }
        ]
    });

    $("#jsGrid").jsGrid({
        width: "100%",
        filtering: true,
        editing: false,
        inserting: false,
        sorting: true,
        paging: true,
        autoload: true,
        pageSize: 15,
        pageButtonCount: 5,

        //for loadData method Need to set auto load true
        autoload: true,
        pageSize: 50,
        pageButtonCount: 5,

        noDataContent: "Directory is empty",

        controller: {
            loadData: function () {
                var deferred = $.Deferred();
                $.ajax({
                    type: 'GET',
                    url: '/api/user/staffdashboardlistusers',
                    dataType: 'json',
                    success: function (response) {
                        deferred.resolve(response);
                    },
                    error: function (response) {
                        console.log('error ' + response);
                    }
                });
                return deferred.promise();
            }
        },

        fields: [{
            name: "userid",
            title: 'User ID',
            type: "text",
            width: 40
        }, {
            name: "fullname",
            title: 'Name',
            type: "text"
        }, {
            name: "username",
            title: 'Username',
            type: "text"
        }, {

            name: "domain", type: "text",
            title: 'Domain',
            itemTemplate: function (value) {
                // return $("<a>").attr("href", value).text(value);
                return '<a href="http://' + value + '" target="_blank">' + value + '</a>';
            },
            width: 180
        }, {
            name: "value",
            title: 'Module',
            type: "text"
        }, {

            name: "domainmodule", type: "text",
            title: 'Module Domain',
            itemTemplate: function (value) {
                // return $("<a>").attr("href", value).text(value);
                return '<a href="http://' + value + '" target="_blank">' + value + '</a>';
            },
            width: 180
        }, {
            name: "ModuleStartDate",
            title: 'Module Year',
            type: "text"
        }, {
            type: "control"
        },]
    });

});
