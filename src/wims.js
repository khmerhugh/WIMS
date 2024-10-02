// valid username/password combinations
let users = {"a": "a", "scooby": "mystery"};

//////////////////////////

let cases = "";
// let regexp = /--- ((?:fbi|cia|se)\d+\.\S*?)(?:\.*) ---\r\n(?:Report) (?:\S*)\s(.*?\d\d\d\d)(?:\.|:{0,1})\s*(.*)/gm;
// RegEx for importing from supplied case file
let regexp = /--- ((?:fbi|cia|se)\d+\.\S*?)(?:\.*) ---\s*?(?:Report) (?:\S*)\s(.*?\d\d\d\d)(?:\.|:{0,1})\s*(.*)/gm;
// Array of files
let files = [];

function hideMLRElements() {
    const elements = document.querySelectorAll(".mlr");
    elements.forEach(element => {
      element.style.display    = "none";
      element.style.visibility = "hidden";
    });
  }

function displayCase(x){
    console.log(x);
    //document.getElementById("main_lowerright").innerHTML = foo[Number(element.id.substring(1))][3];
    hideMLRElements();
    document.getElementById("main_lowerright_file").style.display = "block";
    document.getElementById("main_lowerright_file").style.visibility = "visible";
    document.getElementById("main_lowerright_file").innerHTML = 
        "Filename: " + files[Number(x.substring(1))][0] + "<p>" +
        "Date: " + files[Number(x.substring(1))][1] + "<p>" +
        files[Number(x.substring(1))][2];
}


//fetch("cases.txt")
//    .then(response => response.text())
//    .then((response) => {
//        cases = response;
//        let foo = [...response.matchAll(regexp)];
//        files = foo.map((x) => [x[1], x[2], x[3]]);
//        console.log(foo);
//        listFiles();
//    });


/////////////////////////

function listFiles(){ 
    document.getElementById("topSideBarSection").replaceChildren();

    for(let i = 0; i < files.length;i++){
        let sidetab = document.createElement("DIV");
        sidetab.classList.add("sideBar__item");
        sidetab.id = "c" + i;
        sidetab.onclick = function(x) { makeSidebarSelected(x.target.id);
                                        makeSelected("file");
                                        displayCase(x.target.id)
        }; 
        sidetab.innerHTML = files[i][0];
        document.getElementById("topSideBarSection").appendChild(sidetab);
    }

    //document.getElementById("main_lowerleft").replaceChildren();
    //let caseNames = "<div>";
    //for(let i = 0; i<files.length;i++){
    //    let button = document.createElement("BUTTON");
    //    button.classList.add("tab_vertical");
    //    button.classList.add("tabcontent");
    //    button.id = "c" + i;
    //    button.onclick = function(x) { clickedVerticalTab(x.target.id); };
    //    var t = document.createTextNode(files[i][0]);
    //    button.appendChild(t);
    //    document.getElementById("main_lowerleft").appendChild(button);


        //const d = new Date(files[i][1]);
        //caseNames += "<button id=\"c" + i + "\" class=\"caseName\" onclick='displayCase(this)'>"+files[i][0]+"</button><br>";
    //}
        //caseNames += "</div>";
        //document.getElementById("main_lowerleft").innerHTML = caseNames;
}

function importCases(){
    let x = document.getElementById("importcases_textarea").value;
    document.getElementById("importcases_textarea").value = "";
    let matchedArray = [...x.matchAll(regexp)];
    files = files.concat( matchedArray.map((x) => [x[1], x[2], x[3]]) );
    listFiles();
}

function addCase(){
    console.log("add case");
    hideMLRElements();
    document.getElementById("main_lowerright_newcase").style.display = "block";
    document.getElementById("main_lowerright_newcase").style.visibility = "visible";
}

function removeCase(){
    console.log("remove case");
    const e = document.getElementsByClassName("is-side-bar-item-selected");
        console.log(e.length);
        if (e.length === 1) {
        files.splice(Number(e[0].id.substring(1)),1);
        listFiles();
        document.getElementById("main_lowerright_file").innerHTML = "";
        hideMLRElements();
        document.getElementById("file").classList.remove("is-site-header-item-selected");
    }





    //for (const childElement of document.getElementById("topSideBarSection").children) {
    //    childElement.classList.remove("is-side-bar-item-selected");

    //  }
    //  document.getElementById(x).classList.add("is-side-bar-item-selected");

    //hideMLRElements();
    //document.getElementById("main_lowerright_newcase").style.display = "block";
    //document.getElementById("main_lowerright_newcase").style.visibility = "visible";
}

function evaluate(){ 
    console.log("evaluate");
    hideMLRElements();
    document.getElementById("main_lowerright_evaluate").style.display = "block";
    document.getElementById("main_lowerright_evaluate").style.visibility = "visible";
}

