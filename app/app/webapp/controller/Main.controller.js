sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"colosseum2022/app/utils/formatter",
	"sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, Fragment) {
        "use strict";

        return Controller.extend("colosseum2022.app.controller.Main", {

			formatter: formatter,
			
            onInit: function () {
				const oFroDate = new Date(0);
				const oToDate = new Date((new Date()).setFullYear((new Date()).getFullYear()+1));
				const oFilterModel = new sap.ui.model.json.JSONModel({ dueFrom: oFroDate, dueTo: oToDate, doneTrue: true, doneFalse: true, sortProperty: 'ID', descending: false });
				this.getView().setModel(oFilterModel, "Filters");
            },

			onPressAddNewTask: async function (oEvent) {
				if (!this.newTaskDialog) {
					this.newTaskDialog = await this.loadFragment({ name: "colosseum2022.app.fragment.NewTask" });
				} 

				this.getView().addDependent(this.newTaskDialog);
				const sCurrentDate = this.getNewDate(new Date());
				const iNewId = this.getNewId();
				const oNewTaskModel = new sap.ui.model.json.JSONModel({ title: "", description: "", duedate: sCurrentDate, status: false, ID: iNewId });
				this.newTaskDialog.setModel(oNewTaskModel);
				this.newTaskDialog.open();
			},

			getNewDate: function(oDate) {
				const sYear = oDate.getFullYear().toString();
				let iMonth = oDate.getMonth() + 1;
				const sMonth = (iMonth < 10) ? '0' + iMonth : iMonth.toString();
				let iDay = oDate.getDate();
				const sDay = (iDay < 10) ? '0' + iDay : iDay.toString();
				
				return sYear + "-" + sMonth + "-" + sDay;
			},

			getNewId: function() {
				const oList = this.byId("MainTaskList");
				const aItems = oList.getItems();
				let iMax = aItems.reduce(function(iCurrentMax, oItem) {
					const oCurrentContext = oItem.getBindingContext("CatalogModel");
					if(!oCurrentContext) {
						return iCurrentMax;
					}
					const iID = oCurrentContext.getObject().ID;
					return (iID > iCurrentMax) ? iID : iCurrentMax;
				}, 0);
				return iMax + 1;
			},

			onAddTask: function() {
				const oNewTaskModel = this.newTaskDialog.getModel();
				const oNewTask = oNewTaskModel.getData();

				const oList = this.byId("MainTaskList");
				const oBinding = oList.getBinding("items");
				const oContext = oBinding.create(oNewTask);

				this.getView().getModel("CatalogModel").submitBatch("taskGroup");

				oContext.created().then(function () {
					const oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					this.newTaskDialog.close();
					sap.m.MessageToast.show(oI18nBundle.getText("TaskCreated"));					
				}.bind(this)).catch(function (oError) {
					this.newTaskDialog.close();
					sap.m.MessageToast.show(oError.message);	
				}.bind(this));
			},

			onCloseDialog: function() {
				this.newTaskDialog.close();
			},

			onPressTask: async function(oEvent) {
				const oListItem = oEvent.getSource();
				const oContext = oListItem.getBindingContext("CatalogModel");
				//const oAlternateContext = this.byId("MainTaskList").getBinding("items").getModel().createBindingContext("/1");

				if (!this.editTaskDialog) {
					this.editTaskDialog = await this.loadFragment({ name: "colosseum2022.app.fragment.TaskDetails" });
					this.getView().addDependent(this.editTaskDialog);
				} 

				this.editTaskDialog.setBindingContext(oContext, "CatalogModel");
				this.editTaskDialog.open();
			},

			onSaveEditTask: function() {
				this.getView().getModel("CatalogModel").submitBatch("taskGroup");
				this.editTaskDialog.close();
			},

			onDeleteTask: function (oEvent) {
				const oSelected = oEvent.getSource();
				oSelected.getBindingContext("CatalogModel").delete("$auto").then(function () {
					const oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					this.editTaskDialog.close();
					sap.m.MessageToast.show(oI18nBundle.getText("deletionSuccessMessage"));
				}.bind(this), function (oError) {
					this.editTaskDialog.close();
					sap.m.MessageBox.error(oError.message);
				}.bind(this));
			},

			onCloseEditDialog: function() {
				this.getView().getModel("CatalogModel").resetChanges("taskGroup");
				this.editTaskDialog.close();
			},

			onPressFilter: async function() {
				if (!this.filterDialog) {
					this.filterDialog = await this.loadFragment({ name: "colosseum2022.app.fragment.FilterDialog" });
				} 

				this.getView().addDependent(this.filterDialog);
				this.filterDialog.open();
			},

			onFilter: function () {
				const oList = this.byId("MainTaskList");
				const oBinding = oList.getBinding("items");

				const aFilters = this.createFilters();

				oBinding.filter(aFilters, sap.ui.model.FilterType.Application);

				this.filterDialog.close();
			},

			createFilters: function() {
				const oFilterModel = this.getView().getModel("Filters");
				const oValues = oFilterModel.getData();

				const sFroDate = this.getNewDate(oValues.dueFrom);
				const sToDate = this.getNewDate(oValues.dueTo);

				const oDueFromFilter = new sap.ui.model.Filter({ path: "duedate", operator: sap.ui.model.FilterOperator.GE, value1: sFroDate });
				const oDueToFilter = new sap.ui.model.Filter({ path: "duedate", operator: sap.ui.model.FilterOperator.LE, value1: sToDate });
				const oDueFilter = new sap.ui.model.Filter({ filters: [oDueFromFilter, oDueToFilter], and: true });
				
				const aFilters = [oDueFilter];
				if(oValues.doneTrue) {
					if(!oValues.doneFalse) {
						aFilters.push(new sap.ui.model.Filter({ path: "status", operator: sap.ui.model.FilterOperator.EQ, value1: true }));
					}
				} else {
					if(oValues.doneFalse) {
						aFilters.push(new sap.ui.model.Filter({ path: "status", operator: sap.ui.model.FilterOperator.EQ, value1: false }));
					}
				}

				return new sap.ui.model.Filter({ aFilters, and: true });
			},

			onCloseFilterDialog: function() {
				this.filterDialog.close();
			},

			onPressSort: async function () {
				if (!this.sorterDialog) {
					this.sorterDialog = await this.loadFragment({ name: "colosseum2022.app.fragment.SorterDialog" });
				} 

				this.getView().addDependent(this.sorterDialog);
				this.sorterDialog.open();
			},

			onSortPropertyChange: function(oEvent) {
				const sIndex = oEvent.getParameter("selectedIndex");
				const oSource = oEvent.getSource();
				const aButtons = oSource.getButtons();

				const sSelectedProperty = aButtons[sIndex].getId().split("--").pop();
				const oFilterModel = this.getView().getModel("Filters");
				oFilterModel.setProperty("/sortProperty", sSelectedProperty);
			},

			onSort: function() {
				const oList = this.byId("MainTaskList");
				const oBinding = oList.getBinding("items");

				const oFilterModel = this.getView().getModel("Filters");
				const oValues = oFilterModel.getData();

				const oSorter = new sap.ui.model.Sorter({ path: oValues.sortProperty, descending: oValues.descending });

				oBinding.sort(oSorter);

				this.sorterDialog.close();
			},

			onCloseSorterDialog: function() {
				this.sorterDialog.close();
			},

        });
    });
