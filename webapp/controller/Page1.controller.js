sap.ui.define(["com/ticketDashboard/controller/BaseController",
	"sap/m/MessageToast",
	"./utilities",
	"sap/ui/core/routing/History",
	'sap/ui/model/json/JSONModel',
	'com/ticketDashboard/util/Formatter',
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
], function (BaseController, MessageToast, Utilities, History, JSONModel, Formatter, exportLibrary, Spreadsheet) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return BaseController.extend("com.ticketDashboard.controller.Page1", {
		onInit: function () {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.onRouteMatched, this);
			if (!this.oBusyFragment) {
				this.oBusyFragment = sap.ui.xmlfragment("busyFrag", "com.ticketDashboard.view.fragments.dialogFragments.BusyDialog", this);
				this.getView().addDependent(this.oBusyFragment);
			}
			this.getOwnerComponent().getModel("applicationModel").setProperty("/BusyDialog", this.oBusyFragment);
			this.busyDialog(true, "busyText");
			this.listFilterArr = [];
			var filterModel = new JSONModel();
			filterModel.setData({
				"MainProcess": "",
				"Priority": "",
				"SubProcess": "",
				"Status": "",
				"Date1": null,
				"Date2": null,
				"DateEnabled": false,
				"ListCount": "0"
			});

			this.getView().setModel(filterModel, "FilterModel");
			this.initializeFilters();
			this.oModel = this.getOwnerComponent().getModel();
			this.byId(sap.ui.core.Fragment.createId("idFilterFrag", "idSegBtnDate")).setSelectedKey("T");
			this.byId(sap.ui.core.Fragment.createId("idFilterFrag", "idSegBtnDate")).fireSelectionChange();
			this.prepareChartPopups();
			this.getMainProcessData();
			this.onPressGo();
		},
		onRouteMatched: function (oEvent) {
			var oNameParameter = oEvent.getParameter("name");
			if (oNameParameter === "Page1") {
				//
			}
		},
		onAfterRendering: function () {
			// var that = this;
			// var oChartContainer = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "idChartContainer_Table"));
			// oChartContainer._oFullScreenButton.addEventDelegate({
			// 	"onclick": function (param) {
			// 		if (oChartContainer._oFullScreenButton.getProperty("icon") === "sap-icon://full-screen") {
			// 			that.getView().getModel("applicationModel").setProperty("/TableVisibleRowCount", 18);
			// 		} else {
			// 			that.getView().getModel("applicationModel").setProperty("/TableVisibleRowCount", 4);
			// 		}
			// 	}
			// });
		},
		onDateSBChange: function (oEvent) {
			var selKey = oEvent.getSource().getSelectedKey();
			var filterModel = this.getView().getModel("FilterModel");
			var _date = new Date();
			//	var _tempDate = new Date();
			//	_tempDate.setDate(_date.getDate() - 200);
			filterModel.setProperty("/DateEnabled", false);
			switch (selKey) {
				case 'T':
					filterModel.setProperty("/Date1", _date);
					filterModel.setProperty("/Date2", _date);
					break;
				case 'Y':
					_date.setDate(_date.getDate() - 1);
					filterModel.setProperty("/Date1", _date);
					filterModel.setProperty("/Date2", _date);
					break;
				case 'CW':
					var first = _date.getDate() - _date.getDay(); // First day is the day of the month - the day of the week
					var last = first + 6; // last day is the first day + 6
					var firstday = new Date(_date.setDate(first));
					var lastday = new Date(_date.setDate(last));
					filterModel.setProperty("/Date1", firstday);
					filterModel.setProperty("/Date2", lastday);
					break;
				case 'CM':
					var firstday = new Date(_date.getFullYear(), _date.getMonth(), 1);
					var lastday = new Date(_date.getFullYear(), _date.getMonth() + 1, 0);
					filterModel.setProperty("/Date1", firstday);
					filterModel.setProperty("/Date2", lastday);
					break;
				default:
					filterModel.setProperty("/DateEnabled", true);
				// code block
			}
		},
		getMainProcessData: function () {
			var that = this;
			var fnSuccess = function (data) {
				var oTempModel = new JSONModel();
				oTempModel.setData(data);
				that.getView().setModel(oTempModel, "MainProcessModel");
				//	that.busyDialog(false);
				that.getSubProcessData();
			};
			var fnError = function (err) {
				MessageToast.show("error");
				//that.busyDialog(false);
			};
			this.oModel.read("/MainProcSet", null, null, null, fnSuccess, fnError);
		},
		getSubProcessData: function () {
			var that = this;
			var fnSuccess = function (data) {
				var oTempModel = new JSONModel();
				oTempModel.setData(data);
				that.getView().setModel(oTempModel, "SubProcessModel");
				that.getPriorityData();
			};
			var fnError = function (err) {
				MessageToast.show("error");
				//that.busyDialog(false);
			};
			this.oModel.read("/SubProcSet", null, null, null, fnSuccess, fnError);
		},
		getPriorityData: function () {
			var that = this;
			var fnSuccess = function (data) {
				var oTempModel = new JSONModel();
				oTempModel.setData(data);
				that.getView().setModel(oTempModel, "PriorityModel");
				that.getStatusData();
			};
			var fnError = function (err) {
				MessageToast.show("error");
				//that.busyDialog(false);
			};
			this.oModel.read("/AlertPrioritySet", null, null, null, fnSuccess, fnError);
		},
		getStatusData: function () {
			var that = this;
			var fnSuccess = function (data) {
				var oTempModel = new JSONModel();
				oTempModel.setData(data);
				that.getView().setModel(oTempModel, "StatusModel");

				that.busyDialog(false);
			};
			var fnError = function (err) {
				MessageToast.show("error");
				that.busyDialog(false);
			};
			this.oModel.read("/AlertStatusSet", null, null, null, fnSuccess, fnError);
		},
		onPressGo: function () {
			this.busyDialog(true, "busyText");
			this.oFinalFilter = [];
			this.listFilterArr = [];
			var _filterString = this.getFilterString();
			this.getStatisticalData(_filterString);
			var oTable = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "LineItemsSmartTable"));
			oTable.rebindTable();
		},
		getFilterString: function () {
			var controlData = [{
				"control": "idMCBMainProcess",
				"filterField": "MainProcess"
			}, {
				"control": "idMCBSubProcess",
				"filterField": "SubProcess"
			}, {
				"control": "idMCBStatus",
				"filterField": "Status"
			}, {
				"control": "idMCBMainPriority",
				"filterField": "Priority"
			}]
			var _filterArr = [];
			for (var i = 0; i < controlData.length; i++) {
				var controlId = controlData[i].control;
				var filterField = controlData[i].filterField;
				var _filterString = this.byId(sap.ui.core.Fragment.createId("idFilterFrag", controlId)).getSelectedKeys().join("' or " + filterField + " eq '") + "'";
				if (_filterString === "'") {
					continue;
				} else {
					_filterString = "(" + filterField + " eq '" + _filterString + ")";
				}
				_filterArr.push(_filterString)
			}
			if (_filterArr.length > 0) {
				_filterString = _filterArr.join(" and ") + " and ";
			} else {
				_filterString = "";
			}
			var startDate = this.getISODateTimeFormat(this.getView().getModel("FilterModel").getProperty("/Date1"));
			var endDate = this.getISODateTimeFormat(this.getView().getModel("FilterModel").getProperty("/Date2"));
			_filterString = "?$filter=" + _filterString + "(CreatedOn ge datetime'" + startDate + "' and CreatedOn le datetime'" + endDate + "')";
			return _filterString
		},
		getSmartFilterObject: function () {
			var controlData = [{
				"control": "idMCBMainProcess",
				"filterField": "MainProcess"
			}, {
				"control": "idMCBSubProcess",
				"filterField": "SubProcess"
			}, {
				"control": "idMCBStatus",
				"filterField": "Status"
			}, {
				"control": "idMCBMainPriority",
				"filterField": "Priority"
			}]
			var _finalFilterArr = [];
			var _jointFilter = [];
			for (var i = 0; i < controlData.length; i++) {
				var _filterArr = [];
				_jointFilter = [];
				var controlId = controlData[i].control;
				var filterField = controlData[i].filterField;
				var _filterKeys = this.byId(sap.ui.core.Fragment.createId("idFilterFrag", controlId)).getSelectedKeys();
				var _filterFieldKeysArr = [];
				for (var j = 0; j < this.listFilterArr.length; j++) {
					if (this.listFilterArr[j].sPath === filterField) {
						_filterFieldKeysArr.push(this.listFilterArr[j].oValue1);
					}
				}
				if (_filterFieldKeysArr.length !== 0) {
					_filterKeys = _filterFieldKeysArr;
				}
				if (_filterKeys.length > 0) {

					for (var j = 0; j < _filterKeys.length; j++) {
						_filterArr.push(new sap.ui.model.Filter(filterField, "EQ", _filterKeys[j]));
					}
					_finalFilterArr.push(new sap.ui.model.Filter(_filterArr, false));
				}
			}
			var _groupFilter = [];
			for (var j = 0; j < this.listFilterArr.length; j++) {
				if (this.listFilterArr[j].sPath === undefined) {
					_groupFilter.push(new sap.ui.model.Filter(this.listFilterArr[j].aFilters, true));
				}
			}
			if (_groupFilter.length > 0) {
				_finalFilterArr.push(new sap.ui.model.Filter(_groupFilter, false));
			}
			var startDate = this.getISODateTimeFormat(this.getView().getModel("FilterModel").getProperty("/Date1"));
			var endDate = this.getISODateTimeFormat(this.getView().getModel("FilterModel").getProperty("/Date2"));
			var startDateFilter = new sap.ui.model.Filter("CreatedOn", "GE", startDate);
			var endDateFilter = new sap.ui.model.Filter("CreatedOn", "LE", endDate);
			var dateFilter = new sap.ui.model.Filter([startDateFilter, endDateFilter], true);
			_finalFilterArr.push(dateFilter);
			return _finalFilterArr;
		},
		_getSmartFilterObject: function () {
			var controlData = [{
				"control": "idMCBMainProcess",
				"filterField": "MainProcess"
			}, {
				"control": "idMCBSubProcess",
				"filterField": "SubProcess"
			}, {
				"control": "idMCBStatus",
				"filterField": "Status"
			}, {
				"control": "idMCBMainPriority",
				"filterField": "Priority"
			}]
			var _finalFilterArr = [];
			var _jointFilter = [];
			for (var i = 0; i < controlData.length; i++) {
				var _filterArr = [];
				_jointFilter = [];
				var controlId = controlData[i].control;
				var filterField = controlData[i].filterField;
				var _filterKeys = this.byId(sap.ui.core.Fragment.createId("idFilterFrag", controlId)).getSelectedKeys();
				for (var j = 0; j < this.listFilterArr.length; j++) {
					if (this.listFilterArr[j].sPath === filterField) {
						if (_filterKeys.indexOf(this.listFilterArr[j].oValue1) === -1) {
							_filterKeys.push(this.listFilterArr[j].oValue1);
						}
					} else if (this.listFilterArr[j].sPath === undefined) {
						_jointFilter.push(this.listFilterArr[j]);
					}
				}
				if (_filterKeys.length > 0) {
					for (var j = 0; j < _filterKeys.length; j++) {
						_filterArr.push(new sap.ui.model.Filter(filterField, "EQ", _filterKeys[j]));
					}
					_finalFilterArr.push(new sap.ui.model.Filter(_filterArr, false));
				}
			}
			Array.prototype.push(_finalFilterArr, _jointFilter);
			var startDate = this.getISODateTimeFormat(this.getView().getModel("FilterModel").getProperty("/Date1"));
			var endDate = this.getISODateTimeFormat(this.getView().getModel("FilterModel").getProperty("/Date2"));
			var startDateFilter = new sap.ui.model.Filter("CreatedOn", "GE", startDate);
			var endDateFilter = new sap.ui.model.Filter("CreatedOn", "LE", endDate);
			var dateFilter = new sap.ui.model.Filter([startDateFilter, endDateFilter], true);
			_finalFilterArr.push(dateFilter);
			return _finalFilterArr;
		},
		getISODateTimeFormat: function (val) {
			//var yourDate = new Date();
			const offset = val.getTimezoneOffset()
			val = new Date(val.getTime() - (offset * 60 * 1000))
			return val.toISOString().split('T')[0] + "T00:00:00";
		},
		getStatisticalData: function (_filterString) {
			var _filterString = this.getFilterString();
			var that = this;
			var fnSuccess = function (data) {
				var oTempModel = new JSONModel();
				oTempModel.setData(data);
				that.getView().setModel(oTempModel, "StatDataModel");
				that.prepareProcPrioCountData(data.results[0].ProcPrioCount.results);
				that.busyDialog(false);
			};
			var fnError = function (err) {
				var oTempModel = new JSONModel();
				oTempModel.setData({});
				that.getView().setModel(oTempModel, "StatDataModel");
				MessageToast.show("error");
				that.busyDialog(false);
			};
			this.oModel.read("/StatisticsSet" + _filterString + "&$expand=PriorityPercent,StatusCount,ProcPrioCount", null, null, null, fnSuccess, fnError);
		},
		prepareProcPrioCountData: function (data) {
			var mainProcessArr = [];
			var finalData = [];
			var _pushIndex = 0;
			for (var i = 0; i < data.length; i++) {
				var _index = mainProcessArr.indexOf(data[i].MainProcess);
				if (_index === -1) {
					finalData.push({
						"MainProcess": data[i].MainProcess,
						"ProcessDescription": data[i].ProcessDescription,
						"High": {
							"Id": "",
							"Count": 0,
							"Desc": ""
						},
						"Low": {
							"Id": "",
							"Count": 0,
							"Desc": ""
						},
						"Medium": {
							"Id": "",
							"Count": 0,
							"Desc": ""
						}
					});
					mainProcessArr.push(data[i].MainProcess);
					_pushIndex = finalData.length - 1;
				} else {
					_pushIndex = _index;
				}
				var _oEntry = {
					"Id": data[i].Priority,
					"Count": data[i].Count,
					"Desc": data[i].PriorityDescription
				};
				if (data[i].Priority === "HG") {
					finalData[_pushIndex].High = _oEntry;
				} else if (data[i].Priority === "LO") {
					finalData[_pushIndex].Low = _oEntry;
				} else {
					finalData[_pushIndex].Medium = _oEntry;
				}
			}
			this.getView().getModel("StatDataModel").setProperty("/results/0/ProcPrioCount/results", finalData);
		},
		showIncidentDetails: function (oEvent) {
			MessageToast.show("Will be navigating to the Incident Detail by cross navigation.");
			// if (!this.oDetailFragment) {
			// 	this.oDetailFragment = sap.ui.xmlfragment("com.ticketDashboard.view.fragments.dialogFragments.IncidentDetails", this);
			// 	this.getView().addDependent(this.oDetailFragment);
			// }
			// var bindingContext = oEvent.getSource().getBindingContext("AlertDataModel");
			// //this.oDetailFragment.setBindingContext(new sap.ui.model.Context(this.getView().getModel("AlertDataModel"), bindingContextPath));
			// this.oDetailFragment.setBindingContext(bindingContext, "AlertDataModel");
			// this.oDetailFragment.open();
		},

		onDetailsClose: function () {
			this.oDetailFragment.close();
		},
		onDonutDataSelect: function (oEvent) {
			this.byId(sap.ui.core.Fragment.createId("idLineFrag", "idChartStkCol")).vizSelection([], { "clearSelection": true });
			var _index = "";
			if (this.listFilterArr.length > 0) {
				for (var i = 0; i < this.listFilterArr.length; i++) {
					if (this.listFilterArr[i].sPath === undefined || this.listFilterArr[i].sPath === "Priority") {
						this.listFilterArr.splice(i, 1);
						i--;
					}
				}
			}
			var StatDataModel = this.getView().getModel("StatDataModel");
			for (var i = 0; i < oEvent.getSource().vizSelection().length; i++) {
				_index = (oEvent.getSource().vizSelection()[i].data._context_row_number);
				var oFilter = new sap.ui.model.Filter("Priority", "EQ", StatDataModel.getProperty("/results/0/PriorityPercent/results/" + _index + "/PriorityID"));
				this.listFilterArr.push(oFilter);
			}
			var oTable = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "LineItemsSmartTable"));
			oTable.rebindTable();
			//	this.filterIncidentList(this.listFilterArr);
		},
		onStkColDataSelect: function (oEvent) {
			this.byId(sap.ui.core.Fragment.createId("idDonutFrag", "idChartDonut")).vizSelection([], { "clearSelection": true });
			var _index = "";
			if (this.listFilterArr.length > 0) {
				for (var i = 0; i < this.listFilterArr.length; i++) {
					if (this.listFilterArr[i].sPath === undefined || this.listFilterArr[i].sPath === "Priority") {
						this.listFilterArr.splice(i, 1);
						i--;
					}
				}
			}
			var StatDataModel = this.getView().getModel("StatDataModel");
			for (var i = 0; i < oEvent.getSource().vizSelection().length; i++) {
				var _item = oEvent.getSource().vizSelection()[i].data;
				var _statusType = (_item["High"] !== undefined ? "High" : (_item["Medium"] !== undefined ? "Medium" : "Low"))
				_index = (_item._context_row_number);
				var oFilterPriority = new sap.ui.model.Filter("Priority", "EQ", StatDataModel.getProperty("/results/0/ProcPrioCount/results/" + _index + "/" + _statusType + "/Id"));
				//this.listFilterArr.push(oFilterPriority);
				var oFilterMainProcess = new sap.ui.model.Filter("MainProcess", "EQ", StatDataModel.getProperty("/results/0/ProcPrioCount/results/" + _index + "/MainProcess"));
				var oFilter = new sap.ui.model.Filter([oFilterPriority, oFilterMainProcess], true);
				this.listFilterArr.push(oFilter);
			}
			var oTable = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "LineItemsSmartTable"));
			oTable.rebindTable();
			//	this.filterIncidentList(this.listFilterArr);
		},
		filterIncidentList: function (oFilter) {
			var _filterPath = [];
			var oGroupFilter = [];
			var oFinalFilter = [];
			var oDoubleFilter = [];
			for (var i = 0; i < oFilter.length; i++) {
				if (oFilter[i].oValue1 !== undefined) {
					var _index = _filterPath.indexOf(oFilter[i].sPath);
					if (_index > -1) {
						oGroupFilter[_index].push(oFilter[i]);
					} else {
						oGroupFilter.push([oFilter[i]]);
						_filterPath.push(oFilter[i].sPath);
					}
				} else {
					oDoubleFilter.push(oFilter[i]);
				}
			}
			if (oDoubleFilter.length > 0) {
				oGroupFilter.push(oDoubleFilter);
			}
			for (var i = 0; i < oGroupFilter.length; i++) {
				var _orFilter = [];
				for (var j = 0; j < oGroupFilter[i].length; j++) {
					_orFilter.push(oGroupFilter[i][j])
				}
				oFinalFilter.push(new sap.ui.model.Filter(_orFilter, false));
			}
			this.oFinalFilter = (oFinalFilter.length === 0 ? null : new sap.ui.model.Filter(oFinalFilter, true));
			var oTable = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "LineItemsSmartTable"));
			oTable.rebindTable();
		},
		onBeforeRebindTable: function (oEvent) {
			var binding = oEvent.getParameter("bindingParams");
			var oFilter = this.getSmartFilterObject();
			binding.filters.push((new sap.ui.model.Filter(oFilter, true)));
		},
		onListUpdated: function (oEvent) {
			this.getView().getModel("FilterModel").setProperty("/ListCount", oEvent.getSource().getRows().length);
		},
		onIncidentsBannerPress: function (oEvent) {
			var filterArr = [];
			var _status = oEvent.getSource().data("status");
			var _bFilter = oEvent.getSource().getContent()[0].getItems()[0].getItems()[0].getVisible();
			if (_status === "Total") {
				this.initializeBannerFilters();
			} else {
				if (!_bFilter) {
					var oFilter = new sap.ui.model.Filter("Status", "EQ", _status);
					this.listFilterArr.push(oFilter);

				} else {
					for (var i = 0; i < this.listFilterArr.length; i++) {
						if (this.listFilterArr[i].oValue1 === _status) {
							this.listFilterArr.splice(i, 1);
							break;
						}
					}
				}
				oEvent.getSource().getContent()[0].getItems()[0].getItems()[0].setVisible(!_bFilter);
			}
			var oTable = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "LineItemsSmartTable"));
			oTable.rebindTable();
			//this.filterIncidentList(this.listFilterArr);
		},
		navToAlertMapping: function (oEvent) {
			var errorCategory = oEvent.getSource().data("ErrorCategory");
			var _action = "";
			if (errorCategory === "PR_PO") {
				_action = "PRPOAlertDisplay";
			} else if (errorCategory === "IDOC") {
				_action = "IDocAlertDisplay";
			}
			var params = {
				"AlertID": oEvent.getSource().getText()
			}
			this.crossAppNavigate("zmonitoringdashboard", _action, params, true);
		},
		onBeforeExport: function (oEvt) {
			var mExcelSettings = oEvt.getParameter("exportSettings");
			if (mExcelSettings.url) {
				return;
			}
			mExcelSettings.worker = false;
		},
		onFullScreenPress: function () {
			if (!this.getOwnerComponent().getModel("applicationModel").getProperty("/FullScreenTableOpen")) {
				if (!this.oTableFSFragment) {
					this.oTableFSFragment = sap.ui.xmlfragment("com.ticketDashboard.view.fragments.dialogFragments.TableFullScreen", this);
					this.getView().addDependent(this.oTableFSFragment);
				}
				this.oTableFSFragment.open();
				this.getOwnerComponent().getModel("applicationModel").setProperty("/FullScreenTableOpen", true);
			} else {
				this.oTableFSFragment.close();
				this.getOwnerComponent().getModel("applicationModel").setProperty("/FullScreenTableOpen", false);
			}
		},
		onExport: function () {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId(sap.ui.core.Fragment.createId("idTableFrag", "idTableIncidents"));
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('items');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: 'IncidentList.xlsx',
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},
		createColumnConfig: function () {
			var aCols = [];
			var colArr = this.getOwnerComponent().getModel("TableColModel").getProperty("/Columns");
			for (var i = 0; i < colArr.length; i++) {
				if (colArr[i].Visible) {
					aCols.push({
						label: colArr[i].Label,
						property: colArr[i].Property,
						type: EdmType.String,
					});
				}
			}

			return aCols;
		},
		onListUpdateFinished: function (oEvent) {
			this.getOwnerComponent().getModel("applicationModel").setProperty("/IncidentListCount", oEvent.getSource().getItems().length);
			if (oEvent.getSource().getItems().length === 0) {
				this.getOwnerComponent().getModel("applicationModel").setProperty("/ExcelButtonEnabled", false);
				this.getOwnerComponent().getModel("applicationModel").setProperty("/FullScreenButtonEnabled", false);
			} else {
				this.getOwnerComponent().getModel("applicationModel").setProperty("/ExcelButtonEnabled", true);
				this.getOwnerComponent().getModel("applicationModel").setProperty("/FullScreenButtonEnabled", true);
			}
		},
		onSettingsPress: function () {
			if (!this.oColumnConfigFSFragment) {
				this.oColumnConfigFSFragment = sap.ui.xmlfragment("com.ticketDashboard.view.fragments.dialogFragments.ColumnConfig", this);
				this.getView().addDependent(this.oColumnConfigFSFragment);
			}
			this.oColumnConfigFSFragment.open();
		},
		onColConfigClose: function () {
			this.oColumnConfigFSFragment.close();
		}
	});
});