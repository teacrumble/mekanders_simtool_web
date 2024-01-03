/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class JsonReader {
    constructor() {
        this.read_cat();
        this.read_cat(false);
        this.read_global();
        this.read_psycho();
        this.read_pack();
        this.read_b();
        this.read_p();
        this.read_b(false);
        this.read_p(false);
        this.read_bc();
        this.currentCat = new Category(0, 0, 0, 0, 0);
    }

    to_map(obj) {
        const map = new Map();
        Object.keys(obj).forEach(k => {
            map.set(k, obj[k]);
        });
        return map;
    }

    async read_cat(useNew = true) {
        useNew ?
            this.categories = JSON.parse(await FilesHandler.read_cat(useNew))
            : this.oldCategories = JSON.parse(await FilesHandler.read_cat(useNew))
    }

    async read_global() {
        //return FilesHandler.read_global().then(res => JSON.parse(res))
        this.global = JSON.parse(await FilesHandler.read_global());
    }

    async read_pack() {
        this.packets = this.to_map(JSON.parse(await FilesHandler.read_pack()));
    }

    async read_b(useNew = true) {
        useNew ? 
            this.bValues = this.to_map(JSON.parse(await FilesHandler.read_bvalues(useNew)))
            : this.oldBValues = this.to_map(JSON.parse(await FilesHandler.read_bvalues(useNew)));
    }

    async read_p(useNew = true) {
        useNew ? 
            this.pValues = this.to_map(JSON.parse(await FilesHandler.read_pvalues(useNew)))
            : this.oldPValues = this.to_map(JSON.parse(await FilesHandler.read_pvalues(useNew)));
    }

    async read_psycho() {
        this.psycho = JSON.parse(await FilesHandler.read_psycho());
    }

    async read_bc(){
        this.budgetCats = JSON.parse(await FilesHandler.read_budgetcats());
    }

}