function displayFileTab(){
    console.log("display file tab without rebuilding");
    hideMLRElements();
    document.getElementById("main_lowerright_file").style.display = "block";
    document.getElementById("main_lowerright_file").style.visibility = "visible";
}

function displayImportDiv(){
    console.log("displayImportDiv");
    hideMLRElements();
    document.getElementById("main_lowerright_import").style.display = "block";
    document.getElementById("main_lowerright_import").style.visibility = "visible";
}

function logout(){
    console.log("logout");
    hideMLRElements();
    document.getElementById("logout").classList.remove("is-site-header-item-selected");
    document.getElementById("page_login").style.display = "block";
    document.getElementById("page_login").style.visibility = "visible";
    document.getElementById("page_main").style.display = "none";
    document.getElementById("page_main").style.visibility = "hidden";
}

function addNewCase(){
    files.push(
        [ document.getElementById("newcase_filename").value,
          document.getElementById("newcase_date").value,
          document.getElementById("newcase_textarea").value ]
    );

    document.getElementById("newcase_filename").value = null;
    document.getElementById("newcase_date").value = null;
    document.getElementById("newcase_textarea").value = null;

    listFiles();
}

function validateUser() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (users[username] === password) {
        console.log("good password");

        // set proper divs to being visible
        document.getElementById("page_login").style.display = "none";
        document.getElementById("page_login").style.visibility = "hidden";
        document.getElementById("page_main").style.display = "block";
        document.getElementById("page_main").style.visibility = "visible";

        // clear username/password textboxes after logging in
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    } else {
        // password wrong
        console.log("bad password");
    }
}

function newUser() {
    document.getElementById("page_login").style.display = "none";
    document.getElementById("page_login").style.visibility = "hidden";
    document.getElementById("page_newuser").style.display = "block";
    document.getElementById("page_newuser").style.visibility = "visible";
}

function addNewUser() {
    let newusername = document.getElementById("newusername").value;
    let newpassword = document.getElementById("newpassword").value;
    let repeatnewpassword = document.getElementById("repeatnewpassword").value;
    if ((newpassword === repeatnewpassword) &&    // passwords dont match
           newusername.length !== 0 &&            // username is blank
           newpassword.length !== 0 &&            // password is blank
           !users.hasOwnProperty(newusername)     // username already exists
       ) {
        users[newusername] = newpassword;
        document.getElementById("page_newuser").style.display = "none";
        document.getElementById("page_newuser").style.visibility = "hidden";
        document.getElementById("page_login").style.display = "block";
        document.getElementById("page_login").style.visibility = "visible";
    } else {
        console.log("Cannot add user");
    }

}

function clearNewUser() {
    document.getElementById("newusername").value = "";
    document.getElementById("newpassword").value = "";
    document.getElementById("repeatnewpassword").value = "";
}

function makeSelected(x){
    let ids = ["import","new","file","evaluate","logout"];
    for (let i = 0; i < ids.length; i++){
        document.getElementById(ids[i]).classList.remove("is-site-header-item-selected");
    }
    document.getElementById(x).classList.add("is-site-header-item-selected");
    console.log(x);

    switch (x) {
        case 'new':
            addCase();
            break;
        case 'import':
            displayImportDiv();
            break;
        case 'logout':
            logout();
            break;
        case 'file':
            displayFileTab();
            break;
        case 'evaluate':
            evaluate();
            break;
        default:
            break;
      }

}

function makeSidebarSelected(x){
    for (const childElement of document.getElementById("topSideBarSection").children) {
      childElement.classList.remove("is-side-bar-item-selected");
    }
    document.getElementById(x).classList.add("is-side-bar-item-selected");
}

//window.onload = function() {
//    let tabs = [ { "text": "Import", "id": "tab_import"},
//                 { "text": "New", "id": "tab_new"},
//                 { "text": "File", "id": "tab_file"},
//                 { "text": "Evaluate", "id": "tab_evaluate"}];

    //create horizontal tabs (buttons)
//    for(let i = 0; i < tabs.length; i++) {
//        let button = document.createElement("BUTTON");
//        button.classList.add("tab_horizontal");
//        button.id = tabs[i].id;
//        button.onclick = function(x) { clickedHorizontalTab(x.target.id); };
//        var t = document.createTextNode(tabs[i].text);
//        button.appendChild(t);
//        document.getElementById("main_upperright").appendChild(button);        
//    }
//
//}

function clickedHorizontalTab(x){
    console.log(x);
}
function clickedVerticalTab(x){
    console.log(x);
    displayCase(x);
}
/////////////////////////
// Just some sample code showing how to do something with selected text.
// For creating annotations later.
////////////////////
// const selection = window.getSelection();
// const range = selection.getRangeAt(0); // Get the first range in the selection
//
// Example: Surround the selection with a span element
// const span = document.createElement("span");
// range.surroundContents(span);
////////////////////