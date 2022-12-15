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

  
  populateGrid();

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

  function isUserDomain(filters, element) {
    return (
      filters.domain_name === "" || contains(element.domain_name, filters.domain_name)
    );
  }

  function isStaff(filters, element) {
    return (
      filters.Is_Staff === "" || contains(element.Is_Staff, filters.Is_Staff)
    );
  }

  function isAdmin(filters, element) {
    return (
      filters.Is_Admin === "" || contains(element.Is_Admin, filters.Is_Admin)
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
       isEmail(filters, element) &&
        isStaff(filters, element) &&
        isAdmin(filters, element) &&
        isUserDomain(filters, element)
      ) {
        filtered.push(element);
      }
    }
    return filtered;
  }

  function populateGrid() {
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
            url: "/api/user/listusers",
            dataType: "json",
            success: function (users) {
              let response = users;
              console.log(response, "<<< data")
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
          width: 75,
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
          name: "domain_name",
          type: "text",
          title: "User domain",
          align: "center",
          itemTemplate: function (value) {
            return (
              '<a href="http://' + value + '" target="_blank">' + value + "</a>"
            );
          },
          width: 220,
          filtering: true
        },
        {
          name: "Is_Staff",
          title: "Is staff?",
          width: 65,
          align: "center",
          type: "text",
          filtering: true
        },
        {
          name: "Is_Admin",
          title: "Is admin?",
          width: 65,
          align: "center",
          type: "text",
          filtering: true
        },
        {
                    name: "ID",
                    title: "Remove user",
                    type: "text",
                    filtering: false,
                    width: 90,
                    align: "center",
                    itemTemplate: function (value,data) {

                        var images='<span class="material-symbols-outlined" data-id="'+value+'">person_remove</span>';
                        
                        return $(images)
                            .on("click", function() {
                                var id=$(this).attr("data-id")
                                
                                swal({
                                    title: "Confirm Your Action",
                                    text: "Delete selected account?",
                                    icon: "warning",
                                    //buttons: true,
                                    buttons: ["No, do not delete the accouts.", "Yes, permanently remove the selected accounts."],
                                    dangerMode: true,
                                })
                                    .then((willDelete) => {
                                        if (willDelete) {
                                            
                                            var settings= {
                                                type: "POST",
                                                dataType: "json",
                                                url: "/api/user/removeUser/"+id,
                                                success: function(response) {
                                                    swal("Account has been Deleted", {
                                                        icon: "success",
                                                    });
                                                    setTimeout(function(){
                                                    	location.reload();
                                                    }, 2000);
                                                    
                                                },
                                                error: function (err, type, httpStatus) {
                                                    alert('error has occured');
                                                }
                                            };
                                            $.ajax(settings);
                                        } 
                                    });

                                return false;
                            });
                        return "";
                    }
                }
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
