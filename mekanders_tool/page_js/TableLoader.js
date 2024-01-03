/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class TableLoader{
    constructor(reader) {
        this.reader = reader;
    }

    getBps(){
        const bValue = document.querySelector("#bValue");
        const pValue = document.querySelector("#pValue");
        return `B${bValue.value}/P${pValue.value}`;
    }

    //CATEGORY COSTS
    showCatRows(cats, header) {
        const bps = this.getBps();
        const tabel = document.querySelector("#overviews table");
        tabel.innerHTML = "";

        tabel.appendChild(header);
        Array.from(cats).forEach(r => {
            let row = document.createElement("tr");
            row.classList.add("row");
            if (r[0].includes(bps)) row.classList.add("selected");
            row.innerHTML = r.map(c => `<td class="col">${c}</td>`).reduce((c1, c2) => c1 + c2);
            tabel.appendChild(row);
        })
    }

    generateCatHeader(desc) {
        const tHeader = document.createElement("thead");
        tHeader.classList.add("row");

        const hd = new Array(1, 2, 3, 4, 5, 6, 7).map(x => `${x} ${desc}${x == 1 ? "" : "en"}`);
        hd.unshift("Beschrijving");

        hd.map(y => {
            const tableH = document.createElement("th");
            tableH.classList.add("col");
            tableH.innerHTML = y;
            return tableH;
        })
        .forEach(z => tHeader.appendChild(z));

        return tHeader;
    }

    mapCats(base, inc) {
        return new Array(0, 1, 2, 3, 4, 5, 6)
            //maps to sum of base + inc per workweek + (inc per weekend day * weekend modifier) 
            .map(c => {
                const work = inc * Math.min(c, 4);
                const weekend = inc * Math.max(c - 4, 0) * this.reader.global.weekend_modifier;
                return base + work + weekend;
            })
            .map(p => fixed_p(p, 6));
    }

    loadDag(cats) {
        const header = this.generateCatHeader("dag");
        const body = new Array();
        Array.from(cats).forEach(c => {
            const id = c.cat_ids.reduce((c1,c2) => `${c1} - ${c2}`);
            const info = c.cat_info;
            const row = [id].concat(this.mapCats(info.dag_basis, info.dag_inc));
            body.push(row);
        });
        this.showCatRows(body, header);
    }

    loadWoon(cats) {
        const header = this.generateCatHeader("nacht");
        const body = new Array();
        Array.from(cats).forEach(c => {
            const id = c.cat_ids.reduce((c1,c2) => `${c1} - ${c2}`);
            const info = c.cat_info;
            const row = [id].concat(this.mapCats(info.woon_basis, info.woon_inc));
            body.push(row);
        });
        this.showCatRows(body, header);
    }


    //PSYCHOSOCIAL COSTS
    headerPsycho() {
        let tHeader = document.createElement("thead");
        tHeader.classList.add("row");
        [{ h: "Uren per week", w: 2 }, { h: "Punten per jaar", w: 3 }, { h: "Kostprijs per jaar", w: 3 }].map(hd => {
            let head = document.createElement("th");
            head.classList.add(`col-${hd.w}`);
            head.innerHTML = hd.h;
            return head;
        }).forEach(t => tHeader.appendChild(t));

        return tHeader;
    }

    makeRow(desc, punten, prijs = ""){
        let row = document.createElement("tr");
        row.classList.add("row");
        const txtPunten = typeof punten === "number" ? fixed_p(punten, 6) + " punten" : punten;
        const txtPrijs = prijs == "" ? fixed_p(punten * this.reader.global.punt_euro_rate, 2) + " €" : prijs;
        row.innerHTML = `<td class="col-2">${desc}</td> 
                        <td class="col-3" style="text-align: right">${txtPunten}</td>
                        <td class="col-3" style="text-align: right">${txtPrijs}</td>`;
        return row;
    }

    loadPsycho() {
        const ps = this.reader.psycho;
        const tabel = document.querySelector("#overviews table");
        tabel.innerHTML = "";
        tabel.appendChild(this.headerPsycho());
        tabel.appendChild(this.makeRow("1 uur", ps.eerste));

        let som = ps.eerste + ps.tweede;
        tabel.appendChild(this.makeRow("2 uren", som));
        for (let i = 3; i <= 12; i++) {
            som += ps.tien;
            tabel.appendChild(this.makeRow(`${i} uren`, som));
        }
        tabel.appendChild(this.makeRow("Overige uren", `+${fixed_p(ps.overige, 6)} punten per uur`, `+${fixed_p(ps.overige * this.reader.global.punt_euro_rate, 2)} € per uur`));
    }

    //BP DESCRIPTIONS
    generateHeader(head){
        let header = document.createElement("thead");
        header.classList.add("row");
        head.forEach(t => {
            let thd = document.createElement("th");
            thd.innerText = t[0];
            thd.classList.add(`col-${t[1]}`);
            header.append(thd);
        });
        return header;
    }

    generateHeaderBP(head) {
        return this.generateHeader([[head, 2], ["Beschrijving", 10]]);
    }

    loadRows(map, header) {
        const tabel = document.querySelector("#overviews table");
        tabel.innerHTML = "";
        tabel.append(header);

        Array.from(map.keys()).forEach(k => {
            let row = document.createElement("tr");
            row.classList.add("row");
            row.innerHTML = `<td class="col-2">${k}</td> <td class="col-10">${map.get(k)}</td>`;
            tabel.append(row);
        })
    }

    loadDescriptions(map, type) {
        const header = this.generateHeaderBP(type);
        this.loadRows(map, header);
    }

    loadBudgetCats(){
        const tabel = document.createElement("table");
        const budgetCats = this.reader.budgetCats;
        const bps = this.getBps();

        const head = [["Budget Categorie", 2], ["Minimale Vereiste BP-Combinaties", 7], ["Zorggebonden Punten", 3]];
        const header = this.generateHeader(head);
        tabel.appendChild(header);

        Array.from(budgetCats).forEach(bc => {
            let row = document.createElement("tr");
            row.classList.add("row");
            if (bc.vereisteBP.includes(bps)) row.classList.add("selected");
            row.innerHTML = `<td class="col-2">${bc.budget}</td> <td class="col-7">${bc.vereisteBP.join(" - ")}</td> <td class="col-3">${ fixed_p(bc.ZorggebondenP, 6)}</td>`;
            tabel.append(row);
        });

        return tabel;
    }

    //PAKKETTEN DESCRIPTIONS
    generateHeaderPackets(head){
        let header = document.createElement("thead");
        header.classList.add("row");

        head.forEach(t => {
            let thd = document.createElement("th");
            thd.innerText = t[0];
            thd.classList.add(`col-${t[1]}`);
            header.append(thd);
        });
        return header;
    }

    loadPacketDescriptions(){
        const table = document.querySelector("#overviews table");
        const packets = this.reader.packets;

        let head = [["Pakketsoort", 3], ["Details", 5], ["Punten (jaar)", 2], ["Prijs (jaar)", 2]];
        let header = this.generateHeaderPackets(head);
        table.append(header);

        packets.forEach(p => {
            let row = document.createElement("tr");
            row.classList.add("row");
            row.innerHTML = `<td class="col-${head[0][1]}">${p.beschrijving}</td>
                            <td class="col-${head[1][1]}">${p.detail}</td>
                            <td class="col-${head[2][1]}">${fixed_p(p.punten, 6)}</td>
                            <td class="col-${head[3][1]}">€ ${fixed_p(p.punten * this.reader.global.punt_euro_rate, 2)}</td>`;
            table.append(row);
        });
    }
}