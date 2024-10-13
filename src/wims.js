// valid username/password combinations
let users = {"a": "a", "scooby": "mystery"};

// Filters object
let filters = { "dateMaximum": null, "dateMinimum": null, "importance": 0, "terms": [] };

//////////////////////////
// flag for annotations
let f = 0;
// categories for annotations
const categories = [ { "color": "orangered", "type": "Person" },
                     { "color": "blueviolet", "type": "Place" },
                     { "color": "yellowgreen", "type": "Telephone" }
];

// RegEx for importing from supplied case file
const regexp = /--- ((?:fbi|cia|se)\d+\.\S*?)(?:\.*) ---\s*?(?:Report) (?:\S*)\s(.*?\d\d\d\d)(?:\.|:{0,1})\s*(.*)/gm;
// Array of files
let files = [];
files = populateFiles();

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
        "<P>Filename: " + files[Number(x.substring(1))][0] + 
        "</P><P>Date: " + files[Number(x.substring(1))][1] + "</P>" +
        '<div id="prose">' +
        files[Number(x.substring(1))][2] +
        "</div>";

//////////////////////////////////////////////////////////

    let divRangeImportance = document.createElement("DIV");

    let importanceLabel = document.createElement("LABEL");
    importanceLabel.setAttribute("for", "file_importance");
    importanceLabel.innerHTML = "Importance Level:";

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
        checkFiltered();
    };

    let datalist = document.createElement("DATALIST");
    datalist.setAttribute("id", "importance_values");
    let labels = ["0","","","","","5","","","","","10"];
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
    fieldsetAnnotate.style.width = "400px";

    let legend = document.createElement("LEGEND");
    legend.innerHTML = "Choose category, then highlight document text to annotate:";
    fieldsetAnnotate.appendChild(legend);

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

        fieldsetAnnotate.appendChild(inp);
        fieldsetAnnotate.appendChild(l);

        if (i < categories.length - 1) fieldsetAnnotate.appendChild(document.createElement("BR"));
    }
    divAnnotate.appendChild(fieldsetAnnotate);
    document.getElementById("main_lowerright_file").appendChild(divAnnotate);

    let file_notes = document.createElement("TEXTAREA");
    file_notes.innerHTML = files[Number(x.substring(1))][4];
    file_notes.placeholder = "Write notes here.";
    file_notes.cols = 80;
    file_notes.rows = 10;
    file_notes.oninput = function(){
        files[Number(x.substring(1))][4] = this.value;
    };

    document.getElementById("main_lowerright_file").appendChild(file_notes);

}
/////////////////////////
// Populate the sidetab
/////////////////////////
function listFiles(){ 
    document.getElementById("topSidebarSection").replaceChildren();

    for( let i = 0; i < files.length; i++ ){
        let sidetab = document.createElement("DIV");
        sidetab.classList.add("sidebarItem");
        sidetab.id = "c" + i;
        sidetab.onclick = function(x) { makeSidebarSelected(x.target.id);
                                        makeSelected("file");
                                        displayCase(x.target.id)
        }; 
        sidetab.innerHTML = files[i][0];
        document.getElementById("topSidebarSection").appendChild(sidetab);
    }
    checkFiltered();
}

