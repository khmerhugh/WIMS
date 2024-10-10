// valid username/password combinations
let users = {"a": "a", "scooby": "mystery"};

// Filters object
let filters = {"importance": 0, "dateMinimum": null, "dateMaximum": null, "terms": []};

//////////////////////////
// flag for annotations
let f = 0;
// categories for annotations
const categories = [ { "type": "Person", "color": "orangered"},
                     { "type": "Place", "color": "blueviolet"},
                     { "type": "Telephone", "color": "yellowgreen"}
];

// RegEx for importing from supplied case file
const regexp = /--- ((?:fbi|cia|se)\d+\.\S*?)(?:\.*) ---\s*?(?:Report) (?:\S*)\s(.*?\d\d\d\d)(?:\.|:{0,1})\s*(.*)/gm;
// Array of files
let files = [];

/////////////////////////////////
// Hide Main Lower Right Divs
/////////////////////////////////
function hideMLRElements() {
    const elements = document.querySelectorAll(".mlr");
    elements.forEach(element => {
      element.style.display    = "none";
      element.style.visibility = "hidden";
    });
  }

/////////////////////////////////
// Recreate File Div
/////////////////////////////////  
function displayCase(x){
    hideMLRElements();
    document.getElementById("main_lowerright_file").style.display = "block";
    document.getElementById("main_lowerright_file").style.visibility = "visible";
    document.getElementById("main_lowerright_file").innerHTML = 
        "Filename: " + files[Number(x.substring(1))][0] + "<p>" +
        "Date: " + files[Number(x.substring(1))][1] + "<p>" +
        '<div id="prose">' +
        files[Number(x.substring(1))][2] +
        "</div>";

//////////////////////////////////////////////////////////

    let divRangeImportance = document.createElement("DIV");

    let importanceLabel = document.createElement("LABEL");
    importanceLabel.setAttribute("for", "file_importance");
    importanceLabel.innerHTML = "Choose an importance level:";

    let br = document.createElement("BR");

    let importanceRange = document.createElement("INPUT");
    importanceRange.setAttribute("type", "range");
    importanceRange.setAttribute("id", "file_importance");
    importanceRange.setAttribute("name", "file_importance");
    importanceRange.setAttribute("list", "importance_values");
    importanceRange.setAttribute("min", "0");
    importanceRange.setAttribute("max", "10");
    importanceRange.setAttribute("step", "1");
    importanceRange.setAttribute("value", files[Number(x.substring(1))][3]);
    importanceRange.onchange = function(){ 
        files[Number(x.substring(1))][3] = importanceRange.value;
        if ( ( filters.importance > files[Number(x.substring(1))][3] ) ||
             ( Date.parse(filters.dateMinimum) > Date.parse(files[Number(x.substring(1))][1] ) ) ||
             ( Date.parse(filters.dateMaximum) < Date.parse(files[Number(x.substring(1))][1] ) ) ) {
            document.getElementById(x).classList.add("filteredFile");
        }
        else {
            document.getElementById(x).classList.remove("filteredFile");
        }
    };

    let datalist = document.createElement("DATALIST");
    datalist.setAttribute("id", "importance_values");
    let labels = ["Forget About It!","","","","","Medium Importance.","","","","","Super Importance!"];
    for (let i = 0; i<=10; i++){
        let option = document.createElement('option');
        option.value = i;
        option.label = labels[i];
        datalist.appendChild(option);
    }

    divRangeImportance.appendChild(importanceLabel);
    divRangeImportance.appendChild(br);
    divRangeImportance.appendChild(importanceRange);
    divRangeImportance.appendChild(datalist);
    document.getElementById("main_lowerright_file").appendChild(divRangeImportance);

    //////////////////////////////////////////////
    // For Annotations
    /////////////////////////////////////////////
    document.getElementById("prose").addEventListener("mousedown", function () {
            f = 0;
        }, false);
    document.getElementById("prose").addEventListener("mousemove", function () {
            f = 1;
        }, false);
    document.getElementById("prose").addEventListener("mouseup", function () {
            if (f === 0) {
            } else if (f === 1) {
                getSelectedText();
                files[Number(x.substring(1))][2] = document.getElementById("prose").innerHTML;
            }
        }, false);

    let divAnnotate = document.createElement("DIV");
    let fieldsetAnnotate = document.createElement("FIELDSET");

    for(let i = 0; i < categories.length; i++){
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', '12');
        svg.setAttribute('height', '12');
        svg.setAttribute('x', '0');
        svg.setAttribute('y', '0');
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x', '0');
        rect.style.fill = categories[i].color;
        rect.setAttribute('width', '12');
        rect.setAttribute('height', '12');
        rect.setAttribute('rx', '2');

        svg.appendChild(rect);

        let l = document.createElement("LABEL");
        l.setAttribute("for", "inputAnnotate"+categories[i].type);
        l.appendChild(svg);
        l.innerHTML = l.innerHTML + " " + categories[i].type;

        let inp = document.createElement("INPUT");
        inp.setAttribute("type", "radio");
        inp.setAttribute("id", "inputAnnotate"+categories[i].type);
        inp.setAttribute("name", "annotateCategory");
        inp.setAttribute("value", categories[i].type);
        if (categories[i].type == "Person") inp.checked = true;

        fieldsetAnnotate.appendChild(l);
        fieldsetAnnotate.appendChild(inp);
    }
    divAnnotate.appendChild(fieldsetAnnotate);
    document.getElementById("main_lowerright_file").appendChild(divAnnotate);

}
/////////////////////////
// Populate the sidetab
/////////////////////////
function listFiles(){ 
    document.getElementById("topSideBarSection").replaceChildren();

    for( let i = 0; i < files.length; i++ ){
        let sidetab = document.createElement("DIV");
        sidetab.classList.add("sideBar__item");
        sidetab.id = "c" + i;
        sidetab.onclick = function(x) { makeSidebarSelected(x.target.id);
                                        makeSelected("file");
                                        displayCase(x.target.id)
        }; 
        sidetab.innerHTML = files[i][0];
        document.getElementById("topSideBarSection").appendChild(sidetab);

        if ( ( filters.importance > files[i][3] ) ||
             ( Date.parse(filters.dateMinimum) > Date.parse(files[i][1] ) ) ||
             ( Date.parse(filters.dateMaximum) < Date.parse(files[i][1] ) )
        ) {
            document.getElementById("c"+i).classList.add("filteredFile");
        }
        else {
            document.getElementById("c"+i).classList.remove("filteredFile");
        }

        if (filters.terms.length > 0) {
            for (let j = 0; j < filters.terms.length; j++){
                if ( (stripMarkup(files[i][2]).includes(filters.terms[j][0]) && !filters.terms[j][1]) ||
                     (!stripMarkup(files[i][2]).includes(filters.terms[j][0]) && filters.terms[j][1])
                    ) 
                {
                    document.getElementById("c"+i).classList.add("filteredFile");
                }
            }
        }
    }
}

