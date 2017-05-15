var totalPointsArr;
var bPressedText = '';

function getPartyScores(_bu) {
    console.log(_bu.innerText);
    bPressedText = _bu.innerText;
    var innerDiv = document.querySelector('#leaderboard');
    while (innerDiv.firstChild) innerDiv.removeChild(innerDiv.firstChild);
    totalPointsArr = new Array(27).join('0').split('').map(function(e) {return parseInt(e, 27);});
    getUsers();
}

function getUsers() {
    database.ref('users').once('value').then(function (snapshot) {
        var usersArr = [];
        var users = snapshot.val();
        var keys = Object.keys(users);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var n = users[k].userName;
            var p = users[k].party;
            var id = users[k].id;
            if (p === bPressedText) {
                var idKey = extractInfo(id)[2];
                usersArr.push(idKey);
            }
        }
        retrievePointsFromDB(usersArr);
    });
}

function retrievePointsFromDB(_keyArr) {
    database.ref('points').on('value', function(snapshot) {
        console.log('keyArray');
        console.log(_keyArr);
        var points = snapshot.val();
        var keys = Object.keys(points);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var p = points[k].points;
            if (_keyArr.indexOf(k) !== -1) {
                addPointsToTotalPoints(p);
            }
        }
        generateRows();
    });
}

function addPointsToTotalPoints(_pointsArr) {
    for (var i = 0; i < _pointsArr.length; i++) {
        totalPointsArr[i] += Number(_pointsArr[i].total);
        console.log(totalPointsArr[i]);
    }
}
function generateRows() {
    for (var i = 0; i < totalPointsArr.length; i++) {
        createLeaderboardRow(i, esc2017info[i].nation, totalPointsArr[i]);
    }
}

function createLeaderboardRow(_nr, _na, _po) {
    var lRow = document.createElement('div');
    lRow.classList.add('leaderboardRow');
    lRow.classList.add('row');

    var nrDiv = document.createElement('div');
    nrDiv.classList.add('small-2');
    nrDiv.classList.add('columns');

    var naDiv = document.createElement('div');
    naDiv.classList.add('small-6');
    naDiv.classList.add('columns');

    var poDiv = document.createElement('div');
    poDiv.classList.add('small-4');
    poDiv.classList.add('columns');

    addInfoToElement(nrDiv, Number(_nr) + 1);
    addInfoToElement(naDiv, _na);
    addInfoToElement(poDiv, _po);

    lRow.appendChild(nrDiv);
    lRow.appendChild(naDiv);
    lRow.appendChild(poDiv);

    var parent = document.getElementById("leaderboard");
    parent.appendChild(lRow);

    return lRow;
}

function addInfoToElement(_parentElement, _content) {
    //console.log('Add place nr.');
    var h2 = document.createElement('h2');
    h2.innerText = _content;
    _parentElement.appendChild(h2);
}

function extractInfo(_userInfo) {
    var arr = [];
    //console.log(_userInfo);
    var at = _userInfo.indexOf('@');
    var name = _userInfo.substr(0, at);
    var questionMark = _userInfo.indexOf('?');
    var party = _userInfo.substr(at + 1, questionMark - at - 1);
    var key = _userInfo.substr(questionMark + 1, _userInfo.length - questionMark - 1);
    arr.push(name);
    arr.push(party);
    arr.push(key);
    return arr;
}
