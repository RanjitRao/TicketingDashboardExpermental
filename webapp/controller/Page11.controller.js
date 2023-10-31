sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/ui/model/json/JSONModel',
	'com/ticketDashboard/util/Formatter'
], function (BaseController, MessageToast, Utilities, History, JSONModel, Formatter) {
	"use strict";

	return BaseController.extend("com.ticketDashboard.controller.Page1", {
		onInit: function () {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			var oModel = new JSONModel();
			oModel.setData({
				"Filter": [{
					"Text": "Complete",
					"Selected": false,
					"Field": "fields/Status"
				}, {
					"Text": "Pending",
					"Selected": false,
					"Field": "fields/Status"
				}, {
					"Text": "Testing",
					"Selected": false,
					"Field": "fields/Status"
				}]
			});
			this.getView().setModel(oModel, "AppModel");
			this.DefectFilter = [];
			this.url = "https://api.airtable.com/v0/";
			this.base = "appOE2OSbvgZS1PTB";
			//this.key = "keyqao05lXGq4C8DY";
			this.key = "pat6X943CSPfPjjBv.df44deaa15070a002104891bd5be1e20534da445e7edf65a17332a9cbfb3070e";
			this.loadDefects(true);
		},
		onRouteMatched: function (oEvent) {
			var oNameParameter = oEvent.getParameter("name");
			if (oNameParameter === "Page1") {
				//
			}
		},
		loadDefects: function (bLoadTR) {
			var that = this;
			$.ajax({
				url: this.url + that.base + "/Issue",
				headers: {
					"Authorization": "Bearer " + that.key
				},
				success: function (data) {
					var oModel = new JSONModel();
					oModel.setData(data);
					that.getView().setModel(oModel, "DefectModel");
					that.prepareData(bLoadTR);
				},
				error: function (result) {
					MessageToast.show("Error");
				}
			});
		},
		prepareData: function (bLoadTR) {
			var statusArr = [];
			var finalData = [];
			var _trData = this.getView().getModel("DefectModel").getProperty("/records");
			for (var i = 0; i < _trData.length; i++) {
				var index = (statusArr.indexOf(_trData[i].fields.Status));
				if (index === -1) {
					finalData.push({
						"Status": _trData[i].fields.Status,
						"Count": 1
					});
					statusArr.push(_trData[i].fields.Status);
				} else {
					finalData[index].Count++;
				}
			}
			var oModel = new JSONModel();
			oModel.setData({
				"records": finalData
			});
			this.getView().setModel(oModel, "ChartModel");
			if (bLoadTR) {
				this.loadTR();
			}
		},
		loadTR: function () {
			var that = this;
			$.ajax({
				url: this.url + that.base + "/TR",
				headers: {
					"Authorization": "Bearer " + that.key
				},
				success: function (data) {
					var oModel = new JSONModel();
					oModel.setData(data);
					that.getView().setModel(oModel, "TRModel");
				},
				error: function (result) {
					MessageToast.show("Error");
				}
			});
		},
		onPressMoreDefect: function () {
			this.byId("navCon").to(this.byId("Defect"));
		},
		onListItemPress: function (oEvent) {
			var listItem = oEvent.getSource().getSelectedItem();
			var _selData = this.getView().getModel("DefectModel").getProperty(listItem.getBindingContext("DefectModel").getPath());
			var oModel = new JSONModel();
			oModel.setData(_selData);
			this.getView().setModel(oModel, "DetailDefectModel");
		},
		onPressSave: function () {
			var that = this;
			var _detailData = this.getView().getModel("DetailDefectModel").getProperty("/");
			var _data = {
				"records": [{
					"id": _detailData.id,
					"fields": {
						"Defect": _detailData.fields.Defect,
						"DevGroup": _detailData.fields.DevGroup,
						"Desc": _detailData.fields.Desc,
						"RaisedDate": _detailData.fields.RaisedDate,
						"ClosedDate": _detailData.fields.ClosedDate === undefined ? (new Date()).toISOString().split("T")[0] : _detailData.fields.ClosedDate,
						"TR": _detailData.fields.TR,
						"App": _detailData.fields.App,
						"Developer": _detailData.fields.Developer,
						"Status": _detailData.fields.Status,
						"DefectType": _detailData.fields.DefectType
					}
				}]
			};
			$.ajax({
				url: this.url + that.base + "/Issue",
				type: 'PATCH',
				//contentType: "application/json; charset=UTF-8",
				data: JSON.stringify(_data),
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + that.key);
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				success: function (data1) {
					that.onDefectListRefresh();
					MessageToast.show("Status updated successfully.");
				},
				error: function (result) {
					MessageToast.show(result.responseJSON.error.type + ": " + result.responseJSON.error.message);
				}
			});
		},
		onPressTRRelease: function (oEvent) {
			var that = this;
			//	var _trData = this.getView().getModel("TRModel").getProperty("/");
			var _data = {
				"records": [{
					"id": oEvent.getSource().data("id"),
					"fields": {
						// "Defect": _detailData.fields.Defect,
						// "DevGroup": _detailData.fields.DevGroup,
						// "Desc": _detailData.fields.Desc,
						// "RaisedDate": _detailData.fields.RaisedDate,
						// "ClosedDate": _detailData.fields.ClosedDate === undefined ? (new Date()).toISOString().split("T")[0] : _detailData.fields.ClosedDate,
						// "TR": _detailData.fields.TR,
						// "App": _detailData.fields.App,
						// "Developer": _detailData.fields.Developer,
						//	"DefectType": _detailData.fields.DefectType,
						"Status": "P4T"
					}
				}]
			};
			$.ajax({
				url: this.url + that.base + "/TR",
				type: 'PATCH',
				//contentType: "application/json; charset=UTF-8",
				data: JSON.stringify(_data),
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + that.key);
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				success: function (data1) {
					that.loadTR();
					MessageToast.show("Status updated successfully.");
				},
				error: function (result) {
					MessageToast.show(result.responseJSON.error.type + ": " + result.responseJSON.error.message);
				}
			});

		},
		onPressAddDefect: function () {
			this.byId("navCon").to(this.byId("AddDefect"));
			var oEntry = {
				"Defect": "",
				"DevGroup": "",
				"Desc": "",
				"RaisedDate": (new Date()).toISOString().split("T")[0],
				"Responsible": "",
				"App": "",
				"DefectType": "X",
				"Status": "Pending"
			};
			var oModel = new JSONModel();
			oModel.setData({
				"data": [oEntry]
			});
			this.getView().setModel(oModel, "AddDefectsModel");
		},
		onPressAddDefectRow: function () {
			var data = this.getView().getModel("AddDefectsModel").getProperty("/data");
			data.push({
				"Defect": "",
				"DevGroup": "",
				"Desc": "",
				"RaisedDate": (new Date()).toISOString().split("T")[0],
				"Responsible": "",
				"App": "",
				"DefectType": "X",
				"Status": "Pending"
			});
			this.getView().getModel("AddDefectsModel").setProperty("/data", data);
			this.getView().getModel("AddDefectsModel").refresh(true);
		},
		onPressDeleteDefectRow: function (oEvent) {
			var index = oEvent.getSource().getBindingContext("AddDefectsModel").getPath().split("/")[2];
			var data = this.getView().getModel("AddDefectsModel").getProperty("/data");
			data.splice(index, 1);
			this.getView().getModel("AddDefectsModel").setProperty("/data", data);
			this.getView().getModel("AddDefectsModel").refresh(true);
		},
		onPressAddDefectSave: function () {
			var that = this;
			var data = this.getView().getModel("AddDefectsModel").getProperty("/data");
			var postData = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].Desc.trim() !== "") {
					postData.push({
						"fields": {
							"Defect": data[i].Defect,
							"DevGroup": data[i].DevGroup,
							"Desc": data[i].Desc,
							"RaisedDate": data[i].RaisedDate,
							"Developer": data[i].Responsible,
							"App": data[i].App,
							"DefectType": data[i].DefectType,
							"Status": "Pending"
						}
					});
				}
			}
			$.ajax({
				url: this.url + that.base + "/Issue",
				type: 'POST',
				//contentType: "application/json; charset=UTF-8",
				data: JSON.stringify({
					"records": postData
				}),
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + that.key);
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				success: function (data1) {
					MessageToast.show("Defects created successfully.");
				},
				error: function (result) {
					MessageToast.show(result.responseJSON.error.type + ": " + result.responseJSON.error.message);
				}
			});
		},
		onDefectListUpdateFinished: function (oEvent) {
			return;
			var _oList = oEvent.getSource();
			if (_oList.getItems().length > 0) {
				_oList.setSelectedItem(_oList.getItems()[0]);
				_oList.fireSelectionChange();
			}
		},
		onDefectListRefresh: function () {
			this.loadDefects(false);
		},
		onDefectFilterTogglePress: function (oEvent) {
			var _bPressed = oEvent.getSource().getPressed();
			var _oList = this.byId(sap.ui.core.Fragment.createId("idMasterDefectFrag", "idListDefectMaster"));
			//	var oFilter = new sap.ui.model.Filter(oEvent.getSource().data("field"), "EQ", oEvent.getSource().getText());
			if (_bPressed) {
				this.DefectFilter.push(oEvent.getSource().getText());
			} else {
				var index = this.DefectFilter.indexOf(oEvent.getSource().getText());
				this.DefectFilter.splice(index, 1);
			}
			var oFinalFilter = [];
			for (var i = 0; i < this.DefectFilter.length; i++) {
				var oFilter = new sap.ui.model.Filter(oEvent.getSource().data("field"), "EQ", this.DefectFilter[i]);
				oFinalFilter.push(oFilter);
			}
			_oList.getBinding("items").filter(new sap.ui.model.Filter(oFinalFilter, false));
		},
		onPressMoreTR: function () {
			if (!this.oTRFragment) {
				this.oTRFragment = sap.ui.xmlfragment("com.ticketDashboard.view.fragments.dialogFragments.TRDialog", this);
				this.getView().addDependent(this.oTRFragment);
			}
			var oModel = new JSONModel();
			oModel.setData({
				data: {
					"TR": "",
					"Type": "",
					"Desc": "",
					"ContentType": "X",
					"Content": ""
				}
			});
			this.getView().setModel(oModel, "TRPostModel");
			this.oTRFragment.open();
		},
		onPressCloseTRFrag: function () {
			this.oTRFragment.close();
		},
		onPressSaveTR: function () {
			var that = this;
			var data = this.getView().getModel("TRPostModel").getProperty("/data");
			var postData = [{
				"fields": {
					"TR": data.TR,
					"Type": data.Type,
					"Desc": data.Desc,
					"ContentType": data.ContentType,
					"Content": data.Content,
					"Status": "P4D"
				}
			}];
			$.ajax({
				url: this.url + that.base + "/TR",
				type: 'POST',
				//contentType: "application/json; charset=UTF-8",
				data: JSON.stringify({
					"records": postData
				}),
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + that.key);
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				success: function (data1) {
					MessageToast.show("TR saved successfully.");
					var oModel = new JSONModel();
					oModel.setData({
						data: {
							"TR": "",
							"Type": "",
							"Desc": "",
							"ContentType": "X",
							"Content": ""
						}
					});
					that.getView().setModel(oModel, "TRPostModel");
					that.loadTR();
				},
				error: function (result) {
					MessageToast.show(result.responseJSON.error.type + ": " + result.responseJSON.error.message);
				}
			});
		},
		onPressBack: function () {
			this.byId("navCon").to(this.byId("Dashboard"));
		}
	});
});