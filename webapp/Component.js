sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device"
], function (UIComponent, Device) {
	"use strict";

	var navigationWithContext = {
		"ChangeControlSet": {
			"Page1": ""
		}
	};
	return UIComponent.extend("com.ticketDashboard.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			var oApplicationModel = new sap.ui.model.json.JSONModel({
				"mapConfig": null,
				"ChartContentHeight": "10rem",
				"SplitterHeight": "27.4rem",
				"TableVisibleRowCount": 4,
				"IncidentListCount": "0",
				"BusyText": "",
				"BusyDialog": null,
				"bTotalFilter": false,
				"bOpenFilter": false,
				"bClosedFilter": false,
				"bInProgressFilter": false,
				"ExcelButtonEnabled": true,
				"FullScreenButtonEnabled": true,
				"FullScreenTableOpen": false,
				"Date": "d",
				"Time": "t",
				"Link": "Link",
				"Text": "Text",
				"initiallyVisibleFields": "ServiceTicket,AlertID,ErrorSubject,CreatedOn,CreatedAt,Status",
				"requestAtLeastFields": "ServiceTicket,AlertID,ErrorSubject,CreatedOn,CreatedAt,Status,PriorityDesc"
			});

			this.setModel(oApplicationModel, "applicationModel");
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

		createContent: function () {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}
			return app;
		},

		getNavigationPropertyForNavigationWithContext: function (sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}

	});

});