import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import {getFirestore, collection, getDocs, addDoc} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCYAF9bwLv6Cc11yn50pNAWCSvMpAqNjl4",
    authDomain: "votemgp.firebaseapp.com",
    databaseURL: "https://votemgp.firebaseio.com",
    projectId: "votemgp",
    storageBucket: "votemgp.appspot.com",
    messagingSenderId: "372207279854",
    appId: "1:372207279854:web:2cc4399a7db13484ba9dff"
  };

var database;
var userRef;
var pointsRef;
var partyRef;
var songNr = 0;
var radios = document.querySelectorAll('input[type=radio]');
var total = document.querySelector('#listTotal');
var categories = [
    {
        name: "songGroup",
        value: 1
    },
    {
        name: "showGroup",
        value: 1
    },
    {
        name: "costumeGroup",
        value: 1
    },
    {
        name: "xFactorGroup",
        value: 1
    }
];
// var prePath = '/projects/votemgp';
var prePath = '';
window.onload = function () {
    initializeApp(firebaseConfig);
    database = getFirestore();
    userRef = collection(database, 'users'); // database.ref('users');
    pointsRef = collection(database, 'points'); // database.ref('points');
    partyRef = collection(database, 'parties'); // database.ref('parties');
    // Check for user.
    if (userExists() !== null) {
        console.log('Found user: ' + userExists());
        findNextSong(extractUserInformation('votemgp2017cookie')[2]);
        // If user does not exist
    }
    else {
        // Send user to register page (unless they are registering a party).
        if (window.location.pathname !== (prePath + '/party.html') && window.location.pathname !== (prePath + '/start.html') && window.location.pathname !== (prePath + '/leaderboard.html')) {
            window.location.pathname = (prePath + '/start.html');
        }
        // Get information from user.
        if (document.querySelector('#registerButton')) {
            var button = document.querySelector("#registerButton");
            button.onclick = function () {
                var party = document.querySelector('input[name="partyGroup"]:checked').value;
                var name = document.querySelector('input[name="nameBox"]').value;
                console.log('name: ' + name);
                console.log('party: ' + party);
                createNewUser(escapeInput(name), escapeInput(party));
                window.location.href = (prePath + '/index.html');
            }
        }
    }
    if (document.querySelector('#registerButton')) {
        updatePartyList()
    }
    // Check for overview page.
    if (document.querySelector("#topLabel")) {
        addESCInfoToPage();
        updatePointsRows();
        updateProfileName();
        var key = extractUserInformation('votemgp2017cookie')[2];
        findNextSong(key, songNr);
    }
    // Check for vote page
    if (document.querySelector("#voteButton")) {
        var button = document.querySelector("#voteButton");
        button.onclick = function () {
            var key = extractUserInformation('votemgp2017cookie')[2];
            sendPointsToDatabase(key, songNr);
            findNextSong(key, songNr);
            var parent = button.parentElement;
            // Animate loading
            parent.classList.add("clicked");
            setTimeout((function () {
                parent.classList.add("success");
            }), 2600);
            setTimeout((function () {
                parent.classList = 'row';
            }), 2600);
            setTimeout((function () {
                document.querySelector('#top').scrollIntoView({
                    behavior: 'smooth'
                });
            }), 2600);
        }
    }
    if (document.querySelector('#registerPartyButton')) {
        getPartyDataFromForm()
    }
    // var ref = firebase.database().ref("users");
    // ref.orderByChild("userName").equalTo('Petter').on("child_added", function(snapshot) {
    //     console.log(snapshot.key);
    // });
}
function test() {}
// ---                  --- //
// *** Set-up functions *** //
// ---                  --- //
function createDataStructure(_nrOfSongs) {
    var data = {
        points: []
    };
    var p = [];
    for (var i = 0; i < _nrOfSongs; i++) {
        var e = new Element(0, 0, 0, 0, 0);
        data.points.push(e);
    }
    return data;
}

function Element(_song, _show, _costume, _xfactor, _total) {
    this.song = _song;
    this.show = _show;
    this.costume = _costume;
    this.xfactor = _xfactor;
    this.total = _total;
    this.done = false;
}

