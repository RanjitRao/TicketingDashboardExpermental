/*global com*/
$.sap.declare("com.ticketDashboard.util.Formatter");

com.ticketDashboard.util.Formatter = {
	setDefectStatus: function (val) {
		if (val === "Complete") {
			return "Success";
		} else if (val === "Pending") {
			return "Error";
		} else if (val === "Out Of Scope" || val === "Testing") {
			return "Warning";
		} else {
			return "None";
		}
	},
	convertDateFormat: function (val) {
		if (val !== "" && val) {
			return val.split('-').reverse().join('-');
		} else {
			return "";
		}
	},
	getFormattedDateTime: function (val1, val2, val3) {
		if (val1 !== null && val2 !== null) {
			var _date = new Date(val1.getTime() + val2.ms);

			var _returnDate = _date.toUTCString().split(" ");;
			if (val3 === "d") {
				return _returnDate[1] + " " + _returnDate[2] + ", " + _returnDate[3]
			} else if (val3 === "t") {
				return _returnDate[4]
			} else {
				return _date.toUTCString();
			}
		}
		return "";
	},
	getStatusColor: function (val) {
		if (val === "INPR") {
			return "Warning";
		} else if (val === "CLOSED") {
			return "Success";
		} else if (val === "OPEN") {
			return "Error";
		} else {
			return "None"
		}

	},
	getLinkStatus: function (val1, val2) {
		var bVisible = false;
		if (val1 === "IDOC" || val1 === "PR_PO") {
			bVisible = true;
		}
		if (val2 = "Link") {
			return bVisible;
		}
		else {
			return !bVisible;
		}
	}
};