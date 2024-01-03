/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class VaphInfo {
    constructor(given="", isLocked=false, ratio="1"){
        this.given = given;
        this.isLocked = isLocked;
        this.ratio = ratio;
    }
}

class Tab {
    constructor(dag="", woon="", psycho="", pakket="", act=false, besteedbaar="", vaph=new VaphInfo()) {
        this.dag = dag;
        this.woon = woon;
        this.psycho = psycho;
        this.pakket = pakket;
        this.act = act;
        this.besteedbaar = besteedbaar;
        this.vaph = vaph;
    }
}

class TabManager{
    constructor() {
        this.inputFields = [document.querySelector("#dag input"), document.querySelector("#woon input"),
            document.querySelector("#psycho input"), document.querySelector("#pakket input"),
            document.querySelector(".actBox input"), document.querySelector(".besteedbaar input")];
        
            this.vaphState = [document.querySelector("#VAPH #VAPH_Budget"), 
        document.querySelector("#VAPH #VAPH_Lock"), document.querySelector("#VAPH #VAPH_Ratio")];
        
        this.tabs = [new Tab(), new Tab(), new Tab(), new Tab()];
        this.tabIndex = 0;
    }

    currentTab() { return this.tabs[this.tabIndex]; }

    saveTab() {
        let vaph = new VaphInfo(this.vaphState[0].value, this.vaphState[1].checked, this.vaphState[2].value);
        
        this.tabs[this.tabIndex] = new Tab(this.inputFields[0].value, this.inputFields[1].value, this.inputFields[2].value,
            this.inputFields[3].value, this.inputFields[4].checked, this.inputFields[5].value, vaph);

        //remove bg-color of prices
        const prices = document.getElementById("prices");
        prices.classList.remove(prices.classList[0]);

        //remove bg-color of options
        const options = document.querySelectorAll("option");
        options.forEach(o => o.classList.remove(o.classList[0]));
    }

    loadTab() {
        const tab = this.currentTab();
        const fields = this.inputFields;
        [fields[0].value, fields[1].value, fields[2].value, fields[3].value, fields[4].checked, fields[5].value] =
            [tab.dag, tab.woon, tab.psycho, tab.pakket, tab.act, tab.besteedbaar];
        
        const vaph = this.vaphState;
        [vaph[0].value, vaph[1].checked, vaph[2].value] = [tab.vaph.given, tab.vaph.isLocked, tab.vaph.ratio];

        update();
        document.querySelector("#VAPH_Lock").dispatchEvent(new Event("change"));

        const selected = document.querySelector(".selected");
        //set bg-color of prices to bg-color of tab
        const prices = document.getElementById("prices");
        prices.classList.add(selected.classList[1]);
        //set bg-color of options to bg-color of tab
        const options = document.querySelectorAll("option");   
        options.forEach(o => o.classList.add(selected.classList[1]));
    }

    refreshForDownload() {
        let oldT = this.tabIndex;
        if (oldT <= 3) {
            this.saveTab();
            this.loadTab();
        }
    }

    setTabHandlers() {
        const tabs = document.querySelectorAll(".tab[index]");
        const hideDiv = name => document.querySelector(`#${name}`).setAttribute("hidden", "");
        const showDiv = name => document.querySelector(`#${name}`).removeAttribute("hidden");

        tabs.forEach(t => t.onclick = () => {
            //set selected tab
            tabs.forEach(tab => tab.classList.remove("selected"));
            t.classList.add("selected");

            //process old tab
            let oldT = this.tabIndex;
            if (oldT <= 3) this.saveTab();
            else if (oldT == 4) hideDiv("overviews");

            //choose action based on tab
            this.tabIndex = t.getAttribute("index");
            if (this.tabIndex <= 3) {
                showDiv("prices");
                this.loadTab();
            }
            else if (this.tabIndex == 4) {
                hideDiv("prices");
                showDiv("overviews");
                document.querySelector("#overviews").scrollTop = 0
            }
        });

        this.loadTab();
    }
    
}