//////////////////////////
//  Import the Files/Cases
//////////////////////////
function importCases(){
    let x = document.getElementById("importcases_textarea").value;
    document.getElementById("importcases_textarea").value = "";
    let matchedArray = [...x.matchAll(regexp)];
    files = files.concat( matchedArray.map((x) => [x[1], x[2], x[3], 5]) );
    listFiles();
}

/////////////////////////
// Display the new case div
////////////////////////
function addCase(){
    console.log("add case");
    hideMLRElements();
    document.getElementById("main_lowerright_newcase").style.display = "block";
    document.getElementById("main_lowerright_newcase").style.visibility = "visible";
}

/////////////////////////
// remove the selected case
////////////////////////
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
}

/////////////////////////
// Display the evaluate div
////////////////////////
function evaluate(){ 
    console.log("evaluate");
    hideMLRElements();
    document.getElementById("main_lowerright_evaluate").style.display = "block";
    document.getElementById("main_lowerright_evaluate").style.visibility = "visible";
}

/////////////////////////
// Display the file div without rebuilding
////////////////////////
function displayFileTab(){
    console.log("display file tab without rebuilding");
    hideMLRElements();
    document.getElementById("main_lowerright_file").style.display = "block";
    document.getElementById("main_lowerright_file").style.visibility = "visible";
}

/////////////////////////
// Display the import div
////////////////////////
function displayImportDiv(){
    console.log("displayImportDiv");
    hideMLRElements();
    document.getElementById("main_lowerright_import").style.display = "block";
    document.getElementById("main_lowerright_import").style.visibility = "visible";
}

/////////////////////////
// Log the current user out
////////////////////////
function logout(){
    console.log("logout");
    hideMLRElements();
    document.getElementById("logout").classList.remove("is-site-header-item-selected");
    document.getElementById("page_login").style.display = "block";
    document.getElementById("page_login").style.visibility = "visible";
    document.getElementById("page_main").style.display = "none";
    document.getElementById("page_main").style.visibility = "hidden";
}

