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

  function isModule(filters, element) {
    return filters.value === "" || filters.value === element.value;
  }

  function isUserId(filters, element) {
    return filters.userid === "" || element.userid == filters.userid;
  }

  function isFullname(filters, element) {
    return (
      filters.fullname === "" || contains(element.fullname, filters.fullname)
    );
  }

  function isUserName(filters, element) {
    return (
      filters.username === "" || contains(element.username, filters.username)
    );
  }
/*
  function isDomain(filters, element) {
    return filters.domain === "" || contains(element.domain, filters.domain);
  } */

  function isDomainModule(filters, element) {
    return (
      filters.domainmodule === "" ||
      contains(element.domainmodule, filters.domainmodule)
    );
  }

  function isYears(filters, element) {
    return (
      filters.ModuleStartDate === "" ||
      element.ModuleStartDate == filters.ModuleStartDate
    );
  }

  function filterResults(filters, results) {
    var filtered = [];
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      if (
        isModule(filters, element) &&
        isUserId(filters, element) &&
        isFullname(filters, element) &&
        isUserName(filters, element) &&
       // isDomain(filters, element) &&
        isDomainModule(filters, element) &&
        isYears(filters, element)
      ) {
        filtered.push(element);
      }
    }
    return filtered;
  }

  function populateGrid(modules, years) {
    $("#jsGrid").jsGrid({
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
            url: "/api/user/staffdashboardlistusers",
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
        /* loadData: function (filter) {
						 var d = $.Deferred();
 
						 // server-side filtering
						 $.ajax({
								 type: "GET",
								 url: "/api/user/staffdashboardlistusers",
								 data: filter,
								 dataType: "json"
						 }).done(function (response) {
								 // client-side filtering
								 response = $.grep(response, function (item) {
										 return item.value === filter.value;
								 });
 
								 d.resolve(response);
						 })
 
						 return d.promise();
				 }*/
      },

      fields: [
        {
          name: "userid",
          title: "ID",
          type: "text",
          width: 40,
          align: "center",
          filtering: true,
          autosearch: true
        },
        {
          name: "fullname",
          title: "Name",
          align: "center",
          type: "text",
          filtering: true
        },
        {
          name: "username",
          title: "User",
          width: 60,
          align: "center",
          type: "text",
          filtering: true
        },
       /* {
          name: "domain",
          type: "text",
          title: "Domain",
          align: "center",
          itemTemplate: function (value) {
            // return $("<a>").attr("href", value).text(value);
            return (
              '<a href="http://' + value + '" target="_blank">' + value + "</a>"
            );
          },
          width: 180,
          filtering: true
        },*/
        {
          name: "value",
          title: "Module",
          type: "select",
          filtering: true,
          items: modules,
          valueField: "value",
          textField: "value",
          selectedIndex: -1
        },
        {
          name: "domainmodule",
          type: "text",
          title: "Module Domain",
          align: "center",
          itemTemplate: function (value) {
            // return $("<a>").attr("href", value).text(value);
            return (
              '<a href="http://' + value + '" target="_blank">' + value + "</a>"
            );
          },
          width: 220,
          filtering: true
        },
        {
          name: "ModuleStartDate",
          title: "Module Year",
          type: "select",
          filtering: true,
          items: years,
          valueField: "ModuleStartDate",
          textField: "ModuleStartDate",
          selectedIndex: -1
        },
        {
          name: "lastedit",
          title: "Last Edit",
          type: "text",
          filtering: false,
          width: 60,
          align: "center",
          itemTemplate: function (value) {
            return '<img src="/soon.png" alt="Last Edit Feature Coming Soon" "width="32" height="32">';

            return "";
          }
        },
        {
          name: "clientarea",
          title: "Client Area",
          type: "text",
          filtering: false,
          width: 70,
          align: "center",
          itemTemplate: function (value, item) {
            const a = $('<a href="#" target="_blank">');
            const img = $(
              '<img src="/clientarea.png" alt="Single Sign-On link to student Client Area" "width="32" height="32" >'
            );

            try {
              const { email } = item;

              $.post("/api/staff/login", { email }, data => {
                a.append(img);
                a.attr("href", data.data.redirectTo);
              });
            } catch (err) {
              console.log(err);
            }

            return a;
          }
        },
          {
              name: "username",
              title: "cPanel",
              type: "text",
              filtering: false,
              width: 60,
              align: "center",
              itemTemplate: function (value) {
                  return '<a href="/api/staff/opencpanel/'+ value +'"  target="_blank"><img src="/cpanel.png" alt="Single Sign-On link to student cPanel account" " width="32" height="32"></a>';

                  return "";

              }
          },
       
      ]
    });

    $("#jsGrid :input").keydown(function () {
      var self = this;
      if (self.timeout) {
        clearTimeout(self.timeout);
      }

      if (self.value.length == 0) {
        $("#jsGrid").jsGrid("loadData");
      }

      self.timeout = setTimeout(function () {
        $("#jsGrid").jsGrid("loadData");
      }, 500);
    });
  }
});
