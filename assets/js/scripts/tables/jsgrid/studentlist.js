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

  
  //populateGrid();

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

  function isUserId(filters, element) {
    return (
      filters.user_ID === "" || contains(element.user_ID, filters.user_ID)
    );
  }

  function isEmail(filters, element) {
    return (
      filters.email === "" || contains(element.email, filters.email)
    );
  }

  function filterResults(filters, results) {
    var filtered = [];
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      if (
        isID(filters, element) &&
        isFullname(filters, element) &&
        isUserId(filters, element) &&
        isEmail(filters, element)
      ) {
        filtered.push(element);
      }
    }
    return filtered;
  }

  function populateGrid(courseId, blockId) {
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
            url: "/api/user/studentList",
            dataType: "json",
            data:{courseId, blockId},
            success: function (users) {
              let response = users;
              //console.log(response, "<<< data")
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
          width: 50,
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
          name: "user_ID",
          title: "User ID",
          width: 70,
          align: "center",
          type: "text",
          filtering: true
        },
        {
          name: "email",
          title: "User email",
          align: "center",
          width: 200,
          type: "text",
          filtering: true
        },
        {
          name: "block_is_extended",
          title: "Standard Extension",
          width: 90,
          align: "center",
          type: "html",
          filtering: false,
          itemTemplate: function (isEnabled, item) {
            var isChecked  = ''
            if(isEnabled == '1')
              isChecked = 'checked'
            return (
              '<div class="form-group mt-1" ><input data-id="'+item.ID+'" type="checkbox" class="switchery switcheryExtension" data-size="xs" '+isChecked+'/></div>'
            );
          }
        },
        {
          name: "is_block_resit_enabled",
          title: "Re-sit extension",
          width: 90,
          align: "center",
          type: "html",
          filtering: false,
          itemTemplate: function (isEnabled, item) {
            var isChecked  = ''
            if(isEnabled == '1')
              isChecked = 'checked'
            return (
              '<div class="form-group mt-1" ><input data-id="'+item.ID+'" type="checkbox" class="switchery switcheryResit" data-size="xs" '+isChecked+'/></div>'
            );
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

  $('#block').on('change',function(){
      courseId = $('#course').val();
      blockId = $('#block').val();
      
      if(courseId && blockId){
        populateGrid(courseId, blockId);
      }
      $("#jsGrid").show();
  })

  $('#course').on('change',function(){
      $("#jsGrid").hide();
  })

});