//////////////////////////////////////
// Add case data from new case page to file array and redraw sidebar
/////////////////////////////////////
function addNewCase(){
    files.push(
        [ document.getElementById("newcase_filename").value,
          document.getElementById("newcase_date").value,
          document.getElementById("newcase_textarea").value,
          document.getElementById("newcase_importance").value ]
    );

    document.getElementById("newcase_filename").value = null;
    document.getElementById("newcase_date").value = null;
    document.getElementById("newcase_textarea").value = null;
    document.getElementById("newcase_importance").value = null;

    listFiles();
}

/////////////////////////////
// Handle attempted login
/////////////////////////////
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

/////////////////////////
// Display the add new user div
////////////////////////
function newUser() {
    document.getElementById("page_login").style.display = "none";
    document.getElementById("page_login").style.visibility = "hidden";
    document.getElementById("page_newuser").style.display = "block";
    document.getElementById("page_newuser").style.visibility = "visible";
}

/////////////////////////
// Add a new user given username and password
////////////////////////
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

////////////////////////////////
// Clear textboxes on create new user page
//////////////////////////////////
function clearNewUser() {
    document.getElementById("newusername").value = "";
    document.getElementById("newpassword").value = "";
    document.getElementById("repeatnewpassword").value = "";
}

////////////////////////////////////
// Display the filter tab
////////////////////////////////////
function displayFilterTab() {
    document.getElementById("main_lowerright_filter").innerHTML = "";
    console.log("filter");
    hideMLRElements();
    document.getElementById("main_lowerright_filter").style.display = "block";
    document.getElementById("main_lowerright_filter").style.visibility = "visible";

    let divRangeImportance = document.createElement("DIV");

    let importanceLabel = document.createElement("LABEL");
    importanceLabel.setAttribute("for", "file_importance_filter");
    importanceLabel.innerHTML = "Choose MINIMUM importance level:";

    //let br = document.createElement("BR");

    let importanceRange = document.createElement("INPUT");
    importanceRange.setAttribute("type", "range");
    importanceRange.setAttribute("id", "file_importance_filter");
    importanceRange.setAttribute("name", "file_importance_filter");
    importanceRange.setAttribute("list", "importance_values_filter");
    importanceRange.setAttribute("min", "0");
    importanceRange.setAttribute("max", "10");
    importanceRange.setAttribute("step", "1");
    importanceRange.setAttribute("value", filters.importance);
    importanceRange.onchange = function(){ 
        filters.importance = importanceRange.value;
        // apply importance level filter on change of filters.importance
        for (let i = 0; i < files.length; i++){
            if ( ( filters.importance > files[i][3] ) ||
            ( Date.parse(filters.dateMinimum) > Date.parse(files[i][1] ) ) ||
            ( Date.parse(filters.dateMaximum) < Date.parse(files[i][1] ) ) ){
                document.getElementById("c"+i).classList.add("filteredFile");
            }
            else {
                document.getElementById("c"+i).classList.remove("filteredFile");
            }
        }
    };

    let datalist = document.createElement("DATALIST");
    datalist.setAttribute("id", "importance_values_filter");
    let labels = ["Forget About It!","","","","","Medium Importance.","","","","","Super Importance!"];
    for (let i = 0; i<=10; i++){
        let option = document.createElement('option');
        option.value = i;
        option.label = labels[i];
        datalist.appendChild(option);
    }

    divRangeImportance.appendChild(importanceLabel);
    divRangeImportance.appendChild(document.createElement("BR"));
    divRangeImportance.appendChild(importanceRange);
    divRangeImportance.appendChild(datalist);
    document.getElementById("main_lowerright_filter").appendChild(divRangeImportance);

    ///////////////////////////////////////
    let divMinDate = document.createElement("DIV");
    let labelMinDate = document.createElement("LABEL");
    labelMinDate.setAttribute("for", "minimum_date_filter");
    labelMinDate.innerHTML = "Choose MINIMUM date:";

    let inputMinDate = document.createElement("INPUT");
    inputMinDate.setAttribute("type", "date");
    inputMinDate.setAttribute("id", "minimum_date_filter");
    inputMinDate.setAttribute("name", "minimum_date_filter");
    inputMinDate.setAttribute("value", filters.dateMinimum);
    inputMinDate.onchange = function(){ 
        filters.dateMinimum = inputMinDate.value;
        document.getElementById("maximum_date_filter").setAttribute("min", inputMinDate.value);
        for (let i = 0; i < files.length; i++){
            if ( ( filters.importance > files[i][3] ) ||
            ( Date.parse(filters.dateMinimum) > Date.parse(files[i][1] ) ) ||
            ( Date.parse(filters.dateMaximum) < Date.parse(files[i][1] ) ) ) {
                document.getElementById("c"+i).classList.add("filteredFile");
            }
            else {
                document.getElementById("c"+i).classList.remove("filteredFile");
            }
        }
    };

    divMinDate.appendChild(labelMinDate);
    divMinDate.appendChild(document.createElement("BR"));
    divMinDate.appendChild(inputMinDate);
    document.getElementById("main_lowerright_filter").appendChild(divMinDate);

    ///////////////////////////////////////
    let divMaxDate = document.createElement("DIV");
    let labelMaxDate = document.createElement("LABEL");
    labelMaxDate.setAttribute("for", "maximum_date_filter");
    labelMaxDate.innerHTML = "Choose MAXIMUM date:";

    let inputMaxDate = document.createElement("INPUT");
    inputMaxDate.setAttribute("type", "date");
    inputMaxDate.setAttribute("id", "maximum_date_filter");
    inputMaxDate.setAttribute("name", "maximum_date_filter");
    inputMaxDate.setAttribute("value", filters.dateMaximum);
    inputMaxDate.onchange = function(){ 
        filters.dateMaximum = inputMaxDate.value;
        document.getElementById("minimum_date_filter").setAttribute("max", inputMaxDate.value);
        for (let i = 0; i < files.length; i++){
            if ( ( filters.importance > files[i][3] ) ||
            ( Date.parse(filters.dateMinimum) > Date.parse(files[i][1] ) ) ||
            ( Date.parse(filters.dateMaximum) < Date.parse(files[i][1] ) ) ) {
                document.getElementById("c"+i).classList.add("filteredFile");
            }
            else {
                document.getElementById("c"+i).classList.remove("filteredFile");
            }
        }
    };

    divMaxDate.appendChild(labelMaxDate);
    divMaxDate.appendChild(document.createElement("BR"));
    divMaxDate.appendChild(inputMaxDate);
    document.getElementById("main_lowerright_filter").appendChild(divMaxDate);

    //////////////////////////////////////////////
    let divFilterTerms = document.createElement("DIV");
    let labelFilterTermsTextbox = document.createElement("LABEL");
    labelFilterTermsTextbox.setAttribute("for", "terms_textbox_filter");
    labelFilterTermsTextbox.innerHTML = "Add term to filter list:";

    let inputFilterTermsTextbox = document.createElement("INPUT");
    inputFilterTermsTextbox.setAttribute("type", "text");
    inputFilterTermsTextbox.setAttribute("id", "terms_textbox_filter");
    inputFilterTermsTextbox.setAttribute("name", "terms_textbox_filter");

    let inputFilterAddButton = document.createElement("INPUT");
    inputFilterAddButton.setAttribute("type", "button");
    inputFilterAddButton.setAttribute("value", "Add Term");
    inputFilterAddButton.onclick = function(){
        console.log("Button clicked!");
        filters.terms.push([ document.getElementById("terms_textbox_filter").value, 
                             document.getElementById("filterExclude").checked ]);
        document.getElementById("terms_textbox_filter").value = "";
        document.getElementById("filterExclude").checked = true;

        document.getElementById("selectRemoveTerm").replaceChildren()
        for(let i = 0; i < filters.terms.length; i++){
            let option = document.createElement("OPTION");
            option.value = i;
            option.textContent = (filters.terms[i][1] ? "Exclude" : "Include") + ": " + filters.terms[i][0];
            document.getElementById("selectRemoveTerm").appendChild(option);

            for (let j = 0; j < files.length; j++){
                if ( (stripMarkup(files[j][2]).includes(filters.terms[i][0]) && !filters.terms[i][1]) ||
                     (!stripMarkup(files[j][2]).includes(filters.terms[i][0]) && filters.terms[i][1])
                    ) 
                {
                    document.getElementById("c"+j).classList.add("filteredFile");
                }
            }
        }
    };

    let fieldsetFilterTerm = document.createElement("FIELDSET");

    let labelFilterIncludeRadio = document.createElement("LABEL");
    labelFilterIncludeRadio.setAttribute("for", "filterInclude");
    labelFilterIncludeRadio.innerHTML = "Include";

    let inputFilterIncludeRadio = document.createElement("INPUT");
    inputFilterIncludeRadio.setAttribute("type", "radio");
    inputFilterIncludeRadio.setAttribute("id", "filterInclude");
    inputFilterIncludeRadio.setAttribute("name", "filterTermRadio");
    inputFilterIncludeRadio.setAttribute("value", 0);
    inputFilterIncludeRadio.checked = true;

    let labelFilterExcludeRadio = document.createElement("LABEL");
    labelFilterExcludeRadio.setAttribute("for", "filterExclude");
    labelFilterExcludeRadio.innerHTML = "Exclude";

    let inputFilterExcludeRadio = document.createElement("INPUT");
    inputFilterExcludeRadio.setAttribute("type", "radio");
    inputFilterExcludeRadio.setAttribute("id", "filterExclude");
    inputFilterExcludeRadio.setAttribute("name", "filterTermRadio");
    inputFilterExcludeRadio.setAttribute("value", 1);

    fieldsetFilterTerm.appendChild(labelFilterIncludeRadio);
    fieldsetFilterTerm.appendChild(inputFilterIncludeRadio);
    fieldsetFilterTerm.appendChild(labelFilterExcludeRadio);
    fieldsetFilterTerm.appendChild(inputFilterExcludeRadio);

    divFilterTerms.appendChild(labelFilterTermsTextbox);
    divFilterTerms.appendChild(document.createElement("BR"));
    divFilterTerms.appendChild(inputFilterTermsTextbox);
    divFilterTerms.appendChild(document.createElement("BR"));
    divFilterTerms.appendChild(fieldsetFilterTerm);
    divFilterTerms.appendChild(document.createElement("BR"));
    divFilterTerms.appendChild(inputFilterAddButton);

    let labelRemoveTerm = document.createElement("LABEL");
    labelRemoveTerm.setAttribute("for", "selectRemoveTerm");
    labelRemoveTerm = "Select filter term to remove";

    let selectRemoveTerm = document.createElement("SELECT");
    selectRemoveTerm.setAttribute("id", "selectRemoveTerm");
    inputFilterIncludeRadio.setAttribute("size", 10);

    for(let i = 0; i < filters.terms.length; i++){
        let option = document.createElement("OPTION");
        option.value = i;
        option.textContent = (filters.terms[i][1] ? "Exclude" : "Include") + ": " + filters.terms[i][0];
        selectRemoveTerm.appendChild(option);
    }

    divFilterTerms.appendChild(labelFilterTermsTextbox);
    divFilterTerms.appendChild(document.createElement("BR"));
    divFilterTerms.appendChild(selectRemoveTerm);

    document.getElementById("main_lowerright_filter").appendChild(divFilterTerms);
}

