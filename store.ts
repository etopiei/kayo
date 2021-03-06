const electron = require('electron');
const path = require('path');
const fs = require('fs');

// Get user data path
const userDataPath = (electron.app || electron.remote.app).getPath('userData');
// We'll use the `configName` property to set the file name and path.join to bring it all together as a string
let data_path = path.join(userDataPath, 'kayo_store.json');

function getDataFromStore(key) {
    // Now read in the conf file if it exists
    try {
        let file_data = JSON.parse(fs.readFileSync(data_path));
        return file_data[key];
    } catch (err) {
        return null;
    }
}

function saveDataToStore(data, key) {
    let file_data = {};

    try {
        file_data = JSON.parse(fs.readFileSync(data_path));
    } catch (err) {
        console.log("No file yet, create now.");
    }

    file_data[key] = data;
    fs.writeFileSync(data_path, JSON.stringify(file_data));
}