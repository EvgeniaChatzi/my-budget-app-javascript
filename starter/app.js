
//BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            ID = 0;

            //ID: [1,2,3,4,5] next ID: 6 (index)
            //but what if we delete some id's: [1,2,4,7,8] next ID should be always the last array item plus 1! (not index)--> 9
            //so we want ID = last ID + 1

            //create new ID 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //create new item bases on "exp" or "inc" type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            //1.calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            //2.calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3.calculate the total persentage that we 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    }

})();



//UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container"

    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,//either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;
            //create HTML string with placeholder text
            if (type === "inc") {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> 
                <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>`
            } else if (type === "exp") {
                element = DOMStrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
            }

            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", obj.value);

            //replace placeholder text witha ctual data
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);


        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue)
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExpenses;


            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + " %";
            } else if (obj.percentage <= 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = "0" + " %";
            }
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    }

})();



//GLOBALL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.addButton).addEventListener("click", ctrlAddItem)

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

            document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        })

    }

    var updateBudget = function () {

        //1.calculate the budget
        budgetCtrl.calculateBudget();

        //2.return the budget
        var budget = budgetCtrl.getBudget();
        console.log(budget);


        //3.display the budget on ui
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        var input, newItem;

        //1.get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2.add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3.add the item to ui
            UICtrl.addListItem(newItem, input.type);

            //4.clear the firlds
            UICtrl.clearFields();

            //5.calculate and update budget
            updateBudget();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitID, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        //id
        if (itemId) {
            splitID = itemId.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        //delete the item from the data structure
        budgetCtrl.deleteItem(type, ID);

        //dlete item from the UI 
        UICtrl.deleteListItem(itemId);

        //update and show the new budget
        updateBudget();
    }

    return {
        init: function () {
            console.log("it is working!")
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            }
            );
            setUpEventListeners();
        }
    }

})(budgetController, UIController);



controller.init();