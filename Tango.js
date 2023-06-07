(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        

        // "name": "my App",
        // "internal_id": "12345",
        // "external_id": "23432",
        // "lifecycle phase": "PRODUCTION",
        // "type": "CUSTOM",
        // "in_scope": "Y"

        // Schema for app data -> Dynamic from API call
        var app_cols = [{
            id: "name",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "tangoId",
            alias: "tangoId",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "inScope",
            alias: "inScope",
            dataType: tableau.dataTypeEnum.string
        }];

        var appTable = {
            id: "app",
            alias: "Application Data",
            columns: app_cols
        };
        schemaCallback([appTable]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        var dateObj = JSON.parse(tableau.connectionData),
            //dateString = "starttime=" + dateObj.startDate + "&endtime=" + dateObj.endDate, eg data not used in POC
            apiCall = "data.json"; // Report Grid API (would have been called in schema setup)

        $.getJSON(apiCall, function(resp) {
            var feat = resp,
            tableData = [];

            //var i = 0;

            

            

            if (table.tableInfo.id == "app") {
                for (i = 0, len = feat.length; i < len; i++) {
                    tableData.push({
                        "name": feat[i].name,
                        "tangoId": feat[i].internal_id,
                        "inScope": feat[i].in_scope
                    });
                }
            }

            table.appendRows(tableData);
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form ** Would actually do on load, need to find how
    $(document).ready(function() {
        $("#submitButton").click(function() {
            var dateObj = {
                startDate: '2023-02-02', // test
                endDate: '2023-02-02',
            };

            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(dateObj.startDate) && isValidDate(dateObj.endDate)) {
                tableau.connectionData = JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Tango Feed"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
        });
    });
})();