//////////////////////////
//  Import the Files/Cases
//////////////////////////
function importCases(){
    let x = document.getElementById("importcases_textarea").value;
    document.getElementById("importcases_textarea").value = "";
    let matchedArray = [...x.matchAll(regexp)];
    files = files.concat( matchedArray.map((x) => [x[1], x[2], x[3], 5, ""]) );
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
        document.getElementById("file").classList.remove("is-selected");
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
// Display the report div
////////////////////////
function report(){ 
    console.log("report");
    hideMLRElements();
    document.getElementById("main_lowerright_report").style.display = "block";
    document.getElementById("main_lowerright_report").style.visibility = "visible";
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
    document.getElementById("logout").classList.remove("is-selected");
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
          document.getElementById("newcase_importance").value,
        "" ]);

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
    /////////////////////////////////
    // Filter Toolbar
    /////////////////////////////////
    document.getElementById("main_lowerright_filter").innerHTML = "";

    let instructions = document.createElement("DIV");
    instructions.setAttribute("id", "filter_instructions");
    instructions.innerHTML = "Selection of the 'Filter' tab above, reveals the tool tab bar below. " +
                             "Select a tab below to select a filtering tool. " +
                             "Files that are filtered out, are displayed with red text in the left sidebar, " +
                             "while files that meet the filter criteria are displayed in grey text. " +
                             "Filters are cumulative.";
    document.getElementById("main_lowerright_filter").appendChild(instructions);

    let filtertoolbar = document.createElement("DIV");
    filtertoolbar.classList.add("toolbar");
    let filtertoolbarsection = document.createElement("DIV");
    filtertoolbarsection.classList.add("toolbarSection");

    let tabtoolbar1 = document.createElement("DIV");
    tabtoolbar1.classList.add("toolbarItem");
    tabtoolbar1.classList.add("toolbarButton");
    tabtoolbar1.setAttribute("id", "tab_importance");
    tabtoolbar1.innerHTML = "Importance";
    tabtoolbar1.onclick = function(x) {
        makeFilterToolbarSelected (x.target.id);

        document.getElementById("filter_tool").innerHTML = "";
        let divRangeImportance = document.createElement("DIV");

        let importanceLabel = document.createElement("LABEL");
        importanceLabel.setAttribute("for", "file_importance_filter");
        importanceLabel.innerHTML = "Minimum Importance Level:";
    
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
            checkFiltered();
        };
    
        let datalist = document.createElement("DATALIST");
        datalist.setAttribute("id", "importance_values_filter");
        let labels = ["0","","","","","5","","","","","10"];
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
        document.getElementById("filter_tool").appendChild(divRangeImportance);
    }; 

    let tabtoolbar2 = document.createElement("DIV");
    tabtoolbar2.classList.add("toolbarItem");
    tabtoolbar2.classList.add("toolbarButton");
    tabtoolbar2.setAttribute("id", "tab_dates");
    tabtoolbar2.innerHTML = "Dates";
    tabtoolbar2.onclick = function(x) { 
        makeFilterToolbarSelected (x.target.id);
        document.getElementById("filter_tool").innerHTML = "";
        let divMinDate = document.createElement("DIV");
        let labelMinDate = document.createElement("LABEL");
        labelMinDate.setAttribute("for", "minimum_date_filter");
        labelMinDate.innerHTML = "Minimum Date:";
    
        let inputMinDate = document.createElement("INPUT");
        inputMinDate.setAttribute("type", "date");
        inputMinDate.setAttribute("id", "minimum_date_filter");
        inputMinDate.setAttribute("name", "minimum_date_filter");
        inputMinDate.setAttribute("value", filters.dateMinimum);
        inputMinDate.onchange = function(){ 
            filters.dateMinimum = inputMinDate.value;
            document.getElementById("maximum_date_filter").setAttribute("min", inputMinDate.value);
            checkFiltered();
        };
    
        divMinDate.appendChild(labelMinDate);
        divMinDate.appendChild(document.createElement("BR"));
        divMinDate.appendChild(inputMinDate);
        document.getElementById("filter_tool").appendChild(divMinDate);
        document.getElementById("filter_tool").appendChild(document.createElement("P"));
    
        ///////////////////////////////////////
        let divMaxDate = document.createElement("DIV");
        let labelMaxDate = document.createElement("LABEL");
        labelMaxDate.setAttribute("for", "maximum_date_filter");
        labelMaxDate.innerHTML = "Maximum Date:";
    
        let inputMaxDate = document.createElement("INPUT");
        inputMaxDate.setAttribute("type", "date");
        inputMaxDate.setAttribute("id", "maximum_date_filter");
        inputMaxDate.setAttribute("name", "maximum_date_filter");
        inputMaxDate.setAttribute("value", filters.dateMaximum);
        inputMaxDate.onchange = function () {
            filters.dateMaximum = inputMaxDate.value;
            document.getElementById("minimum_date_filter").setAttribute("max", inputMaxDate.value);
            checkFiltered();
        };    
        divMaxDate.appendChild(labelMaxDate);
        divMaxDate.appendChild(document.createElement("BR"));
        divMaxDate.appendChild(inputMaxDate);
        document.getElementById("filter_tool").appendChild(divMaxDate);
    
    }; 

    let tabtoolbar3 = document.createElement("DIV");
    tabtoolbar3.classList.add("toolbarItem");
    tabtoolbar3.classList.add("toolbarButton");
    tabtoolbar3.setAttribute("id", "tab_terms");
    tabtoolbar3.innerHTML = "Terms";
    tabtoolbar3.onclick = function(x) {
        makeFilterToolbarSelected (x.target.id);
        document.getElementById("filter_tool").innerHTML = "";
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
            //console.log("Button clicked!");
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
            }
            checkFiltered();
        };
    
        let fieldsetFilterTerm = document.createElement("FIELDSET");
        let legend = document.createElement("LEGEND");
        legend.innerHTML = "Filter:";
        fieldsetFilterTerm.appendChild(legend);
    
        let labelFilterIncludeRadio = document.createElement("LABEL");
        labelFilterIncludeRadio.setAttribute("for", "filterInclude");
        labelFilterIncludeRadio.innerHTML = "Inclusive";
    
        let inputFilterIncludeRadio = document.createElement("INPUT");
        inputFilterIncludeRadio.setAttribute("type", "radio");
        inputFilterIncludeRadio.setAttribute("id", "filterInclude");
        inputFilterIncludeRadio.setAttribute("name", "filterTermRadio");
        inputFilterIncludeRadio.setAttribute("value", 0);
        inputFilterIncludeRadio.checked = true;
    
        let labelFilterExcludeRadio = document.createElement("LABEL");
        labelFilterExcludeRadio.setAttribute("for", "filterExclude");
        labelFilterExcludeRadio.innerHTML = "Exclusive";
    
        let inputFilterExcludeRadio = document.createElement("INPUT");
        inputFilterExcludeRadio.setAttribute("type", "radio");
        inputFilterExcludeRadio.setAttribute("id", "filterExclude");
        inputFilterExcludeRadio.setAttribute("name", "filterTermRadio");
        inputFilterExcludeRadio.setAttribute("value", 1);
    
        fieldsetFilterTerm.appendChild(inputFilterIncludeRadio);
        fieldsetFilterTerm.appendChild(labelFilterIncludeRadio);
        fieldsetFilterTerm.appendChild(document.createElement("BR"));
        fieldsetFilterTerm.appendChild(inputFilterExcludeRadio);
        fieldsetFilterTerm.appendChild(labelFilterExcludeRadio);
    
        divFilterTerms.appendChild(labelFilterTermsTextbox);
        divFilterTerms.appendChild(inputFilterTermsTextbox);
        divFilterTerms.appendChild(fieldsetFilterTerm);
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
    
        document.getElementById("filter_tool").appendChild(divFilterTerms);
    }; 

    filtertoolbarsection.appendChild(tabtoolbar1);
    filtertoolbarsection.appendChild(tabtoolbar2);
    filtertoolbarsection.appendChild(tabtoolbar3);
    filtertoolbar.appendChild(filtertoolbarsection);
    document.getElementById("main_lowerright_filter").appendChild(filtertoolbar);

    let f = document.createElement("DIV");
    f.setAttribute("id", "filter_tool");
    document.getElementById("main_lowerright_filter").appendChild(f);
    //////////////////////////////////////////////////////////////////////

    console.log("filter");
    hideMLRElements();
    document.getElementById("main_lowerright_filter").style.display = "block";
    document.getElementById("main_lowerright_filter").style.visibility = "visible";

}

