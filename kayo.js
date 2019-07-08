/**
 *  This method logs into Kayo and returns an access token for use in subsequent requests. 
 * @param {String} username Kayo username to login (This should be an email).
 * @param {String} password Kayo password.
 * @returns A promise which resolves with JSON containing the access token, or rejects with an error.
 */
function login(username, password) {
    return new Promise((resolve, reject) => {
        fetch('https://auth.kayosports.com.au/oauth/token', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                audience: "kayosports.com.au",
                grant_type: "http://auth0.com/oauth/grant-type/password-realm",
                scope: "openid offline_access",
                realm: "prod-martian-database",
                client_id: "qjmv9ZvaMDS9jGvHOxVfImLgQ3G5NrT2",
                username: username,
                password: password
            })
        }).then(res => res.json()).then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 *  This method returns an object with the user's profiles to login with.
 * @param {String} accessToken The access token obtained from logging in.
 * @returns A Promise which resolves with the profile data.
 */
function getProfiles(accessToken) {
    return new Promise((resolve, reject) => {
        fetch("https://profileapi.kayosports.com.au/user/profile", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
        }).then(res => res.json()).then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * This method retrieves current live events on Kayo. 
 * @param {String} accessToken The access token from logging in.
 * @param {String} profileId The profile ID to use.
 * @returns A promise which resolves with live event data. Or rejects with error.
 */
function getEvents(accessToken, profileId) {
    return new Promise((resolve, reject) => {
        fetch(`https://vccapi.kayosports.com.au/v2/content/types/landing/names/sports?evaluate=3&profile=${profileId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        }).then(res => res.json()).then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * This method returns the URI to use to access the HLS Stream of a Kayo asset. 
 * @param {String} accessToken The token obtained from logging in.
 * @param {String} streamId The id of the stream to retrieve data for.
 * @returns A promise which has the stream data, or rejects with an error.
 */
function getStream(accessToken, streamId) {
    return new Promise((resolve, reject) => {
        fetch(`https://vmndplay.kayosports.com.au/api/v1/asset/${streamId}/play.json?fields=alternativeStreams`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        }).then(res => res.json()).then(data => {
            resolve(data);
        }).catch(err => {
            reject(err);
        })
    });
}