sap.ui.define([], function () {
	"use strict";

	return {

		statusText: function (sIsDone) {
			return (sIsDone == "Yes") ? "Done" : "Outstanding";
		},

		statusState: function (sIsDone) {
			return (sIsDone == "Yes") ? "Success" : "Error";
		},

		formattedDate: function(sDate)  {
			return sDate;
		}
	};
});