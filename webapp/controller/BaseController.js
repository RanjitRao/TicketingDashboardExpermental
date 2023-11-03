sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/UIComponent',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'sap/viz/ui5/controls/VizTooltip'
], function (Controller, UIComponent,  ChartFormatter, Format, VizTooltip) {
	"use strict";

	return Controller.extend("com.ticketDashboard.controller.BaseController", {
		closeDialog: function (oDialog) {
			oDialog.close();
		},
		goToView: function (that, oView) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo(oView);
		},
		translate: function (val1, val2) {
			var _bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			if (val2) {
				return _bundle.getText(val1, val2);
			} else {
				return _bundle.getText(val1);
			}
		},
		busyDialog: function (bVal, busyText) {
			var busyDialog = this.getOwnerComponent().getModel("applicationModel").getProperty("/BusyDialog");
			if (bVal) {
				this.getOwnerComponent().getModel("applicationModel").setProperty("/BusyText", this.translate(busyText));
				busyDialog.setBusyIndicatorDelay(0);
				busyDialog.open();
			} else {
				busyDialog.close();
			}
		},
		initializeFilters: function () {
			this.initializeBannerFilters();
			this.listFilterArr = [];
		},
		initializeBannerFilters: function () {
			this.getOwnerComponent().getModel("applicationModel").setProperty("/bOpenFilter", false);
			this.getOwnerComponent().getModel("applicationModel").setProperty("/bClosedFilter", false);
			this.getOwnerComponent().getModel("applicationModel").setProperty("/bInProgressFilter", false);
			for (var i = 0; i < this.listFilterArr.length; i++) {
				if (this.listFilterArr[i].sPath === "Status") {
					this.listFilterArr.splice(i, 1);
					i--;
				}
			}
		},
		crossAppNavigate: function (semObj, action, params, bNewTab) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: semObj,
					action: action
				},
				params: params
			})) || "";
			if (bNewTab) {
				sap.m.URLHelper.redirect(window.location.href.split('#')[0] + hash, true);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});
			}
		},
		prepareChartPopups: function () {
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;
			var oStkColVizFrame = this.byId(sap.ui.core.Fragment.createId("idLineFrag", "idChartStkCol"));
			var oDonutVizFrame = this.byId(sap.ui.core.Fragment.createId("idDonutFrag", "idChartDonut"));
			var oDonut2VizFrame = this.byId(sap.ui.core.Fragment.createId("idDonut2Frag", "idChartDonut2"));
			//var oStkColPopOver = this.byId(sap.ui.core.Fragment.createId("idLineFrag", "idStkColPopOver"));
			// oStkColPopOver.connect(oStkColVizFrame.getVizUid());
			// oStkColPopOver.setFormatString(formatPattern.STANDARDFLOAT);
			var oStkColTooltip = new VizTooltip({});
			oStkColTooltip.connect(oStkColVizFrame.getVizUid());
			oStkColTooltip.setFormatString(formatPattern.STANDARDFLOAT);
			//var oDonutVizFrame = this.byId(sap.ui.core.Fragment.createId("idDonutFrag", "idChartDonut"));
			var oDonutTooltip = new VizTooltip({});
			oDonutTooltip.connect(oDonutVizFrame.getVizUid());
			oDonutTooltip.setFormatString(formatPattern.STANDARDFLOAT);
			var oDonut2Tooltip = new VizTooltip({});
			oDonut2Tooltip.connect(oDonut2VizFrame.getVizUid());
			oDonut2Tooltip.setFormatString(formatPattern.STANDARDFLOAT);
		}

	});

});