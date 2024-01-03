/**
 * Copyright 2020 Dries Rascar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class RowCalculator {
    constructor(valutaConvert, category, psycho) {
        this.valutaRate = valutaConvert;
        this.category = category;
        this.psycho = psycho;
    }

    GetWeeklyPricePsycho(hoursPerWeek) {
        if (hoursPerWeek <= 0) return 0;
        if(hoursPerWeek < 1) return this.psycho.eerste * hoursPerWeek;
        if (hoursPerWeek < 3) return this.psycho.eerste + (this.psycho.tweede * (hoursPerWeek - 1));
        if (hoursPerWeek < 13) return this.psycho.eerste + this.psycho.tweede + (this.psycho.tien * ((hoursPerWeek - 2) % 11));
        return this.psycho.eerste + this.psycho.tweede + (this.psycho.tien * 10) + (this.psycho.overige * (hoursPerWeek - 12));
    }

    //calculate costs
    calculateCost(weeklyPrice, days, inpoints, ratio) {
        const periodPrice = ((weeklyPrice / 365) * days) * ratio;
        if (inpoints) return periodPrice;
        return periodPrice * this.valutaRate;
    }
    calculateCostDay(weeklyAmount, days, inpoints, ratio=1) {
        const weeklyPrice = this.category.getWeeklyCostDay(weeklyAmount);
        return this.calculateCost(weeklyPrice, days, inpoints, ratio);
    }
    calculateCostLiving(weeklyAmount, days, inpoints, ratio=1) {
        const weeklyPrice = this.category.getWeeklyCostLiving(weeklyAmount);
        return this.calculateCost(weeklyPrice, days, inpoints, ratio);
    }
    calculateCostPsycho(weeklyAmount, days, inpoints, ratio=1) {
        const weeklyPrice = this.GetWeeklyPricePsycho(weeklyAmount);
        return this.calculateCost(weeklyPrice, days, inpoints, ratio);
    }

    //minmax
    getMinMax(weeklyAmount, days, extension) {
        const total = (weeklyAmount / 7) * days;
        return new MinMax(total, extension);
    }
    getMinMaxDay(weeklyAmount, days, withoutLiving) {
        //const newAmount = withoutLiving ? (weeklyAmount * 245) / 260 : weeklyAmount;
        const newAmount = weeklyAmount;
        const result = this.getMinMax(newAmount, days, "dagen");
        result.changeMax(days);
        return result;
    }
    getMinMaxLiving(weeklyAmount, days) {
        const result = this.getMinMax(weeklyAmount, days, "nachten");
        result.changeMax(days);
        return result;
    }
    getMinMaxPsycho(weeklyAmount, days) {
        //const newAmount = (weeklyAmount * 44) / 52;
        const newAmount = weeklyAmount;
        return this.getMinMax(newAmount, days, "uren");
    }

    //reverse calculate
    reverseTotal(total, days){
        return ((total / days) * 7).toPrecision(4);
    }

    reverseDay(total, days, withoutLiving){
        //const newAmount = withoutLiving ? (total * 260) / 245 : total;
        const newAmount = total;
        return this.reverseTotal(newAmount, days);
    }

    reverseWoon(total, days){
        return this.reverseTotal(total, days);
    }

    reversePsycho(total, days){
        //const newAmount = (total * 52) / 44;
        const newAmount = total;
        return this.reverseTotal(newAmount, days);
    }
    
}
