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

	$.ajax({
		type: 'GET',
		url: '/api/user/staffdashboardgetmodules',
		dataType: 'json',
		success: function (modules) {
			modules.unshift({ value: '' })

			$.ajax({
				type: 'GET',
				url: '/api/user/staffdashboardgetyears',
				dataType: 'json',
				success: function (years) {
					years.unshift({ ModuleStartDate: '' })
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
		return element.toString().toLowerCase().includes(filters.toString().toLowerCase());
	}

	function isModule(filters, element) {
		return filters.value === '' || filters.value === element.value;
	}

	function isUserId(filters, element) {
		return filters.userid === '' || element.userid == filters.userid;
	}

	function isFullname(filters, element) {
		return filters.fullname === '' || contains(element.fullname, filters.fullname);
	}

	function isUserName(filters, element) {
		return filters.username === '' || contains(element.username, filters.username);
	}

	function isDomain(filters, element) {
		return filters.domain === '' || contains(element.domain, filters.domain);
	}

	function isDomainModule(filters, element) {
		return filters.domainmodule === '' || contains(element.domainmodule, filters.domainmodule);
	}

	function isYears(filters, element) {
		return filters.ModuleStartDate === '' || element.ModuleStartDate == filters.ModuleStartDate;
	}

	function filterResults(filters, results) {
		var filtered = [];
		for (let i = 0; i < results.length; i++) {
			const element = results[i];
			if (
				isModule(filters, element)
				&& isUserId(filters, element)
				&& isFullname(filters, element)
				&& isUserName(filters, element)
				&& isDomain(filters, element)
				&& isDomainModule(filters, element)
				&& isYears(filters, element)
			) {
				filtered.push(element)
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
			pageSize: 15,
			pageButtonCount: 5,

			//for loadData method Need to set auto load true
			autoload: true,
			pageSize: 50,
			pageButtonCount: 5,

			noDataContent: "Directory is empty",

			controller: {
				loadData: function (filters) {
					var deferred = $.Deferred();
					$.ajax({
						type: 'GET',
						url: '/api/user/staffdashboardlistusers',
						dataType: 'json',
						success: function (response) {
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

			fields: [{
				name: "userid",
				title: 'User ID',
				type: "text",
				width: 40,
				filtering: true,
				autosearch: true
			}, {
				name: "fullname",
				title: 'Name',
				type: "text",
				filtering: true,
			}, {
				name: "username",
				title: 'Username',
				type: "text",
				filtering: true,
			}, {

				name: "domain", type: "text",
				title: 'Domain',
				itemTemplate: function (value) {
					// return $("<a>").attr("href", value).text(value);
					return '<a href="http://' + value + '" target="_blank">' + value + '</a>';
				},
				width: 180,
				filtering: true,
			}, {
				name: "value",
				title: 'Module',
				type: "select",
				filtering: true,
				items: modules,
				valueField: "value",
				textField: "value",
				selectedIndex: -1,
			}, {

				name: "domainmodule", type: "text",
				title: 'Module Domain',
				itemTemplate: function (value) {
					// return $("<a>").attr("href", value).text(value);
					return '<a href="http://' + value + '" target="_blank">' + value + '</a>';
				},
				width: 180,
				filtering: true,
			}, {
				name: "ModuleStartDate",
				title: 'Module Year',
				type: "select",
				filtering: true,
				items: years,
				valueField: "ModuleStartDate",
				textField: "ModuleStartDate",
				selectedIndex: -1,
			}, {
				type: "control"
			}
			]
		});

		$("#jsGrid :input").keydown(function () {
			var self = this;
			if (self.timeout) {
				clearTimeout(self.timeout);
			}

			if (self.value.length == 0) {
				$("#jsGrid").jsGrid('loadData');
			}

			self.timeout = setTimeout(function () {
				$("#jsGrid").jsGrid('loadData');
			}, 500);
		});
	}
});
