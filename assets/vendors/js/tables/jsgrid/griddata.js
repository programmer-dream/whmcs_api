(function () {

    var db = {

        loadData: function (filter) {
            var deferred = $.Deferred();
            $.ajax({
                type: "GET",
                url: "/api/user/staffdashboardlistusers",
                dataType: "json",
                data: filter,
                success: function (response) {
                    deferred.resolve(response.data);
                }
            });
            return deferred.promise();
        },


        /* loadData: function (filter) {
             return $.grep(this.clients, function (client) {
                 return (!filter.Name || client.Name.indexOf(filter.Name) > -1)
                     && (!filter.Module_Year || client.Module_Year === filter.Module_Year)
                     && (!filter.Domain || client.Domain.indexOf(filter.Domain) > -1)
                     && (!filter.Module || client.Module === filter.Module)
                     && (filter.isActive === undefined || client.isActive === filter.isActive);
             });
         },*/

        insertItem: function (insertingClient) {
            this.clients.push(insertingClient);
        },

        updateItem: function (updatingClient) { },

        deleteItem: function (deletingClient) {
            var clientIndex = $.inArray(deletingClient, this.clients);
            this.clients.splice(clientIndex, 1);
        }

    };

    window.db = db;


    db.Modules = [
        { Name: "", Id: 0 },
        { Name: "COMP1", Id: 1 },
        { Name: "COMP2", Id: 2 },
        { Name: "BUSM1", Id: 3 },
        { Name: "COMP3386", Id: 4 },
        { Name: "COMP3987265", Id: 5 },
        { Name: "BUSM773", Id: 6 },
        { Name: "BUSM773", Id: 7 }
    ];

    db.clients = [
        {
            "Name": "Nick Williams",
            "Module_Year": "2019/20",
            "Module": 6,
            "Domain": "nickwilliams.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Otto Clay",
            "Module_Year": "2019/20",
            "Module": 6,
            "Domain": "ottoclay.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Connor Johnston",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "connorjohnston.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Lacey Hess",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "laceyhess.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Timothy Henson",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "timothyhenson.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Ramona Benton",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "ramonabenton.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Ezra Tillman",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "ezratillman.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Dante Carter",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "dantecarter.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Christopher Mcclure",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "christophermcclure.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Ruby Rocha",
            "Module_Year": "2019/20",
            "Module": 2,
            "Domain": "rubyrocha.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Imelda Hardin",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "imeldahardin.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Jonah Johns",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "jonahjohns.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Herman Rosa",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "hermanrosa.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Arthur Gay",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "arthurgay.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Xena Wilkerson",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "xenawilkerson.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Lilah Atkins",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "lilahatkins.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Malik Shepard",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "malikshepard.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Keely Silva",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "keelysilva.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Hunter Pate",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "hunterpate.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Mikayla Roach",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "mikaylaroach.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Upton Joseph",
            "Module_Year": "2019/20",
            "Module": 4,
            "Domain": "uptonjoseph.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Jeanette Pate",
            "Module_Year": "2019/20",
            "Module": 2,
            "Domain": "jeanettepate.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Kaden Hernandez",
            "Module_Year": "2019/20",
            "Module": 3,
            "Domain": "kadenhernandez.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Kenyon Stevens",
            "Module_Year": "2019/20",
            "Module": 3,
            "Domain": "kenyonstevens.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Jerome Harper",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "jeromeharper.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Jelani Patel",
            "Module_Year": "2019/20",
            "Module": 2,
            "Domain": "jalanipatel.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Keaton Oconnor",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "keatonoconnor.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Bree Johnston",
            "Module_Year": "2019/20",
            "Module": 2,
            "Domain": "breejohnston.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Maisie Hodges",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "maisiehodges.educationhost.co.uk.",
            "isActive": false
        },
        {
            "Name": "Kuame Calhoun",
            "Module_Year": "2019/20",
            "Module": 2,
            "Domain": "kuamecalhoun.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Carlos Cameron",
            "Module_Year": "2019/20",
            "Module": 5,
            "Domain": "carloscameron.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Fulton Parsons",
            "Module_Year": "2019/20",
            "Module": 7,
            "Domain": "fulonparsons.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Wallace Christian",
            "Module_Year": "2019/20",
            "Module": 3,
            "Domain": "wallacechristian.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Caryn Maldonado",
            "Module_Year": "2019/20",
            "Module": 1,
            "Domain": "carynmaldonado.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Whilemina Frank",
            "Module_Year": "2018/19",
            "Module": 7,
            "Domain": "whileminafrank.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Emery Moon",
            "Module_Year": "2018/19",
            "Module": 4,
            "Domain": "emerymoon.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Emery Moon",
            "Module_Year": "2018/19",
            "Module": 6,
            "Domain": "emerymoon.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Emery Moon",
            "Module_Year": "2018/19",
            "Module": 7,
            "Domain": "emerymoon.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Lawrence Conway",
            "Module_Year": "2018/19",
            "Module": 1,
            "Domain": "lawrenceconway.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Kalia Nicholson",
            "Module_Year": "2018/19",
            "Module": 5,
            "Domain": "kalianicholson.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Brielle Baxter",
            "Module_Year": "2018/19",
            "Module": 3,
            "Domain": "briellebaxter.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Valentine Brady",
            "Module_Year": "2018/19",
            "Module": 7,
            "Domain": "valentinebrady.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Rebecca Gardner",
            "Module_Year": "2018/19",
            "Module": 4,
            "Domain": "rebeccagardner.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Vladimir Tate",
            "Module_Year": "2018/19",
            "Module": 1,
            "Domain": "vladimirtate.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Vernon Hays",
            "Module_Year": "2018/19",
            "Module": 4,
            "Domain": "vernonhays.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Allegra Hull",
            "Module_Year": "2018/19",
            "Module": 4,
            "Domain": "allegrahull.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Hu Hendrix",
            "Module_Year": "2018/19",
            "Module": 7,
            "Domain": "huhendrix.educationhost.co.uk",
            "isActive": true
        },
        {
            "Name": "Kenyon Battle",
            "Module_Year": "2018/19",
            "Module": 2,
            "Domain": "kenyonbattle.educationhost.co.uk",
            "isActive": false
        },
        {
            "Name": "Gloria Nielsen",
            "Module_Year": "2018/19",
            "Module": 4,
            "Domain": "glorianielsen.educationhost.co.uk",
            "isActive": true
        }
    ];

    db.users = [
        {
            "ID": "x",
            "Account": "A758A693-0302-03D1-AE53-EEFE22855556",
            "Name": "Carson Kelley",
            "RegisterDate": "2002-04-20T22:55:52-07:00"
        },
        {
            "Account": "D89FF524-1233-0CE7-C9E1-56EFF017A321",
            "Name": "Prescott Griffin",
            "RegisterDate": "2011-02-22T05:59:55-08:00"
        },
        {
            "Account": "06FAAD9A-5114-08F6-D60C-961B2528B4F0",
            "Name": "Amir Saunders",
            "RegisterDate": "2014-08-13T09:17:49-07:00"
        },
        {
            "Account": "EED7653D-7DD9-A722-64A8-36A55ECDBE77",
            "Name": "Derek Thornton",
            "RegisterDate": "2012-02-27T01:31:07-08:00"
        },
        {
            "Account": "2A2E6D40-FEBD-C643-A751-9AB4CAF1E2F6",
            "Name": "Fletcher Romero",
            "RegisterDate": "2010-06-25T15:49:54-07:00"
        },
        {
            "Account": "3978F8FA-DFF0-DA0E-0A5D-EB9D281A3286",
            "Name": "Thaddeus Stein",
            "RegisterDate": "2013-11-10T07:29:41-08:00"
        },
        {
            "Account": "658DBF5A-176E-569A-9273-74FB5F69FA42",
            "Name": "Nash Knapp",
            "RegisterDate": "2005-06-24T09:11:19-07:00"
        },
        {
            "Account": "76D2EE4B-7A73-1212-F6F2-957EF8C1F907",
            "Name": "Quamar Vega",
            "RegisterDate": "2011-04-13T20:06:29-07:00"
        },
        {
            "Account": "00E46809-A595-CE82-C5B4-D1CAEB7E3E58",
            "Name": "Philip Galloway",
            "RegisterDate": "2008-08-21T18:59:38-07:00"
        },
        {
            "Account": "C196781C-DDCC-AF83-DDC2-CA3E851A47A0",
            "Name": "Mason French",
            "RegisterDate": "2000-11-15T00:38:37-08:00"
        },
        {
            "Account": "5911F201-818A-B393-5888-13157CE0D63F",
            "Name": "Ross Cortez",
            "RegisterDate": "2010-05-27T17:35:32-07:00"
        },
        {
            "Account": "B8BB78F9-E1A1-A956-086F-E12B6FE168B6",
            "Name": "Logan King",
            "RegisterDate": "2003-07-08T16:58:06-07:00"
        },
        {
            "Account": "06F636C3-9599-1A2D-5FD5-86B24ADDE626",
            "Name": "Cedric Leblanc",
            "RegisterDate": "2011-06-30T14:30:10-07:00"
        },
        {
            "Account": "FE880CDD-F6E7-75CB-743C-64C6DE192412",
            "Name": "Simon Sullivan",
            "RegisterDate": "2013-06-11T16:35:07-07:00"
        },
        {
            "Account": "BBEDD673-E2C1-4872-A5D3-C4EBD4BE0A12",
            "Name": "Jamal West",
            "RegisterDate": "2001-03-16T20:18:29-08:00"
        },
        {
            "Account": "19BC22FA-C52E-0CC6-9552-10365C755FAC",
            "Name": "Hector Morales",
            "RegisterDate": "2012-11-01T01:56:34-07:00"
        },
        {
            "Account": "A8292214-2C13-5989-3419-6B83DD637D6C",
            "Name": "Herrod Hart",
            "RegisterDate": "2008-03-13T19:21:04-07:00"
        },
        {
            "Account": "0285564B-F447-0E7F-EAA1-7FB8F9C453C8",
            "Name": "Clark Maxwell",
            "RegisterDate": "2004-08-05T08:22:24-07:00"
        },
        {
            "Account": "EA78F076-4F6E-4228-268C-1F51272498AE",
            "Name": "Reuben Walter",
            "RegisterDate": "2011-01-23T01:55:59-08:00"
        },
        {
            "Account": "6A88C194-EA21-426F-4FE2-F2AE33F51793",
            "Name": "Ira Ingram",
            "RegisterDate": "2008-08-15T05:57:46-07:00"
        },
        {
            "Account": "4275E873-439C-AD26-56B3-8715E336508E",
            "Name": "Damian Morrow",
            "RegisterDate": "2015-09-13T01:50:55-07:00"
        },
        {
            "Account": "A0D733C4-9070-B8D6-4387-D44F0BA515BE",
            "Name": "Macon Farrell",
            "RegisterDate": "2011-03-14T05:41:40-07:00"
        },
        {
            "Account": "B3683DE8-C2FA-7CA0-A8A6-8FA7E954F90A",
            "Name": "Joel Galloway",
            "RegisterDate": "2003-02-03T04:19:01-08:00"
        },
        {
            "Account": "01D95A8E-91BC-2050-F5D0-4437AAFFD11F",
            "Name": "Rigel Horton",
            "RegisterDate": "2015-06-20T11:53:11-07:00"
        },
        {
            "Account": "F0D12CC0-31AC-A82E-FD73-EEEFDBD21A36",
            "Name": "Sylvester Gaines",
            "RegisterDate": "2004-03-12T09:57:13-08:00"
        },
        {
            "Account": "874FCC49-9A61-71BC-2F4E-2CE88348AD7B",
            "Name": "Abbot Mckay",
            "RegisterDate": "2008-12-26T20:42:57-08:00"
        },
        {
            "Account": "B8DA1912-20A0-FB6E-0031-5F88FD63EF90",
            "Name": "Solomon Green",
            "RegisterDate": "2013-09-04T01:44:47-07:00"
        }
    ];

}());