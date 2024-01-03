/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class MinMax {
    constructor(total, extension) {
        this.total = Math.round(total*2)/2;
        this.min = Math.ceil(total * 0.9);
        this.max = Math.ceil(total * 1.05);
        this.extension = extension;
    }

    changeMax(altMax) {
        if (altMax < this.max) this.max = altMax;
        return (altMax < this.max);
    }

    show() {
        return ` (Min. ${this.min} - Max. ${this.max}) `;
    }

}

class Category {
    constructor(dag_basis, dag_inc, woon_basis, woon_inc, weekend_mod) {
        this.dag_basis = dag_basis;
        this.dag_inc = dag_inc;
        this.woon_basis = woon_basis;
        this.woon_inc = woon_inc;
        this.weekend_mod = weekend_mod;
    }

    GetWeeklyCost(weekDays, baseV, incV) {
        if (weekDays <= 1) return weekDays * baseV;
        if (weekDays <= 5) return baseV + (incV * (weekDays - 1));
        return baseV + (incV * 4) + (incV * (weekDays - 5) * this.weekend_mod);
    }

    getWeeklyCostDay(weekDays) {
        return this.GetWeeklyCost(weekDays, this.dag_basis, this.dag_inc);
    }

    getWeeklyCostLiving(weekDays) {
        return this.GetWeeklyCost(weekDays, this.woon_basis, this.woon_inc);
    }
}