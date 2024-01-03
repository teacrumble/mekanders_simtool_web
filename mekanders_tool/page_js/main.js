/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var euro_conv = 1;
var reader;
var calc;
var cost;
var loader;
var master;
var tabMngr;
var processor;

async function mainStart(){
    reader = new JsonReader();

    await new Promise(r => setTimeout(r, 2000));

    calc = new RowCalculator(reader.global.punt_euro_rate, null, reader.psycho);
    cost = new CostBehaviour(calc, reader);
    loader = new TableLoader(reader);
    master = new MasterBehaviour(reader.global.persoonsvolgend_rate, cost, reader, loader);
    tabMngr = new TabManager();
    processor = new Processor(tabMngr);
    master.processor = processor;
    master.tabMgr = tabMngr;
    //SET DATE MINMAX
    setDateMinMax();

    //LOAD PACKETS
    //const packets = reader.packets;
    //loadPackets(packets);
    euro_conv = reader.global.punt_euro_rate;

    //SET BEHAVIOURS
    master.setMasterBehaviours();
    setOndersteuning_limits();
};

//METHODS
/*
function loadPackets(packets) {
    const select = document.querySelector(".pakket select");
    const addOption = desc => {
        const option = document.createElement("option");
        option.innerText = desc;
        select.appendChild(option);
    };

    addOption("");
    for (let key of packets.keys()) {
        addOption(key);
    }
}*/

function setDateMinMax() {
    const inputs = document.querySelectorAll("input[type=date]");

    inputs.forEach(input => {
        const current = new Date();
        input.min = `${current.getFullYear()}-01-01`;
        input.max = `${current.getFullYear() + 4}-12-31`;
    });
}

function fixed_p(budget, dec) {
    return budget.toFixed(dec);
}

function dagenVerschil(startDatum, eindDatum) {
    if (eindDatum > startDatum) {
        const timediff = eindDatum - startDatum;
        const diffDays = Math.ceil(((timediff / 1000) / 60) / 60) / 24;
        return diffDays + 1;
    }
    return 0;
}

function getPeriodDays() {
    const start = document.getElementById("startDt").value;
    const eind = document.getElementById("endDt").value;

    if (start != "" && eind != "") return dagenVerschil(new Date(start), new Date(eind));
    return 365;
}

function update() {
    document.querySelectorAll("#ondersteuningen>:not(.header) .wekelijks input, #andere input, #andere select").forEach(i => i.dispatchEvent(new Event("change")));
    document.querySelectorAll("#ondersteuningen>:not(.header) .wekelijks input, #andere input, #andere select").forEach(i => i.dispatchEvent(new Event("input")));
}


function cleanTxt(txt) {
    if (txt != "") return txt.toString().replace(/[^-()\d/*+.]/g, '');
    return "";
}

function checkOndersteuning_limit(input, max) {
    input.value = cleanTxt(input.value);
    const lblError = input.nextElementSibling;
    if (input.value != "" && eval(input.value) > max) lblError.textContent = `!! De max grootte is: ${max}`;
    else lblError.textContent = "";
}

//DEPRECATED
function checkOndersteuning_limit_dag() {
    const dag = document.querySelector("#dag input");
    const woon = document.querySelector("#woon input");
    const periode = getPeriodDays();

    const logeren = periode >= 180 && ((eval(woon.value) / 7) * periode) <= 60;
    const max = woon.value == "" || logeren ? 5 : 7;

    checkOndersteuning_limit(dag, max);
}

function checkOndersteuningLimitBesteedbaar() {
    const persoonlijk = eval(document.querySelector("#budgetP").value+0);
    const input = document.querySelector("#besteedbaar");
    const max = persoonlijk <= 34.81 ? 1800 : 3600;

    input.value = cleanTxt(input.value);
    const lblError = input.parentNode.nextElementSibling;
    if (input.value != "" && eval(input.value) > max) lblError.textContent = `!! De max hoeveelheid is: € ${max}`;
    else lblError.textContent = "";
}

function getRatio(){
    const resR = document.querySelector("#switchTotal input:checked").value;
    const inPoints = resR == "P";
    const vaph = document.querySelector("#VAPH_Budget").value * (inPoints ? 1 : euro_conv);
    
    const res = document.querySelector("#res").innerHTML;
    
    if(vaph != "" && res != ""){
        const totalen = document.querySelectorAll("#dagRow .totaal, #woonRow .totaal, #psychoRow .totaal, #pakketten .totaal");
        let variables = 0; 
        totalen.forEach(t => variables += eval(`${t.innerHTML}+0`));

        const constants = eval(`${res}+0`) - variables;

        return (vaph - constants) / variables;
    }

    return 1;
}

function setOndersteuning_limits() {
    const dag = document.querySelector("#dagRow input");
    const woon = document.querySelector("#woonRow input");
    const psycho = document.querySelector("#psychoRow input");
    const besteedbaar = document.querySelector("#besteedbaar");
    const vaph = document.querySelector("#VAPH_Budget");
    const vlock = document.querySelector("#VAPH_Lock");

    dag.addEventListener("input", () => checkOndersteuning_limit(dag, 7));
    woon.addEventListener("input", () => checkOndersteuning_limit(woon, 7));
    psycho.addEventListener("input", () => checkOndersteuning_limit(psycho, 99));
    besteedbaar.addEventListener("input", () => checkOndersteuningLimitBesteedbaar());

    vaph.addEventListener("input", () => {
        vaph.value = cleanTxt(vaph.value);
        update();
    });

    vlock.addEventListener("change", () => {
        if(vlock.checked){
            //lock
            vlock.nextElementSibling.firstElementChild.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="crimson" class="bi bi-lock-fill" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            </svg>
            `
            vaph.disabled = true;
            document.querySelector("#VAPH_Ratio").value = getRatio();
        }
        else {
            //unlock
            vlock.nextElementSibling.firstElementChild.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-unlock-fill" viewBox="0 0 16 16">
                <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/>
            </svg>
            `
            vaph.disabled = false;
            document.querySelector("#VAPH_Ratio").value = 1;
        }

        update();
    });
}