//////////////////////////////////////////////
// Execute when Header tab is clicked
/////////////////////////////////////////////
function makeSelected(x){
    let ids = ["import","new","file","filter","evaluate","logout"];
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
        case 'filter':
            displayFilterTab();
            break;
        case 'evaluate':
            evaluate();
            break;
        default:
            break;
      }

}

//////////////////////////////////////////////
// Change CSS class of selected sidebar item
/////////////////////////////////////////////
function makeSidebarSelected(x){
    for (const childElement of document.getElementById("topSideBarSection").children) {
      childElement.classList.remove("is-side-bar-item-selected");
    }
    document.getElementById(x).classList.add("is-side-bar-item-selected");
}

//function clickedHorizontalTab(x){
//    console.log(x);
//}
//function clickedVerticalTab(x){
//    console.log(x);
//    displayCase(x);
//}

//////////////////////////////////////////////
// For Annotations
/////////////////////////////////////////////
function getSelectedText() {
    var sel = window.getSelection();
    if (sel.getRangeAt && (sel.toString().trim() != "" )) {
        let r = sel.getRangeAt(0);
        let n = document.createElement("ann-" +
                document.querySelector('input[name="annotateCategory"]:checked').value);
        r.surroundContents(n);
    } 
    sel.empty();
}
//////////////////////////////////////////////////////////
// Strip Markup out of html to prepare for searching
/////////////////////////////////////////////////////////
function stripMarkup(x){
    let d = new DOMParser().parseFromString(x, 'text/html');
    return d.body.textContent || "";
}

window.onload = function() {
    listFiles();
}