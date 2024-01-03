/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class FilesHandler {
    static async read_json(file) {
        //----------------------------------------------------------
        //debug path
        //const fullPath = path.resolve("src/json/" + file);
        //----------------------------------------------------------
        //release path
        //const fullPath = path.resolve("resources/app/src/json/" + file);
        //----------------------------------------------------------

        //return fs.readFileSync(fullPath, 'utf8');
        
        return fetch('./json/'+file).then(resp => resp.text()).then(json => {return json;});
    }

    static read_psycho() {
        return this.read_json("psycho.json");
    }

    static read_cat(newValues) {
        return newValues ? this.read_json("categorie/new/categorieen.json") :
            this.read_json("categorie/transition/transitie.categorieen.json");
    }

    static read_global() {
        return this.read_json("globale_gegevens.json");
    }

    static read_pack() {
        return this.read_json("pakketten.json");
    }

    static read_bvalues(newValues) {
        return newValues ? this.read_json("categorie/new/bwaarden.json") :
            this.read_json("categorie/transition/transitie.bwaarden.json");
    }

    static read_pvalues(newValues) {
        return newValues ? this.read_json("categorie/new/pwaarden.json") :
            this.read_json("categorie/transition/transitie.pwaarden.json");
    }

    static read_budgetcats(){
        return this.read_json("budgetcat.json");
    }
}