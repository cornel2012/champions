// javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getDatabase,
    onValue,
    push,
    ref,
    update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL:
        "https://champions-endorsments-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsmentsListInDB = ref(database, "championsEndorsmentsList");

const endorsmentsForm = document.getElementById("endorsments-form");
const writeEndorsmentField = document.getElementById("write-endorsment-field");
const fromEndorsmentField = document.getElementById("from-endorsment-field");
const toEndorsmentField = document.getElementById("to-endorsment-field");
const btnPublishEndorsment = document.getElementById("btn-publish-endorsment");

const endorsmentsList = document.getElementById("endorsments-list");
// const btnFavorite = document.querySelectorAll(".btn-favorite");

const addEndorsmentToList = (e) => {
    e.preventDefault();

    if (
        writeEndorsmentField.value &&
        fromEndorsmentField.value &&
        toEndorsmentField.value
    ) {
        let endorsment = {
            content: writeEndorsmentField.value,
            from: fromEndorsmentField.value,
            to: toEndorsmentField.value,
            favoritesCount: 0,
        };

        push(endorsmentsListInDB, endorsment);
        clearForm();
    }
};

btnPublishEndorsment.addEventListener("click", addEndorsmentToList);

const clearForm = () => {
    writeEndorsmentField.value = "";
    fromEndorsmentField.value = "";
    toEndorsmentField.value = "";
};

const clearEndorsmentsList = () => {
    endorsmentsList.innerHTML = "";
};

onValue(endorsmentsListInDB, function (snapshot) {
    if (snapshot.exists()) {
        let endorsmentsArray = Object.entries(snapshot.val()).reverse();

        clearEndorsmentsList();

        for (let i = 0; i < endorsmentsArray.length; i++) {
            let currentEndorsment = endorsmentsArray[i];

            appendEndorsmentToEndorsmentsList(currentEndorsment);
        }
    } else {
        endorsmentsList.innerHTML = `You don't have any endorsment in your Endorsments List`;
    }
});

const appendEndorsmentToEndorsmentsList = (endorsment) => {
    const endorsmentID = endorsment[0];
    const endorsmentContent = endorsment[1].content;
    const endorsmentFrom = endorsment[1].from;
    const endorsmentTo = endorsment[1].from;
    const endorsmentFavoritesCount = endorsment[1].favoritesCount;

    // endorsmentsList.innerHTML += `
    //     <li>
    //         <label>To ${endorsmentTo}</label>
    //         <p>${endorsmentContent}</p>
    //         <label>From ${endorsmentFrom}</label>
    //     </li>
    // `;

    let newEndorsmentEl = document.createElement("li");
    newEndorsmentEl.innerHTML = `
        <label>To ${endorsmentTo}</label>
        <p>${endorsmentContent}</p>
        <label>From ${endorsmentFrom}</label>
    `;
    let btnFavorite = document.createElement("i");

    btnFavorite.className = "btn-favorite fas fa-heart";
    btnFavorite.title = "Click to add to favorite";

    let btnFavoriteCount = document.createElement("span");
    btnFavoriteCount.textContent = endorsmentFavoritesCount;
    btnFavorite.appendChild(btnFavoriteCount);

    btnFavorite.addEventListener("click", function (e) {
        updateEndorsment(endorsmentID, endorsmentFavoritesCount);
    });
    newEndorsmentEl.append(btnFavorite);
    endorsmentsList.append(newEndorsmentEl);
};

const updateEndorsment = (endorsmentID, endorsmentFavoritesCount) => {
    const updates = {};
    const addedToFavorite = getCookie(endorsmentID); // create a cookie to prevent multiple add

    if (!addedToFavorite) {
        endorsmentFavoritesCount++;
        updates[`championsEndorsmentsList/${endorsmentID}/favoritesCount/`] =
            endorsmentFavoritesCount;

        update(ref(database), updates);
        setCookie(endorsmentID, true, 30);
    }
};

const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};
