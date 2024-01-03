/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class MasterBehaviour {
    constructor(persoonsvolgend, costBehaviour, reader, tableLoader, tabMgr) {
        this.persoonsvolgend = persoonsvolgend;
        this.costBehaviour = costBehaviour;
        this.reader = reader;
        this.newCats = true;
        this.loader = tableLoader;
        this.table = "dag";
        this.processor = undefined;
        this.tabMgr = tabMgr;
    }

    convertBudget() {
        //arrow functions
        const blankOnZero = num => num == 0 ? "" : num;

        //HTML elements
        const budgetP = document.getElementById("budgetP");
        const budgetE = document.getElementById("budgetE");
        const veil = document.querySelector("#veil");

        //behaviours
        budgetE.addEventListener("input", () => {
            budgetP.value = blankOnZero(fixed_p(Math.abs(budgetE.value) / this.persoonsvolgend, 6));
            update();
            if (veil.getAttribute("hidden") != null) this.costBehaviour.calculateTotal();
        });

        budgetP.addEventListener("input", () => {
            budgetE.value = blankOnZero(fixed_p(Math.abs(budgetP.value) * this.persoonsvolgend, 2));
            update();
            if (veil.getAttribute("hidden") != null) this.costBehaviour.calculateTotal();
        });
    }

    setPeriodDays() {
        const periodDays = document.querySelector("#totaalDagen");
        const dates = document.querySelectorAll("input[type='date']");

        dates.forEach(d => d.onchange = () => {
            periodDays.innerHTML = `${getPeriodDays()} dagen`;
            update();
        });
        dates[0].dispatchEvent(new Event("change"));
    }

    findInfo(cs, bps) {
        return Array.from(cs).find(c => c.cat_ids.includes(bps));
    }

    lockInputs() {
        const veil = document.querySelector("#veil");
        const bValue = document.querySelector("#bValue");
        const pValue = document.querySelector("#pValue");
        const inputs = [bValue, pValue];
        const weekendMod = this.reader.global.weekend_modifier;

        inputs.forEach(inp => inp.addEventListener("input", () => {
            const res = bValue.value != "" && pValue.value != "";
            const bps = `B${bValue.value}/P${pValue.value}`;

            const cat = this.newCats ? this.findInfo(this.reader.categories, bps) : this.findInfo(this.reader.oldCategories, bps);

            if (res && cat != undefined && cat != null) {
                veil.setAttribute("hidden", "hidden");

                const info = cat.cat_info
                const category = new Category(info.dag_basis, info.dag_inc, info.woon_basis, info.woon_inc, weekendMod);
                this.costBehaviour.rowcalculator.category = category;
                this.reader.currentCat = category;
                document.querySelector("#radioTable input:checked").dispatchEvent(new Event("change"));
                update();
            }
            else veil.removeAttribute("hidden");
        }));
    }

    changeUsedFile() {
        const radVersions = document.querySelectorAll(".mainInfo .switch input");
        const veil = document.querySelector("#veil");
        radVersions.forEach(r => r.onchange = () => {
            //set category
            this.newCats = document.querySelector(".mainInfo .switch input:checked").value === "true";
            document.querySelector("#bValue").dispatchEvent(new Event("input"));

            //update de fields
            update();
            if (veil.getAttribute("hidden") != null) this.costBehaviour.calculateTotal();

            //update de tables
            document.querySelector("#radioTable input:checked").dispatchEvent(new Event("change"));

        });

        radVersions[0].dispatchEvent(new Event("change"));
    }

    loadTable() {
        const radios = document.querySelectorAll("#radioTable input[type='radio']");

        radios.forEach(r => r.onchange = () => {
            const tabel = document.querySelector("#overviews table");
            tabel.innerHTML = "";
            switch (r.value) {
                case "dag":
                    this.newCats ? this.loader.loadDag(this.reader.categories) :
                        this.loader.loadDag(this.reader.oldCategories);
                    if (this.table != "woon" && this.table != "dag") document.querySelector("#overviews").scrollTop = 0;
                    break;
                case "woon":
                    this.newCats ? this.loader.loadWoon(this.reader.categories) :
                        this.loader.loadWoon(this.reader.oldCategories);
                    if (this.table != "woon" && this.table != "dag") document.querySelector("#overviews").scrollTop = 0;
                    break;
                case "indiv":
                    this.loader.loadPsycho(this.reader.psycho);
                    document.querySelector("#overviews").scrollTop = 0
                    break;
                case "Bwaarden":
                    this.newCats ? this.loader.loadDescriptions(this.reader.bValues, "B-waarden") :
                        this.loader.loadDescriptions(this.reader.oldBValues, "B-waarden");
                    document.querySelector("#overviews").scrollTop = 0;
                    break;
                case "Pwaarden":
                    this.newCats ? this.loader.loadDescriptions(this.reader.pValues, "P-waarden") :
                        this.loader.loadDescriptions(this.reader.oldPValues, "P-waarden");
                    document.querySelector("#overviews").scrollTop = 0;
                    break;
                case "Begeleid werk":
                    this.loader.loadPacketDescriptions();
                    document.querySelector("#overviews").scrollTop = 0;
                default:
                    break;
            }

            this.table = r.value;
        });
    }

    budgetCatButton(){
        const btnHelp = document.querySelector("#budgetCats");
        btnHelp.addEventListener("click", () => {
            //resview
            const resView = document.createElement("div");
            resView.classList.add("resView");
            document.body.appendChild(resView);

            //buttons
            const buttons = document.createElement("div");
            buttons.classList.add("buttonsP");
            buttons.innerHTML = `<input type="button" value="X" id="btnCancel">`;
            resView.appendChild(buttons);
            
            //table
            const tableDiv = document.createElement("div");
            tableDiv.classList.add("tableDiv");
            const table = this.loader.loadBudgetCats();
            tableDiv.appendChild(table);
            resView.appendChild(tableDiv);
            //behaviour
            document.querySelector("#btnCancel").onclick = () => document.body.removeChild(resView);
        });
    }

    downloadBehaviour() {
        const btnDownload = document.querySelector("#tabs #others #download");
        btnDownload.addEventListener("click", () => {
            document.body.style.cursor = 'wait';
            this.tabMgr.refreshForDownload();
            this.processor.getPreview();
            document.body.style.cursor = 'default';
        });
    }


    setMasterBehaviours() {
        this.convertBudget();
        this.setPeriodDays();
        this.lockInputs();
        this.changeUsedFile();

        this.costBehaviour.setCostBehaviour();
        this.loadTable();
        this.downloadBehaviour();

        this.tabMgr.setTabHandlers();
        this.budgetCatButton();
    }
}