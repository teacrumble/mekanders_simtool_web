/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class CostBehaviour {

    constructor(rowcalculator, reader) {
        this.rowcalculator = rowcalculator;
        this.reader = reader;
    }

    totalsChange() {
        const totalen = document.querySelectorAll("#ondersteuningen>:not(.header) .totaal, #andere .totaal, .res, .tussen");
        const resR = document.querySelector("#switchTotal input:checked").value;
        totalen.forEach(t => {
            t.classList.remove("symbP");
            t.classList.remove("symbE");
            if (t.innerHTML != "") {
                if (resR == "P") t.classList.add("symbP");
                else t.classList.add("symbE");
            }
        });
    }


    setResultDag() {
        //select elements
        const woon = document.querySelector("#woon input");
        const dag = document.querySelector("#dagRow");
        const minmax = dag.querySelector(".minmax .col-9");
        const totalD = dag.querySelector(".minmax input");
        const totaal = dag.querySelector(".totaal");
        const input = dag.querySelector("input");
        const ratio = document.querySelector("#VAPH_Ratio");

        input.addEventListener("input", e => {
            const periode = getPeriodDays();
            const resR = document.querySelector("#switchTotal input:checked").value;
            const inpVal = eval(input.value);

            const periodeConstraint =  periode >= 180 && ((eval(woon.value) / 7) * periode) <= 60;
            const withoutLiving = woon.value == "" || periodeConstraint;
            let max = 7;//withoutLiving ? 5 : 7;
            const inPoints = resR == "P";
            const decimals = inPoints ? 6 : 2;

            const isInvalid = v => v!== v || v == 0;
            const boundaries = this.rowcalculator.getMinMaxDay(inpVal, periode, withoutLiving);
            totalD.value =   isInvalid(boundaries.total) ? "" : boundaries.total;

            if (inpVal <= max && inpVal > 0) {
                const price = this.rowcalculator.calculateCostDay(inpVal, periode, inPoints);
                totaal.innerHTML = fixed_p(price*ratio.value, decimals);
                minmax.innerHTML = "Totaal " +boundaries.show();
            } else {
                minmax.innerHTML = "Totaal ";
                totaal.innerHTML = "";
            }

            document.querySelector("#activiteiten input").dispatchEvent(new Event("input"));
            this.calculateTotal();
        });

        totalD.addEventListener("blur", e => {
            const inpVal = eval(totalD.value);
            const periode = getPeriodDays();
            const periodeConstraint =  periode >= 180 && ((eval(woon.value) / 7) * periode) <= 60;
            const withoutLiving = woon.value == "" || periodeConstraint;


            if (inpVal > 0) input.value = this.rowcalculator.reverseDay(inpVal, periode, withoutLiving);
            else input.value = "";

            input.dispatchEvent(new Event("input"));

        });

    }

    setResultWoon() {
        const woon = document.querySelector("#woonRow");
        const minmax = woon.querySelector(".minmax .col-9");
        const totalD = woon.querySelector(".minmax input");
        const totaal = woon.querySelector(".totaal");
        const input = woon.querySelector("input");
        const ratio = document.querySelector("#VAPH_Ratio");

        input.addEventListener("input", e => {
            const periode = getPeriodDays();
            const resR = document.querySelector("#switchTotal input:checked").value;
            const inPoints = resR == "P";
            const inpVal = eval(input.value);
            const decimals = inPoints ? 6 : 2;

            const isInvalid = v => v!== v || v == 0;
            const boundaries = this.rowcalculator.getMinMaxLiving(inpVal, periode);
            totalD.value =  isInvalid(boundaries.total)  ? "" : boundaries.total;

            if (inpVal <= 7 && inpVal > 0) {
                const price = this.rowcalculator.calculateCostLiving(inpVal, periode, inPoints);
                totaal.innerHTML = fixed_p(price*ratio.value, decimals);
                minmax.innerHTML = "Totaal " + boundaries.show();
            } else {
                minmax.innerHTML = "Totaal ";
                totaal.innerHTML = "";
            }

            if (e.isTrusted || e.detail == "total") update();
            this.calculateTotal();
        });



        totalD.addEventListener("input", e => {
            const inpVal = eval(totalD.value);
            const periode = getPeriodDays();

            if (inpVal > 0) input.value = this.rowcalculator.reverseWoon(inpVal, periode);
            else input.value = "";

            input.dispatchEvent(new CustomEvent("input", {detail: "total"}));
        });
    }

    setResultPsychoPak(element, ratiod){
        const minmax = element.querySelector(".minmax .col-9");
        const totalD = element.querySelector(".minmax input");
        const totaal = element.querySelector(".totaal");
        const input = element.querySelector("input");
        const ratio = document.querySelector("#VAPH_Ratio");

        input.addEventListener("input", e => {
            const periode = getPeriodDays();
            const resR = document.querySelector("#switchTotal input:checked").value;
            const inpVal = eval(input.value);
            const inPoints = resR == "P";
            const decimals = inPoints ? 6 : 2;

            const isInvalid = v => v!== v || v == 0;
            const boundaries = this.rowcalculator.getMinMaxPsycho(inpVal, periode);
            totalD.value =  isInvalid(boundaries.total)  ? "" : boundaries.total;

            if (inpVal <= 99 && inpVal > 0) {
                const price = this.rowcalculator.calculateCostPsycho(inpVal, periode, inPoints);
                totaal.innerHTML = fixed_p( ratiod ? price*ratio.value : price, decimals);
                minmax.innerHTML = "Totaal " + boundaries.show();
            } else {
                minmax.innerHTML = "Totaal ";
                totaal.innerHTML = "";
            }

            this.calculateTotal();
        });

        totalD.addEventListener("input", e => {
            const inpVal = eval(totalD.value);
            const periode = getPeriodDays();

            if (inpVal > 0) input.value = this.rowcalculator.reversePsycho(inpVal, periode);
            else input.value = "";
            input.dispatchEvent(new Event("input"));
        });
    }

    setResultPsycho() {
        const psycho = document.querySelector("#psychoRow");
        this.setResultPsychoPak(psycho, true);
    }

    setResultPakket(){
        const pakket = document.querySelector("#pakketten");
        this.setResultPsychoPak(pakket, true);
    }
    /*
    setResultPakket() {
        const pakketten = document.querySelector("#pakketten");
        const pakketSelect = pakketten.querySelector("select");
        const pakketBeschrijving = pakketten.querySelector(".details");
        const pakketTotaal = pakketten.querySelector(".totaal");

        pakketSelect.onchange = () => {
            const resR = document.querySelector("#switchTotal input:checked");
            const inPoints = resR.value == "P";
            const decimals = inPoints ? 6 : 2;
            let option = pakketSelect.options[pakketSelect.selectedIndex].text;

            let pakket = this.reader.packets.get(option);
            if (pakket == undefined) pakket = { detail: "", punten: "" };

            pakketBeschrijving.innerHTML = pakket.detail;

            if (pakket.punten != "") {
                let price = (pakket.punten/365)*getPeriodDays();
                if (!inPoints) price *= this.reader.global.punt_euro_rate;
                pakketTotaal.innerHTML = fixed_p(price, decimals);
            }
            else pakketTotaal.innerHTML = "";

            this.calculateTotal();
        }
    }*/

    setResultActiviteiten() {
        const activiteiten = document.querySelector("#activiteiten");
        const acts = activiteiten.querySelector("input");
        const desc = activiteiten.querySelector(".info");
        const actTotaal = activiteiten.querySelector(".totaal");
        const dag = document.querySelector("#dagRow");
        const inp = dag.querySelector("input");


        acts.addEventListener("input", () => {
            const resR = document.querySelector("#switchTotal input:checked");
            const inPoints = resR.value == "P";
            const decimals = inPoints ? 6 : 2;

            let totaldays = eval(inp.value+"+0");

            if (acts.checked) {
                let price = this.reader.global.activiteiten_ontmoeting;
                let cat = this.rowcalculator.category;

                let dagen_per_week = price / cat.dag_inc;
                if(inp.value < 1) {
                    let totaled = (inp.value * cat.dag_basis + price);
                    if(totaled <= cat.dag_basis) dagen_per_week = price / cat.dag_basis;
                    else {
                        let first = (cat.dag_basis - inp.value * cat.dag_basis)
                        let second = price - first;
                        dagen_per_week = (first / cat.dag_basis) + (second / cat.dag_inc)
                    }
                }
                else{
                    let valued_dag = cat.dag_basis + ((inp.value > 5) ?
                        (4 * cat.dag_inc) + (inp.value%5)*cat.dag_inc*this.reader.global.weekend_modifier
                        : (inp.value-1) * cat.dag_inc);
                    let totaled = valued_dag + price;
                    let weekMax = cat.dag_basis + (4 * cat.dag_inc) + (2*cat.dag_inc*this.reader.global.weekend_modifier);

                    if(valued_dag >= (cat.dag_basis + cat.dag_inc * 4)){
                        dagen_per_week = price / (cat.dag_inc * this.reader.global.weekend_modifier)

                        if(totaled > weekMax){
                            inp.value = fixed_p(7 - dagen_per_week, 6);
                            inp.dispatchEvent(new Event("input"));
                        }
                    } else if(totaled > (cat.dag_basis + cat.dag_inc * 4)){
                        let before_we = ((cat.dag_basis + cat.dag_inc * 4) - valued_dag);
                        let after_we = price - before_we;
                        dagen_per_week = (before_we / cat.dag_inc) + (after_we / (cat.dag_inc * this.reader.global.weekend_modifier))
                    }
                }
                desc.innerHTML = ` &asymp; ${fixed_p(dagen_per_week, 6)} Dagen per week`;

                if (!inPoints) price *= this.reader.global.punt_euro_rate;
                actTotaal.innerHTML = fixed_p(price, decimals);

                totaldays = Math.min(fixed_p(totaldays + dagen_per_week, 6), 7);
            }
            else {
                actTotaal.innerHTML = "";
                desc.innerHTML = "";
            }

            //totalen
            let totaalDag = eval(document.querySelector("#dagRow .totaal").innerHTML);
            let totaalAct = eval(actTotaal.innerHTML);
            //zet som
            let som = (totaalDag ? totaalDag : 0) + (totaalAct ? totaalAct : 0);

            if(som > 0) document.querySelector("#dag_inc_activiteiten .tussen").innerHTML = fixed_p(som, decimals);
            else document.querySelector("#dag_inc_activiteiten .tussen").innerHTML = "";

            if(totaldays > 0) document.querySelector("#dag_inc_activiteiten .info").innerHTML = "" + totaldays + " dagen per week";
            else document.querySelector("#dag_inc_activiteiten .info").innerHTML = "";

            this.calculateTotal();
        });
    }

    setResultBesteedbaar() {
        const besteedbaar = document.querySelector("#besteedbaarDeel");
        const besteedInput = besteedbaar.querySelector("input");
        const besteedPunten = besteedbaar.querySelector(".totaal");
        const persoonlijkPunten = document.querySelector("#budgetP");

        besteedInput.addEventListener("input", () => {
            const persoonlijk = eval(persoonlijkPunten.value + 0);
            const max = persoonlijk <= 34.81 ? 1800 : 3600;
            const resR = document.querySelector("#switchTotal input:checked");
            const inPoints = resR.value == "P";
            const decimals = inPoints ? 6 : 2;
            let prijs = eval(`${besteedInput.value}+0`);

            if (prijs > 0 && prijs <= max) {
                if (inPoints) prijs /= this.reader.global.besteedbaar_rate;
                besteedPunten.innerHTML = fixed_p(prijs, decimals)
            }
            else besteedPunten.innerHTML = "";

            this.calculateTotal();
        });
    }

    calculateTotal() {
        //resultrows
        const resRow = document.querySelector("#res");
        const budgetRow = document.querySelector("#resBudgetRow");
        const totRow = document.querySelector("#resCostRow");

        //restype & budget
        const resR = document.querySelector("#switchTotal input:checked").value;
        const budget = document.querySelector(`#budget${resR}`);
        const resType = resR == "P" ? 6 : 2;
        const budgetValue = eval(`${budget.value}+0`);
        budgetRow.querySelector(".res").innerHTML = budgetValue > 0 ? fixed_p(budgetValue, resType) : "";

        //result
        const totalen = document.querySelectorAll("#ondersteuningen>div:not(.header) .totaal, #andere .totaal");
        let result = 0;
        totalen.forEach(t => result += eval(`${t.innerHTML}+0`));

        resRow.innerHTML = result > 0 ? fixed_p(result, resType) : "";

        if (budget.value != "" && resRow.innerHTML != "") {
            const verschil = budgetValue - result;
            totRow.querySelector(".res").innerHTML = `${verschil > 0 ? "+" : "-"}${fixed_p(Math.abs(verschil), resType)}`;

            totRow.removeAttribute("hidden");
        } else {
            totRow.setAttribute("hidden", "");
        }
        this.totalsChange();
    }

    changeSymbols() {
        const switchR = document.querySelectorAll("#switchTotal input");
        switchR.forEach(r => r.onchange = () => {
            update();
            this.calculateTotal();
        });

        switchR[0].checked = true;
    }


    setCostBehaviour() {
        this.changeSymbols();
        this.setResultDag();
        this.setResultWoon();
        this.setResultPsycho();
        this.setResultPakket();
        this.setResultActiviteiten();
        this.setResultBesteedbaar();
    }
}