function addESCInfoToPage() {
    var epn = document.getElementsByClassName('escParticipantNr');
    var ecn = document.getElementsByClassName('escCountryName');
    var est = document.getElementsByClassName('escSongTitle');
    for (var i = 0; i < 26; i++) {
        var flag = document.createElement('span');
        var nCode = 'flag-icon-' + esc2017info[i].nationCode;
        var nName = ecn[i].getElementsByTagName('p')[0];
        flag.className += "flag-icon " + nCode;
        epn[i].getElementsByTagName('p')[0].innerText = i + 1;
        ecn[i].getElementsByTagName('p')[0].innerText = esc2017info[i].nation;
        ecn[i].getElementsByTagName('p')[0].className += 'show-for-medium';
        ecn[i].appendChild(flag);
        est[i].getElementsByTagName('i')[0].innerText = esc2017info[i].title;
    }
}
// ---                  --- //
// *** Update functions *** //
// ---                  --- //
function updateProgressBar(progress) {
    var newProgress = calculateProgress(progress);
    var span = document.querySelector('#progressBar span');
    var p = document.querySelector('#progressBar span p');
    span.style['width'] = newProgress + '%';
    p.innerText = newProgress + '%';
}

/* function updateOutput(name, val) {
    var selector = "#" + name.id + "Output";
    document.querySelector(selector).innerText = convertToMGPPoints(Number(val));
    updateVotePagePoints();
} */

/* function updateVotePagePoints() {
    var song = convertToMGPPoints(Number(document.querySelector('#songRange').value));
    var show = convertToMGPPoints(Number(document.querySelector('#showRange').value));
    var costume = convertToMGPPoints(Number(document.querySelector('#costumeRange').value));
    var xFactor = convertToMGPPoints(Number(document.querySelector('#xFactorRange').value));
    var total = song + show + costume + xFactor;
    document.querySelector('#score').innerText = "Poengsum: " + total;
} */

function updateVotePageInfo(_nr) {
    document.querySelector('#songName i').innerText = esc2017info[_nr].title;
    document.querySelector('#countryName strong').innerText = esc2017info[_nr].nation;
    document.querySelector('#songNr').innerText = Number(_nr) + 1;
    updateProfileButton();
}

function updateProfileName() {
    document.querySelector('#userName i').innerText = extractUserInformation('votemgp2017cookie')[0];
}

function updateProfileButton()  {
    document.querySelector('#profileButton').innerText = extractUserInformation('votemgp2017cookie')[0];
}

function resetVotePagePoints() {
    document.getElementById('1_1').checked = true;
    document.getElementById('2_1').checked = true;
    document.getElementById('3_1').checked = true;
    document.getElementById('4_1').checked = true;
    total.innerText = "4";
}

function updatePointsRows() {
    var _key = extractUserInformation('votemgp2017cookie')[2];
    database.ref('points').child(_key + '/points').once('value').then(function (snapshot) {
        var arr = document.getElementsByClassName('pointsRow');
        for (var i = 0; i < arr.length; i++) {
            var mobileView = arr[i].querySelectorAll('.mobileView .points');
            var hideForSmallOnly = arr[i].querySelectorAll('.hide-for-small-only .points');
            mobileView[0].innerText = snapshot.child(i).val().song;
            mobileView[1].innerText = snapshot.child(i).val().show;
            mobileView[2].innerText = snapshot.child(i).val().costume;
            mobileView[3].innerText = snapshot.child(i).val().xfactor;
            mobileView[4].innerText = snapshot.child(i).val().total;
            hideForSmallOnly[0].innerText = snapshot.child(i).val().song;
            hideForSmallOnly[1].innerText = snapshot.child(i).val().show;
            hideForSmallOnly[2].innerText = snapshot.child(i).val().costume;
            hideForSmallOnly[3].innerText = snapshot.child(i).val().xfactor;
            hideForSmallOnly[4].innerText = snapshot.child(i).val().total;
        };
    });
}

function updatePartyList() {
    getDocs(partyRef)
    .then(
        (snapshot) => {
            console.log(snapshot.docs)
        }
    )
    database.ref('parties').once('value').then(function (snapshot) {
        console.log(snapshot.val());
        var partiesFromDB = snapshot.val();
        var keys = Object.keys(partiesFromDB);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var partyName = unEscapeInput(partiesFromDB[k].partyName);
            console.log(unEscapeInput(partiesFromDB[k].partyName));
            var host = unEscapeInput(partiesFromDB[k].host);
            var partyListNode = createPartyListNode(partyName, host);
            document.querySelector('#partySelectSection').appendChild(partyListNode);
            console.log(partyName, host, keys[i]);
        }
    });
}

