define(function (require) {

    // Load websdk
    var WebSdk = require('bimplus/websdk');

    // Load Client integration
    var WebClient = require('bimplus/webclient');

    // Use environment dev,stage or prod
    var environment = "stage";

    // Initalize api wrapper
    var api = new WebSdk.Api(WebSdk.createDefaultConfig(environment));

    // Set some control variables
    var currentTeam;
    var currentProject;
    var currentObject;
    var currentToken;

    var portal;
    var explorer;

    // Create the external client for communication with the bimplus controls
    var externalClient = new WebClient.ExternalClient("MyClient");

    // Make authorization request to Bimplus, providing user name, password and application id
    api.authorize.post('demoEmail@allplan.com','password', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX').done(function(data,status,xhr) {
        api.setAccessToken(data.access_token);
        currentToken = data.access_token;

        // Create the proxy classes for explorer and portal, binding it to an exisiting iframe id
        portal = new WebClient.BimPortal('bimplusPortal',api.getAccessToken(),externalClient,environment);
        explorer = new WebClient.BimExplorer('bimplusExplorer',api.getAccessToken(),externalClient,environment);

        // Initialize the client to listen for messages
        externalClient.initialize();

        // Add message handler for team changed event
        externalClient.addMessageHandler("TeamChanged",function(msg){
            currentTeam = msg.id;
        });

        // Add message handler for project selected event
        externalClient.addMessageHandler("ProjectSelected",function(msg){
            currentProject = msg.id;

            explorer.load(currentTeam,currentProject);
        });

        // Add message handler for object selected event
        externalClient.addMessageHandler("ObjectSelected",function(msg){
            currentObject = msg.Id;
        });

        //
        portal.load();

    }).fail(function(data) {
        // Authorization failed
        alert("Login to Bimplus failed!");
    });;

    $("#resetView").click(function(){ 
        // Send reset view message to explorer iframe
        explorer.sendMessage('ResetView');
    });

    $("#centerObject").click(function(){ 
        // Send center object message to explorer iframe
        if(currentObject){
            explorer.sendMessage('CenterObject',{
                id : currentObject,
                flyTo : true
            });
        }else{
            alert("Please select object in BimExplorer!");
        }
    });

    $("#objectProperties").click(function(){ 
        // Send center object message to explorer iframe
        if(currentObject){
            window.open('objectProperties.html?token='+currentToken+'&project='+currentProject+'&team='+currentTeam+'&object='+currentObject,'_blank',
                'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=850');
        }else{
            alert("Please select object in BimExplorer!");
        }				
    });
    $("#projectNavigationBar").click(function(){ 
        // Send center object message to explorer iframe
        if(currentProject){
            window.open('projectNavigationBar.html?token='+currentToken+'&project='+currentProject+'&team='+currentTeam,'_blank',
                'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=250,height=850');
        }else{
            alert("Please open project!");
        }				
    });
});
