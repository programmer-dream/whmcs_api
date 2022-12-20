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
      url: "/api/user/getModuleYearLocation",
      dataType: "json",
      success: function (response) {
        populateGrid(response.moduleCode, response.year, response.location);
        
      },
      error: function (error) {
        console.log({ error: error });
      }
    });
  
  function contains(element, filters) {
    return element
      .toString()
      .toLowerCase()
      .includes(filters.toString().toLowerCase());
  }

  function isID(filters, element) {
    return (
      filters.ID === "" || contains(element.ID, filters.ID)
    );
  }
  function isFullname(filters, element) {
    return (
      filters.fullname === "" || contains(element.fullname, filters.fullname)
    );
  }

  function isUsername(filters, element) {
    return (
      filters.username === "" || contains(element.username, filters.username)
    );
  }
  function isDomain(filters, element) {
    return (
      filters.domain_name === "" || contains(element.domain_name, filters.domain_name)
    );
  }
  function isModule(filters, element) {
    return (
      filters.module_code === "" || contains(element.module_code, filters.module_code)
    );
  }
  function isLocation(filters, element) {
    return (
      filters.location_name === "" || contains(element.location_name, filters.location_name)
    );
  }
  function isDate(filters, element) {
    return (
      filters.mdate === "" || contains(element.mdate, filters.mdate)
    );
  }
  

  function filterResults(filters, results) {
    var filtered = [];
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      if (isID(filters, element) && 
        isFullname(filters, element) && 
        isUsername(filters, element) && 
        isDomain(filters, element) &&
        isLocation(filters, element) &&
        isDate(filters, element) &&
        isModule(filters, element)
      
      ) {
        filtered.push(element);
      }
    }
    return filtered;
  }

  function populateGrid(modules, years, location) {
    
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
      },

      fields: [
        {
          name: "ID",
          title: "ID",
          type: "text",
          width: 30,
          align: "center",
          filtering: true,
          autosearch: true
        },
        {
          name: "fullname",
          title: "Name",
          align: "center",
          type: "text",
          width: 60,
          filtering: true
        },
        {
          name: "username",
          title: "User",
          width: 40,
          align: "center",
          type: "text",
          filtering: true
        },
        {
          name: "module_code",
          title: "Module Code",
          width: 55,
          type: "select",
          filtering: true,
          items: modules,
          valueField: "module_code",
          textField: "module_code",
          selectedIndex: -1,
          itemTemplate: function (value, item) {
            
            return (
              '<span  title="'+value+'- '+item.module_name+'">' + value + "</span>"
            );
          }
        },
        {
          name: "domain_name",
          type: "text",
          title: "Module Domain",
          align: "center",
          itemTemplate: function (value) {
            
            return (
              '<a href="http://' + value + '" target="_blank">' + value + "</a>"
            );
          },
          width: 200,
          filtering: true
        },
        {
          name: "location_name",
          title: "Teaching Location",
          width: 80,
          type: "select",
          filtering: true,
          items: location,
          valueField: "name",
          textField: "name",
          selectedIndex: -1
        },
        {
          name: "mdate",
          title: "Module Year",
          width: 55,
          type: "select",
          filtering: true,
          items: years,
          valueField: "year",
          textField: "year",
          selectedIndex: -1
        },
        {
          name: "username",
          title: "Client Area",
          type: "text",
          filtering: false,
          width: 45,
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
            width: 30,
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