function makeFilterToolbarSelected (x) { 
    let ids = ["tab_importance","tab_dates","tab_terms"];
    for (let i = 0; i < ids.length; i++){
        document.getElementById(ids[i]).classList.remove("is-selected");
    }
    document.getElementById(x).classList.add("is-selected");
}

//////////////////////////////////////////////
// Execute when Header tab is clicked
/////////////////////////////////////////////
function makeSelected(x){
    let ids = ["import","new","file","filter","evaluate","report","logout"];
    for (let i = 0; i < ids.length; i++){
        document.getElementById(ids[i]).classList.remove("is-selected");
    }
    document.getElementById(x).classList.add("is-selected");
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
        case 'report':
            report();
            break;
        default:
            break;
      }
}

//////////////////////////////////////////////
// Change CSS class of selected sidebar item
/////////////////////////////////////////////
function makeSidebarSelected(x){
    for (const childElement of document.getElementById("topSidebarSection").children) {
      childElement.classList.remove("is-selected");
    }
    document.getElementById(x).classList.add("is-selected");
}

//////////////////////////////////////////////
// For Annotations
/////////////////////////////////////////////
function getSelectedText() {
    var sel = window.getSelection();
    if (sel.getRangeAt && (sel.toString().trim() != "" )) {
        let r = sel.getRangeAt(0);
        let n = document.createElement("SPAN");
        n.classList.add(document.querySelector('input[name="annotateCategory"]:checked').value);
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

function checkFiltered() {
    for (let i = 0; i < files.length; i++){
        if ( ( filters.importance > files[i][3] ) ||
        ( Date.parse(filters.dateMinimum) > Date.parse(files[i][1] ) ) ||
        ( Date.parse(filters.dateMaximum) < Date.parse(files[i][1] ) ) ) {
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

window.onload = function() {
    listFiles();
}

function populateFiles() {
return [
            [
                "fbi1.txt",
                "1 April, 2003",
                "FBI: Atticus Lincoln is the owner of the Select Gourmet Foods shop in Springfield Mall, Springfield, VA. [Phone number 703-659-2317]. First Union National Bank lists Select Gourmet Foods as holding account number 1070173749003. Six checks totaling $35,000 have been deposited in this account in the past four months and are recorded as having been drawn on accounts at the Pyramid Bank of Cairo, Egypt and the Central Bank of Dubai, United Arab Emirates. Both of these banks have just been listed as possible conduits in money laundering schemes.",
                5,
                ""
            ],
            [
                "fbi13.txt",
                "20 April, 2003",
                "FBI: Also listing 2462 Myrtle Ave. Apt. 307, Queens, NYC as his home address is Levi Schmitt, who is also employed by Empire State Vending Services in Manhattan.",
                5,
                ""
            ],
            [
                "fbi10.txt",
                "April 18, 2003",
                "FBI: A routine check of security at the New York Stock Exchange [NYSE] reveals some anomalies in background checks of several persons who now hold vendor's IDs that allow them access to the NYSE provided that they are accompanied by security guards. (i) A man named Derek Shepherd, employed by the City Computer Services Corp. failed, in his application for a NYSE vendor's ID, to report his arrest and conviction [12 December, 2001 on a charge of assault and battery. He served six months in jail and is now out on probation. (ii) Stephanie Edwards, employed by the Clark & Co. Office Supplies Co., gave her current home address on her application for a vendor's ID as: 1631 Webster Ave.. The Bronx. NYC. There is no one by the name Stephanie Edwards at this residence. (iii) A man named Mark Sloan, reported age 32 years, obtained a social security card and a New York State driver's license in 1999 using a birth certificate now believed to have been forged. He is employed by Empire State Vending Services in Manhattan and he services vending machines such as coffee, soft drink, and candy machines. He lists his home address as: 2462 Myrtle Ave. Apt. 307, Queens, NYC.",
                5,
                ""
            ],
            [
                "fbi34.txt",
                "8 April, 2003",
                "FBI: On 7 April, 2003 at 0600 hrs. Police began tailing a panel truck rented from Ryder Truck Rental in Culver City, California. According to Ryder, this truck was rented on 1 April, 2003 by a man who gave the name Karim Bensaid. Bensaid showed a California drivers' license and gave his home address as 452 Hubbard St. in Culver City. Bensaid told the Ryder sales agent that he would need a small truck for two days to move some items of furniture from Culver City to San Gabriel, California. When the truck was still not returned on 6 April, the Ryder agent notified Los Angeles police who, in turn, notified the FBI. On 6 April, 2003 an alert LA police officer noticed the truck parked in front of an apartment complex on Greenlawn Ave. in Culver City. On 7 April, two men were observed to enter this rental truck. They drove south on US 405 and exited right at Imperial Highway. They then turned left on Sheldon St. and stopped at the City Park in El Segundo, California. At this point the two men were apprehended by police and FBI agents. In the truck were found two pairs of binoculars, maps of the Los Angeles area, and flight schedules to and from LAX.",
                5,
                ""
            ],
            [
                "fbi37.txt",
                "25 April, 2003",
                "FBI: A U-Haul truck was found abandoned on Colfax Avenue in Denver, Colorado not far from the Camp George West Military Reservation. The truck had two blown front tires. Examination of the truck's contents revealed 16 land mines. The U-haul rental agency in Denver was contacted and they reported that this truck had been rented in Denver on 20 April, 2003 by a man who used, as identification, a Colorado driver's license in the name Masood Yaser. The address on this license is: 1660 Coal Mine Road, Apartment 206. The owner of this apartment complex stated on 22 April, 2003 that Masood Yaser had rented Apartment # 206, but had left one week ago and did not leave a forwarding address.",
                5,
                ""
            ],
            [
                "fbi16.txt",
                "22 April, 2003",
                "FBI: Erica Hahn, of North Bergen NJ, has deposited checks in her bank account that were drawn on First Union Bank account number 1070173749003 in Springfield VA in the name Atticus Lincoln. The latest check is dated 16 April, 2003 and was in the amount of $8500.",
                5,
                ""
            ],
            [
                "fbi25.txt",
                "27 April, 2003",
                "FBI [From police in North Bergen, NJ]: In the early morning hours of April 26, 2003 a passerby reported a fire in a carpet shop that is managed by a Erica Hahn of North Bergen . The fire seems to have been started the night before when someone tossed a cigarette butt into a waste basket in the basement of the shop. While firemen were extinguishing the blaze, they discovered several cartons labeled: PRIVATE: DO NOT OPEN. These cartons contained C-4 explosive. Attempts to reach Erica Hahn have not been successful. An employee at the carpet shop later told police that Erica Hahn had just gone on a vacation in Canada and that she had left no address.",
                5,
                ""
            ],
            [
                "fbi31.txt",
                "27 April, 2003",
                "FBI: A man named Carl Louis, whose residence is at 3410 Van Dyke Avenue in Detroit, Michigan, was arrested by Detroit police for helping foreigners obtain Michigan drivers' licenses using forged documents. Carl Louis is specifically charged with providing forged documents for a Lebanese national named Abdelhak Kherbane, who was arrested in connection with the attempted bombing on 2 April of the Beth Israel synagogue in Detroit, Michigan.",
                5,
                ""
            ],
            [
                "cia11.txt",
                "27 April, 2003",
                "CIA: From a laptop computer captured in Afghanistan it was learned that a Pakistani named Preston Burke, who fought with the Taliban in 1990 - 1992, travels using an Indian passport in the name Levi Schmitt. On this same computer was found the name Tom Koracick, who served with the Taliban from 1987 - 1993. Records on this computer reveal that Tom Koracick entered the USA in March, 1993 and uses the alias Atticus Lincoln.",
                5,
                ""
            ],
            [
                "fbi22.txt",
                "27 April, 2003",
                "FBI: A photo of the man using the name Mark Sloan was examined by a representative of the Canadian police in NYC. The Canadian police investigator identified the man in the photo to be Owen Hunt, a Saudi who overstayed a travel visa and is wanted by the police in Canada. It is now known that Hunt received explosives training in the Sudan and in Afghanistan.",
                5,
                ""
            ],
            [
                "se4.txt",
                "24 April, 2003",
                "Phone calls on 22 April, 2003 from 703-659-2317 to the following numbers: 804-759-6302; 804-774-8920; 718-352-8479; and 01 1207670734. The same brief voice message was given in Arabic in each call. A translation of this message reads: \"I will be in my office on April 30 at 9:00AM. Try to be on time\".",
                5,
                ""
            ],
            [
                "se2.txt",
                "20 April, 2003",
                "lntercept of phone calls made from 718-352-8479 at 2462 Myrtle Ave. Apt. 307, Queens. NYC revealed several calls to a phone 732-455-6392 in North Bergen, New Jersey. Listed in the name of Erica Hahn, who manages a carpet store. In the latest call, the caller from 2462 Myrtle Ave. Apt. 307, Queens, NYC announced that she would pick up the carpet she ordered on April 25, 2003.",
                5,
                ""
            ],
            [
                "se3.txt",
                "21 April, 2003",
                "Frequent recent phone calls from 703-659-2317 to the following numbers: 804-759-6302 [Richmond, VA., listed in the name Richard Webber]; 804-774-8920 [Charlottesville, VA, listed in the name Jackson Avery]; 718-352-8479 [Queens, NYC, listed in the name Levi Schmitt. Two overseas calls were made to 01 1207670734 [Amsterdam, The Netherlands, listed in the name Nathan Riggs].",
                5,
                ""
            ],
            [
                "cia31.txt",
                "1 April, 2003",
                "CIA [From MI5]: On 30 March, 2003 the British Special Branch arrested Omar Bakri Qatada at his home at #11 St. Mary's Terrace, Paddington, London. Found in Qatada's bedroom was a small carton holding 10 ounces of Pentaerythritol [PETN] and Triacetone Triperoxide [TATP]. This is the same explosive that Richard Reid attempted to use on American Airlines #63 from Paris to Miami on 22 December, 2001. The BSB were alerted to follow and detain Qatada on the basis of information obtained from a respected moderate Moslem cleric in London, whose name was not provided in this report from MI5.",
                5,
                ""
            ],
            [
                "cia33.txt",
                "12 April, 2003",
                "CIA From French Intelligence: Acting on a tip from an unnamed source, French police arrested an Egyptian named Muhammad Shamzai at his home at 16 Rue St. Sebastien in Paris on 8 April, 2002. In his home police found 200 US and 180 British blank passports. In addition, on the hard drive of Shamzai's laptop computer was a record of a US and British passports that Shamzai had apparently forged. One of these passports was made out in the name Masood Yaser, whose address was listed as 1660 Coal Mine Road, Apartment 206, Denver, Colorado, USA. Another US passport forged was in the name Vincent Lozario, 2229 Marshall Avenue, Minneapolis, Minnesota, USA. A third forged US passport was in the name Khalfan Maulid, 656 Laurel Avenue, Bowling Green, Kentucky, USA.",
                5,
                ""
            ],
            [
                "cia35.txt",
                "20 April, 2003",
                "CIA: On 19 April, a car bomb was set off near the American Diplomatic Mission Headquarters in Buenos Aires. There were no casualties since the bomb seems to have gone off prematurely. The driver of the car carrying the bomb survived. He has been identified as Jamil Musawi, who is known to be a member of Hezbollah. This organization has had a presence in several Latin American countries.",
                5,
                ""
            ],
            [
                "cia39.txt",
                "22 April, 2003",
                "CIA From German Intelligence: On 20 April, 2003, German intelligence reported that a container chosen at random for inspection at the docks in Bremerhaven, Germany contained a crate in which there were four Stinger missiles. The box was addressed to Marvel Corporation, 1632 Trenton Avenue, Trenton, New Jersey, USA. The shipper's address was given as: 16 Rhinelander Platz., Hamburg, Germany. German intelligence advises that there is no such address in Hamburg. The serial numbers on the four Stinger missiles identifies them as being from among the nearly 400 Stinger missiles, now missing, that were given in the late 1980s to Taliban fighters in Afghanistan.",
                5,
                ""
            ],
            [
                "se32.txt",
                "10 April, 2003",
                "Intercept of a mobile phone message on 6 April, 2003 from 706-437-6673 to 713-556-9213. The first number was traced to a resident of Columbus, Georgia whose address is: 2237 St. Mary's Road. The resident at this address, Ralph Goode, claims that his mobile phone was recently stolen from his car, a matter he says he reported on 30 March, 2003 to the Columbus police. This account was verified by the Columbus police. The second number was traced to 2339 Little York Rd., Apt 7 in Houston, Texas. The caller from 706-437-6673, speaking in Arabic, said [when translated]: \"What you need will be found in the usual place\". The second number was listed by Sprint PCS as belonging to Jamal Kalifa.",
                5,
                ""
            ]
    ]; 
}