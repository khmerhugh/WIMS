let users = {"a": "a", "scooby": "mystery"};

//////////////////////////

let cases = "";
let regexp = /--- ((?:fbi|cia|se)\d+\.\S*?)(?:\.*) ---\r\n(?:Report) (?:\S*)\s(.*?\d\d\d\d)(?:\.|:{0,1})\s*(.*)/gm;
regexp = /--- ((?:fbi|cia|se)\d+\.\S*?)(?:\.*) ---\s*?(?:Report) (?:\S*)\s(.*?\d\d\d\d)(?:\.|:{0,1})\s*(.*)/gm;
let files = [];

function displayCase(element){
    console.log(element.id);
    //document.getElementById("main_lowerright").innerHTML = foo[Number(element.id.substring(1))][3];
    document.getElementById("main_lowerright_newcase").style.display = "none";
    document.getElementById("main_lowerright_newcase").style.visibility = "hidden";
    document.getElementById("main_lowerright").style.display = "block";
    document.getElementById("main_lowerright").style.visibility = "visible";
    document.getElementById("main_lowerright").innerHTML = 
        "Filename: " + files[Number(element.id.substring(1))][0] + "<p>" +
        "Date: " + files[Number(element.id.substring(1))][1] + "<p>" +
        files[Number(element.id.substring(1))][2];

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
    let caseNames = "<div>";
    for(let i = 0; i<files.length;i++){
        const d = new Date(files[i][1]);
        caseNames += "<span id=\"c" + i + "\" class=\"caseName\" onclick='displayCase(this)'>"+files[i][0]+"</span><br>";
    }
        caseNames += "</div>";
        document.getElementById("main_lowerleft").innerHTML = caseNames;
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
    document.getElementById("main_lowerright").style.display = "none";
    document.getElementById("main_lowerright").style.visibility = "hidden";
    document.getElementById("main_lowerright_newcase").style.display = "block";
    document.getElementById("main_lowerright_newcase").style.visibility = "visible";
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
        document.getElementById("page_login").style.display = "none";
        document.getElementById("page_login").style.visibility = "hidden";
        document.getElementById("page_main").style.display = "block";
        document.getElementById("page_main").style.visibility = "visible";
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