function createPartyListNode(_partyName, _host) {
    var listElement = document.createElement('li');
    var inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'radio');
    inputElement.setAttribute('name', 'partyGroup');
    inputElement.setAttribute('value', _partyName);
    var div = document.createElement('div');
    var span = document.createElement('span');
    span.innerText = _partyName;
    var p = document.createElement('p');
    p.className = 'partyHost';
    p.innerText = _host;
    div.appendChild(span);
    div.appendChild(p);
    listElement.appendChild(inputElement);
    listElement.appendChild(div);
    return listElement;
}
function changeHandler(event) {
    var cat = categories.find(x => x.name === this.name);
    cat.value = Number(this.value);
    total.innerText = categories[0].value + categories[1].value + categories[2].value + categories[3].value;
}

Array.prototype.forEach.call(radios, function (radio) {
    radio.addEventListener('change', changeHandler);
});

// ---                --- //
// *** User functions *** //
// ---                --- //
function getPartyDataFromForm() {
    var button = document.querySelector("#registerPartyButton");
    button.onclick = function () {
        console.log('Part button clicked!');
        var partyName = document.querySelector('input[name="partyNameBox"]').value;
        var host = document.querySelector('input[name="hostNameBox"]').value;
        console.log('host: ' + host);
        console.log('partyName: ' + partyName);
        addPartiesToDatabase(escapeInput(partyName), escapeInput(host));
    }
}

function getUserDataFromForm() {
    var button = document.querySelector("#registerButton");
    button.onclick = function () {
        var party = document.querySelector('input[name="partyGroup"]:checked').value;
        var name = document.querySelector('input[name="nameBox"]').value;
        console.log('name: ' + name);
        console.log('party: ' + party);
        createNewUser(escapeInput(name), escapeInput(party));
        window.location.href = '/index.html';
    }
}

function createNewUser(_userName, _party) {
    var p = pointsRef.push(createDataStructure(26));
    var generatedID = generateID(escapeInput(_userName), escapeInput(_party), p.key);
    var data = {
        userName: _userName
        , party: _party
        , id: generatedID
    };
    var u = userRef.push(data);
    console.log('pused user: ' + u);
    createCookie('votemgp2017cookie', generatedID, 1);
}

function generateID(userName, party, pKey) {
    return userName + '@' + party + '?' + pKey;
}

function userExists() {
    var name = 'votemgp2017cookie';
    return readCookie(name);
}

function extractUserInformation(mgpcookie) {
    var arr = [];
    var c = readCookie(mgpcookie);
    var at = c.indexOf('@');
    var name = c.substr(0, at);
    var questionMark = c.indexOf('?');
    var party = c.substr(at + 1, questionMark - at - 1);
    var key = c.substr(questionMark + 1, c.length - questionMark - 1);
    arr.push(name);
    arr.push(party);
    arr.push(key);
    return arr;
}
// ---                  --- //
// *** Cookie functions *** //
// ---                  --- //
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}
// ---                    --- //
// *** Database functions *** //
// ---                    --- //
function getUsersFromDatabase() {
    userRef.once('value', getUserData, errData);
}

function getUserData(data) {
    var users = data.val();
    var keys = Object.keys(users);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var n = users[k].userName;
        var p = users[k].party;
        var id = users[k].id;
        console.log(k, n, p, id);
    }
}

function errData(err) {
    console.log('Error:');
    console.log(err);
}

function getPointsFromDatabase(_key, _nr) {
    database.ref('points').child(_key + '/points/' + _nr).once('value').then(function (snapshot) {
        console.log(snapshot.val());
    });
}

function setPoints(_key, _nr, _song, _show, _costume, _xfactor, _total) {
    console.log(_key, _nr);
    database.ref('points').child(_key + '/points/' + _nr).set({
        song: _song
        , show: _show
        , costume: _costume
        , xfactor: _xfactor
        , total: _total
        , done: true
    });
}

