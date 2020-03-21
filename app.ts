import { KayoProfile, KayoEventData } from './kayo-types';
const Hls = require('hls.js');

/*************************************************
 * GLOBAL STATE OF APP HERE
 ************************************************/
const global = {
    accessTokenObject: null,
    views: ["Login", "Profile", "Channels", "Stream"],
    current_view: 0,
    profile: null,
    stream_id: null
};

/**************************************************
 * APP INIT HERE
 * Load access token from file if it exists.
 *************************************************/ 

 let tok = getDataFromStore("token");
 console.log(`Retrieved ${tok} from store`);
 if (tok !== null) {
     global.accessTokenObject = tok;
     goProfile();
 }

/**************************************************
 * UI FUNCTIONS BELOW HERE 
 * These are the only functions that should interact with Kayo functions, and also the only functions that alter the global app state.
 *************************************************/ 

function changeView(newView) {
    let index = global.views.indexOf(newView);
    global.current_view = index;
    // Decide whether to show the back button or not
    if (global.current_view > 1) {
        document.getElementById("back-btn").style.display = 'block';
    } else {
        document.getElementById("back-btn").style.display = 'none';
    }

    // Hide all views except the new one
    global.views.filter(v => v !== newView).forEach(view => {
        document.getElementById(view).style.display = 'none';
    });
    // Show the new view
    if (newView === "Profile") {
        document.getElementById(newView).style.display = "flex";
    } else {
        document.getElementById(newView).style.display = "block";
    }
}

// Pass the input text fields to the login function
function goLogin() {
    changeView("Login");
    let userField: HTMLInputElement = document.getElementById("username") as HTMLInputElement;
    let passwordField: HTMLInputElement = document.getElementById("password") as HTMLInputElement;
    login(userField.value, passwordField.value).then((data: string) => {
        global.accessTokenObject = data; 
        // Also store this in the app store
        saveDataToStore(global.accessTokenObject, "token");
        goProfile();
    }).catch(err => {
        console.log("Failed to login! :O", err);
    });
}


// This will construct an HTML element for the profile and listen for clicks.
function constructProfile(name, id) {
    const div = document.createElement('div');
    div.innerText = name;
    div.className = "choice"
    div.addEventListener('click', () => {
        // here select profile and move to the channels screen.
        global.profile = id;
        goChannels();
    });
    return div;
}

// Get the list of profiles and display them.
function goProfile() {
    changeView("Profile");
    getProfiles(global.accessTokenObject["access_token"]).then((data: KayoProfile[]) => {
        console.log(data);
        document.getElementById("Profile").innerHTML = "";
        // Here convert profile data to some sembalance of a UI
        data.forEach(profile => {
            let name = profile.name;
            let id = profile.id;
            let profileBlock = constructProfile(name, id);
            document.getElementById("Profile").appendChild(profileBlock);
        });
    }).catch(err => {
        console.log(err);
        // Probably need to re-prompt for login here
        global.accessTokenObject = null;
        changeView("Login");
    });
}

function constructEvent(id, title, desc, sport) {
    const ev = document.createElement("div");
    ev.innerText = `${title} - ${sport}`;
    ev.className = "event";
    ev.addEventListener('click', () => {
        global.stream_id = id;
        goStream();
    });
    return ev;
}

function goChannels() {
    changeView("Channels");
    getEvents(global.accessTokenObject["access_token"], global.profile).then(data => {
        console.log(data);
        const event_container = document.createElement("div");
        event_container.id = "ev-container";
        event_container.style.display = "flex";
        document.getElementById("Channels").innerHTML = "";
        const channel_heading = document.createElement("h2");
        channel_heading.innerText = "Live Events";
        document.getElementById("Channels").appendChild(channel_heading);
        const live_events = data[1].contents;
        live_events.forEach(event => {
            let id = event.data.asset.id;
            let title = event.data.asset.title;
            let description = event.data.asset.description;
            let sport = event.data.asset.sport;
            let eventBlock = constructEvent(id, title, description, sport);
            event_container.appendChild(eventBlock);
        });
        document.getElementById("Channels").appendChild(event_container);
    }).catch(err => {
        console.log(err);
    });
}

function goStream() {
    changeView("Stream");
    getStream(global.accessTokenObject["access_token"], global.stream_id).then((response: KayoEventData) => {
        const video: HTMLMediaElement = document.getElementById('stream-el') as HTMLMediaElement;
        const source = response.recommendedStream.manifest.uri;

        if(Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED,function() {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function() {
                video.play();
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

function goBack() {
    // Here stop/remove the video player, as currently it just keeps playing if you exit :O 
    changeView(global.views[global.current_view - 1]);
}