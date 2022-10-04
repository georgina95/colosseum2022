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

            },

			onPressAddNewTask: async function (oEvent) {
				if (!this.newTaskDialog) {
					this.newTaskDialog = await this.loadFragment({ name: "colosseum2022.app.fragment.NewTask" });
				} 

				this.getView().addDependent(this.newTaskDialog);
				const sCurrentDate = this.getNewDate();
				const iNewId = this.getNewId();
				const oNewTaskModel = new sap.ui.model.json.JSONModel({ title: "", description: "", duedate: sCurrentDate, status: false, ID: iNewId });
				this.newTaskDialog.setModel(oNewTaskModel);
				this.newTaskDialog.open();
			},

			getNewDate: function() {
				const oDate = new Date();

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

        });
    });