function sendPointsToDatabase(_key, _nr) {
    console.log("Button clicked. And lots of points added.");
    var song = categories[0].value;
    var show = categories[1].value;
    var costume = categories[2].value;
    var xFactor = categories[3].value;
    var total = song + show + costume + xFactor;
    setPoints(_key, _nr, song, show, costume, xFactor, total);
    resetVotePagePoints();
}

function addPartiesToDatabase(_partyName, _host) {
    console.log('Add party to database.');
    database.ref('parties').push({
        partyName: _partyName
        , host: _host
    });
}

function findNextSong(_key) {
    database.ref('points').child(_key + '/points').once('value').then(function (snapshot) {
        var pointsObjects = snapshot.val();
        var keys = Object.keys(pointsObjects);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (pointsObjects[k].done === false) {
                if (document.querySelector('#voteButton')) {
                    updateVotePageInfo(k);
                }
                else if (document.querySelector('#progressBar')) {
                    updateProgressBar(Number(k));
                }
                songNr = Number(k);
                break;
            }
        };
    });
}
// ---                  --- //
// *** Helper functions *** //
// ---                  --- //
function getRandomInt(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
// escapeHtml Function
// by zrajm - (http://stackoverflow.com/users/351162/zrajm)
// http://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
function escapeInput(text) {
    'use strict';
    return text.replace(/[\"&'\/<>@?]/g, function (a) {
        return {
            '"': '&#34;'
            , '&': '&#38;'
            , "'": '&#39;'
            , '/': '&#47;'
            , '<': '&#60;'
            , '>': '&#62;'
            , '@': '&#64;'
            , '?': '&#63;'
        }[a];
    });
}

function unEscapeInput(text) {
    'use strict';
    return text.replace(/(&#\S{1,4};)/g, function (a) {
        return {
            '&#34;': '"'
            , '&#38;': '&'
            , '&#39;': "'"
            , '&#47;': '/'
            , '&#60;': '<'
            , '&#62;': '>'
            , '&#64;': '@'
            , '&#63;': '?'
        }[a];
    });
}
// Get the size of the screen, current web page and browser window
// by confile - (http://stackoverflow.com/users/1055664/confile)
// http://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
function getWidth() {
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return width;
}

function getHeight() {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    return height;
}

function calculateProgress(progress) {
    if (progress === 0) {
        return 0;
    }
    if (progress === 25) {
        return progress + 1;
    }
    else {
        return ((progress) / 26 * 100).toFixed(0);
    }
}

function convertToMGPPoints(points) {
    if (points === 9) return 10;
    else if (points === 10) return 12;
    else return points;
}
/**
    Smoothly scroll element to the given target (element.scrollTop)
    for the given duration

    Returns a promise that's fulfilled when done, or rejected if
    interrupted
 */
function smoothScrollTo(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
        return Promise.reject("bad duration");
    }
    if (duration === 0) {
        element.scrollTop = target;
        return Promise.resolve();
    }
    var start_time = Date.now();
    var end_time = start_time + duration;
    var start_top = element.scrollTop;
    var distance = target - start_top;
    // based on http://en.wikipedia.org/wiki/Smoothstep
    var smooth_step = function (start, end, point) {
        if (point <= start) {
            return 0;
        }
        if (point >= end) {
            return 1;
        }
        var x = (point - start) / (end - start); // interpolation
        return x * x * (3 - 2 * x);
    }
    return new Promise(function (resolve, reject) {
        // This is to keep track of where the element's scrollTop is
        // supposed to be, based on what we're doing
        var previous_top = element.scrollTop;
        // This is like a think function from a game loop
        var scroll_frame = function () {
                if (element.scrollTop != previous_top) {
                    reject("interrupted");
                    return;
                }
                // set the scrollTop for this frame
                var now = Date.now();
                var point = smooth_step(start_time, end_time, now);
                var frameTop = Math.round(start_top + (distance * point));
                element.scrollTop = frameTop;
                // check if we're done!
                if (now >= end_time) {
                    resolve();
                    return;
                }
                // If we were supposed to scroll but didn't, then we
                // probably hit the limit, so consider it done; not
                // interrupted.
                if (element.scrollTop === previous_top && element.scrollTop !== frameTop) {
                    resolve();
                    return;
                }
                previous_top = element.scrollTop;
                // schedule next frame for execution
                setTimeout(scroll_frame, 0);
            }
            // boostrap the animation process
        setTimeout(scroll_frame, 0);
    });
}