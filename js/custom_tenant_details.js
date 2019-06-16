//define table to work with jquery datatables
var table = $('#bledger').DataTable({
	"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
	"iDisplayLength": -1,
	"paging": false,
	"ordering": false,
	"columnDefs": [
	{
		targets: [0,1],
		width: "17%",
	},
	{
		targets: [2,3,4],
		width: "22%",
		render: $.fn.dataTable.render.number( '.', ',', 0, 'Rp. ',',-' )
	}]
});
var table1 = $('#sledger').DataTable({
	"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
	"iDisplayLength": -1,
	"paging": false,
	"ordering": false,
	"columnDefs": [
	{
		targets: [0,1],
		width: "17%",
	},
	{
		targets: [2,3,4],
		width: "22%",
		render: $.fn.dataTable.render.number( '.', ',', 0, 'Rp. ',',-' )
	}]
});
var bondList = [];
var ledgerList = [];
var bondWaitDue = 0;
var historyperiod = 1;

function removeOptions(selectbox) {
	
    //clear select options
    for(i=selectbox.options.length-1; i>=1; i--) {
        selectbox.remove(i);
    }
	
}

function get_fmoney(money) {
	
	var rev     = parseInt(money, 10).toString().split('').reverse().join('');
	var rev2    = '';
	for(var i = 0; i < rev.length; i++){
		rev2  += rev[i];
		if((i + 1) % 3 === 0 && i !== (rev.length - 1)){
			rev2 += '.';
		}
	}
	return ("Rp. "+rev2.split('').reverse().join('') + ',-')
	
}

function rem_fmoney(money) {
	
	return parseInt(money.substring(4,money.length-2).split(".").join(""))
	
}

function rem_moneydot(money) {
	
	return parseInt(money.split(".").join(""));
	
}

function get_moneydot(money) {
	
	if (isNaN(parseInt(money))) {
		var convertmoney = "";
	} else {
		money = rem_moneydot(money);
		var convertmoney = money.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
	}
	return convertmoney;
	
}

function reformatDate(inputDate) {
	
	months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	inputBroke=inputDate.split("/");
	inputDay=parseInt(inputBroke[1]);
	inputMonth=parseInt(inputBroke[0]);
	inputYear=inputBroke[2];
	outputDay=inputDay;
	outputMonth=months[inputMonth-1];
	outputYear=inputYear.split("")[2]+inputYear.split("")[3];
	return (outputDay+"-"+outputMonth+"-"+outputYear);
	
}

function reformatDate2(inputDate) {
	
	months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	months2=["01","02","03","04","05","06","07","08","09","10","11","12"];
	inputBroke=inputDate.split("-");
	inputDay=inputBroke[0];
	inputMonth=inputBroke[1];
	inputYear=inputBroke[2];
	if (parseInt(inputDay) < 10) {
		outputDay = "0"+inputDay;
	} else {
		outputDay = inputDay;
	}
	for (var i=0;i<months.length;i++) {
		if (inputMonth == months[i]) {
			outputMonth = months2[i];
			break
		}
	}
	outputYear = "20"+inputYear;
	return (outputMonth+"/"+outputDay+"/"+outputYear);
	
}

function date_diff_indays(d1, d2) {
	
	var diff = Date.parse(d2) - Date.parse(d1);
	return Math.floor(diff / 86400000);
	
}

function sortArrayByDate(oldArray) {
	
	var newArray = [];
	for (i=0;i<oldArray.length;i++) {
		if (newArray.length==0) {
			newObj = {
				"date":oldArray[i].date,
				"desc":oldArray[i].desc,
				"invoice":oldArray[i].invoice,
				"payment":oldArray[i].payment
			}
			newArray[0] = newObj;
		}
		else {
			for (j=newArray.length-1;j>=0;j--) {
				if (date_diff_indays(newArray[j].date,oldArray[i].date)>=0) {
					for (k=newArray.length-1;k>=j;k--) {
						newObj = {
						"date":newArray[k].date,
						"desc":newArray[k].desc,
						"invoice":newArray[k].invoice,
						"payment":newArray[k].payment
						}
						newArray[k+1] = newObj;
					}
					newObj2 = {
					  "date":oldArray[i].date,
					  "desc":oldArray[i].desc,
					  "invoice":oldArray[i].invoice,
					  "payment":oldArray[i].payment
					}
					newArray[j+1] = newObj2;
					break
				}
				else {
					if (j==0) {
						for (k=newArray.length-1;k>=j;k--) {
							newObj = {
							  "date":newArray[k].date,
							  "desc":newArray[k].desc,
							  "invoice":newArray[k].invoice,
							  "payment":newArray[k].payment
							}
							newArray[k+1] = newObj;
						}
						newObj2 = {
							"date":oldArray[i].date,
							"desc":oldArray[i].desc,
							"invoice":oldArray[i].invoice,
							"payment":oldArray[i].payment
						}
						newArray[j] = newObj2;
						break
					}
				}
			}
		}
	}
	return newArray;
	
}

function pembulatan(input) {
	
	return (Math.round((parseInt(input)/100)))*100;
	
}

function countTotalBondDue() {
	
	var totalBondDue = 0;
	for (i=0;i<table.rows().count();i++) {
		var bondDue = table.row(i).data()[2];
		if (bondDue != null) {
			totalBondDue = totalBondDue+bondDue;
		}
	}
	$("#bDueTot").html(get_fmoney(totalBondDue));
	
}

function countTotalBondReceived() {
	
	var totalBondReceived = 0;
	for (i=0;i<table.rows().count();i++) {
		var bondReceived = table.row(i).data()[3];
		if (bondReceived != null) {
			totalBondReceived = totalBondReceived+bondReceived;
		}
	}
	$("#bReceivedTot").html(get_fmoney(totalBondReceived));
	
}

function countBondBalance() {
	
	var balance = 0;
	for (i=0;i<table.rows().count();i++) {
		var bondDue = table.row(i).data()[2];
		if (bondDue != null) {
			balance = balance - bondDue;
		} else {
			var bondReceived = table.row(i).data()[3];
			balance = balance + bondReceived;
		}
		if (balance < 0) {
			table.cell(i,4).data("("+get_fmoney(Math.abs(balance))+")");
		} else {
			table.cell(i,4).data(get_fmoney(balance));
		}
	}
	
}

function countTotalBondBalance() {
	
	var totalBondDue = rem_fmoney($("#bDueTot").html());
	var totalBondReceived = rem_fmoney($("#bReceivedTot").html());
	var totalBondBalance = totalBondReceived - totalBondDue;
	if (totalBondBalance < 0) {
		$("#bBalanceTot").html("("+get_fmoney(Math.abs(totalBondBalance))+")");
	} else {
		$("#bBalanceTot").html(get_fmoney(totalBondBalance));
	}
	
}

function countTotalDue() {
	
	var totalDue = 0;
	for (i=0;i<table1.rows().count();i++) {
		var ledgerDue = table1.row(i).data()[2];
		if (ledgerDue != null) {
			totalDue = totalDue+ledgerDue;
		}
	}
	$("#lDueTot").html(get_fmoney(totalDue));
	
}

function countTotalReceived() {
	
	var totalReceived = 0;
	for (i=0;i<table1.rows().count();i++) {
		var ledgerReceived = table1.row(i).data()[3];
		if (ledgerReceived != null) {
			totalReceived = totalReceived+ledgerReceived;
		}
	}
	$("#lReceivedTot").html(get_fmoney(totalReceived));
	
}

function countBalance() {
	
	var balance = 0;
	for (i=0;i<table1.rows().count();i++) {
		var ledgerDue = table1.row(i).data()[2];
		if (ledgerDue != null) {
			balance = balance - ledgerDue;
		} else {
			var ledgerReceived = table1.row(i).data()[3];
			balance = balance + ledgerReceived;
		}
		if (balance < 0) {
			table1.cell(i,4).data("("+get_fmoney(Math.abs(balance))+")");
		} else {
			table1.cell(i,4).data(get_fmoney(balance));
		}
	}
	
}

function countTotalBalance() {
	
	var totalDue = rem_fmoney($("#lDueTot").html());
	var totalReceived = rem_fmoney($("#lReceivedTot").html());
	var totalBalance = totalReceived - totalDue;
	if (totalBalance < 0) {
		$("#lBalanceTot").html("("+get_fmoney(Math.abs(totalBalance))+")");
	} else {
		$("#lBalanceTot").html(get_fmoney(totalBalance));
	}
	
}

function addInvoice() {
	//collect data from invoice form
	var invoiceDate = reformatDate2($("#invoiceDate").val());
	var invoiceAmount = rem_moneydot($("#invoiceAmount").val());
	var invoiceDetails = $("#invoiceDetails").val();
	var invoiceDetailsOther = $("#invoiceDetailsOther").val();
	if (invoiceDetails == "rentdue") {
		var invoiceDetailsFull = "Rental Due";
	} else if (invoiceDetails == "finedue") {
		var invoiceDetailsFull = "Fine Due";
	} else if (invoiceDetails == "transfer") {
		var invoiceDetailsFull = "Bond Money Transfer";
	} else if (invoiceDetails == "refund") {
		var invoiceDetailsFull = "Bond Money Refund";
	} else {
		var invoiceDetailsFull = "Other Due - "+invoiceDetailsOther;
	}
	var invoiceRecurrent = $("#invoiceRecurrent").val(); 
	//standard invoice
	ledgerList.push({
		"date":invoiceDate,
		"desc":invoiceDetailsFull,
		"invoice":invoiceAmount,
		"payment":null
	});
	ledgerList = sortArrayByDate(ledgerList);
	table1.clear();
	for (x in ledgerList) {
		table1.row.add([reformatDate(ledgerList[x].date),ledgerList[x].desc,ledgerList[x].invoice,ledgerList[x].payment,null]);	
	}
	table1.draw();
	countTotalDue();
	countTotalReceived();
	countBalance();
	countTotalBalance();
	setTimeout(function(){
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
		//reset invoice form
		$('#addInvoiceForm').trigger("reset");
		$("#invoiceDetailsOtherBlock").hide();
		$("#invoiceRecurrentBlock").show();
		removeOptions(document.getElementById("invoiceDetails"));
		var optionElement1 = document.createElement("option");
		var optionElement2 = document.createElement("option");
		var optionElement3 = document.createElement("option");
		optionElement1.value = "rentdue";
		optionElement1.innerHTML = "Rental Due";
		optionElement2.value = "finedue";
		optionElement2.innerHTML = "Fine Due";
		optionElement3.value = "otherdue";
		optionElement3.innerHTML = "Other Due";
		document.getElementById("invoiceDetails").appendChild(optionElement1);
		document.getElementById("invoiceDetails").appendChild(optionElement2);
		document.getElementById("invoiceDetails").appendChild(optionElement3);
		//success notification
		$.gritter.add({
			title: 'Invoice Added',
			text: 'Invoice was successfully added to the database.',
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		})
	}, 1000);
	
}

function addPayment() {
	// ref number
	refNumberHtml = $("#tenant_id").html();
	refNumberHtml=refNumberHtml.split(" ");
	refNumberHtml=refNumberHtml[0]+refNumberHtml[1]+refNumberHtml[2];
	//init firebase
	paymentRef = firebase.database().ref().child("payment/"+id);
	//collect data from payment form
	var paymentDate = reformatDate2($("#paymentDate").val());
	var paymentAmount = rem_moneydot($("#paymentAmount").val());
	var paymentDetails = $("#paymentDetails").val();
	var paymentDetailsOther = $("#paymentDetailsOther").val();
	if (paymentDetails == "rentpay") {
		var paymentDetailsFull = "Rental Payment";
	} else if (paymentDetails == "finepay") {
		var paymentDetailsFull = "Fine Payment";
	} else if (paymentDetails == "bondpay") {
		var paymentDetailsFull = "Bond Money Payment";
	} else if (paymentDetails == "transfer") {
		var paymentDetailsFull = "Bond Money Transfer";
	} else if (paymentDetails == "refund") {
		var paymentDetailsFull = "Bond Money Refund";
	} else {
		var paymentDetailsFull = "Other Payment - "+paymentDetailsOther;
	}
	if (paymentDetails == "bondpay") { //bond money payment
		if (bondWaitDue-paymentAmount < 0) {
			if (bondWaitDue != 0) {
				var bondLeft = paymentAmount-bondWaitDue;
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Deposit",
					"invoice":null,
					"payment":bondWaitDue,
					"refnumber":refNumberHtml,
					"list":"bondList"
				});
				paymentRef.push({
					"date":paymentDate,
					"desc":paymentDetailsFull,
					"invoice":null,
					"payment":bondWaitDue,
					"refnumber":refNumberHtml,
					"list":"ledgerList"
				});
				if (bondLeft != 0) {
					paymentRef.push({
						"date":paymentDate,
						"desc":"Rental Payment",
						"invoice":null,
						"payment":bondLeft,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
				}
				bondWaitDue = 0;
			} else {
				paymentRef.push({
					"date":paymentDate,
					"desc":"Rental Payment",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"ledgerList"
				});
			}
		} else {
			bondWaitDue -= paymentAmount;
			paymentRef.push({
				"date":paymentDate,
				"desc":"Bond Money Deposit",
				"invoice":null,
				"payment":paymentAmount,
				"refnumber":refNumberHtml,
				"list":"bondList"
			});
			paymentRef.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":null,
				"payment":paymentAmount,
				"refnumber":refNumberHtml,
				"list":"ledgerList"
			});
		}
	} else if (paymentDetails == "transfer") { //bond money transfer
		if (bondWaitDue > 0) {
			if (bondWaitDue-paymentAmount < 0) {
				if (bondWaitDue != 0) {
					var bondLeft = paymentAmount-bondWaitDue;
					paymentRef.push({
						"date":paymentDate,
						"desc":"Bond Money Deposit",
						"invoice":null,
						"payment":bondWaitDue,
						"refnumber":refNumberHtml,
						"list":"bondList"
					});
					paymentRef.push({
						"date":paymentDate,
						"desc":"Bond Money Payment",
						"invoice":null,
						"payment":bondWaitDue,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
					if (bondLeft != 0) {
						paymentRef.push({
							"date":paymentDate,
							"desc":"Rental Payment",
							"invoice":null,
							"payment":bondLeft,
							"refnumber":refNumberHtml,
							"list":"ledgerList"
						});
					}
					bondWaitDue = 0;
				} else {
					paymentRef.push({
						"date":paymentDate,
						"desc":"Rental Payment",
						"invoice":null,
						"payment":paymentAmount,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
				}
			} else {
				bondWaitDue -= paymentAmount;
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Deposit",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"bondList"
				});
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Payment",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"ledgerList"
				});
			}
		} else {
			paymentRef.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":paymentAmount,
				"payment":null,
				"refnumber":refNumberHtml,
				"list":"bondList"
			});
			paymentRef.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":null,
				"payment":paymentAmount,
				"refnumber":refNumberHtml,
				"list":"ledgerList"
			});
		}
	} else if (paymentDetails == "refund") { //bond money refund
		if (bondWaitDue > 0) {
			if (bondWaitDue-paymentAmount < 0) {
				if (bondWaitDue != 0) {
					var bondLeft = paymentAmount-bondWaitDue;
					paymentRef.push({
						"date":paymentDate,
						"desc":"Bond Money Deposit",
						"invoice":null,
						"payment":bondWaitDue,
						"refnumber":refNumberHtml,
						"list":"bondList"
					});
					paymentRef.push({
						"date":paymentDate,
						"desc":"Bond Money Payment",
						"invoice":null,
						"payment":bondWaitDue,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
					if (bondLeft != 0) {
						paymentRef.push({
							"date":paymentDate,
							"desc":"Rental Payment",
							"invoice":null,
							"payment":bondLeft,
							"refnumber":refNumberHtml,
							"list":"ledgerList"
						});
					}
					bondWaitDue = 0;
				} else {
					paymentRef.push({
						"date":paymentDate,
						"desc":"Rental Payment",
						"invoice":null,
						"payment":paymentAmount,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
				}
			} else {
				bondWaitDue -= paymentAmount;
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Deposit",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"bondList"
				});
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Payment",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"ledgerList"
				});
			}
		} else {
		paymentRef.push({
			"date":paymentDate,
			"desc":paymentDetailsFull,
			"invoice":paymentAmount,
			"payment":null,
			"refnumber":refNumberHtml,
			"list":"bondList"
		});
			paymentRef.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":null,
				"payment":paymentAmount,
				"refnumber":refNumberHtml,
				"list":"ledgerList"
			});
			paymentRef.push({
				"date":paymentDate,
				"desc":"Bond Money Withdraw",
				"invoice":paymentAmount,
				"payment":null,
				"refnumber":refNumberHtml,
				"list":"ledgerList"
			});
		}
	} else { //other payment
		if (bondWaitDue > 0) {
			if (bondWaitDue-paymentAmount < 0) {
				if (bondWaitDue != 0) {
					var bondLeft = paymentAmount-bondWaitDue;
					paymentRef.push({
						"date":paymentDate,
						"desc":"Bond Money Deposit",
						"invoice":null,
						"payment":bondWaitDue,
						"refnumber":refNumberHtml,
						"list":"bondList"
					});
					paymentRef.push({
						"date":paymentDate,
						"desc":"Bond Money Payment",
						"invoice":null,
						"payment":bondWaitDue,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
					if (bondLeft != 0) {
						paymentRef.push({
							"date":paymentDate,
							"desc":"Rental Payment",
							"invoice":null,
							"payment":bondLeft,
							"refnumber":refNumberHtml,
							"list":"ledgerList"
						});
					}
					bondWaitDue = 0;
				} else {
					paymentRef.push({
						"date":paymentDate,
						"desc":"Rental Payment",
						"invoice":null,
						"payment":paymentAmount,
						"refnumber":refNumberHtml,
						"list":"ledgerList"
					});
				}
			} else {
				bondWaitDue -= paymentAmount;
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Deposit",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"bondList"
				});
				paymentRef.push({
					"date":paymentDate,
					"desc":"Bond Money Payment",
					"invoice":null,
					"payment":paymentAmount,
					"refnumber":refNumberHtml,
					"list":"ledgerList"
				});
			}
		} else {
			paymentRef.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":null,
				"payment":paymentAmount,
				"refnumber":refNumberHtml,
				"list":"ledgerList"
			});
		}
	}

	/* //bond money payment
	if ($("#paymentBond").prop("checked")) {
		//bond money ledger
		if (paymentDetails == "bondpay") { //payment
			bondList.push({
				"date":paymentDate,
				"desc":"Bond Money Deposit",
				"invoice":null,
				"payment":paymentAmount
			});
		} else { //transfer & refund
			bondList.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":paymentAmount,
				"payment":null
			});
		}
		bondList = sortArrayByDate(bondList);
		table.clear();
		for (x in bondList) {
			table.row.add([reformatDate(bondList[x].date),bondList[x].desc,bondList[x].invoice,bondList[x].payment,null]);	
		}
		table.draw();
		countTotalBondDue();
		countTotalBondReceived();
		countBondBalance();
		countTotalBondBalance();
		//standard ledger
		if (paymentDetails == "refund") { //refund
			ledgerList.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":null,
				"payment":paymentAmount
			});
			ledgerList.push({
				"date":paymentDate,
				"desc":"Bond Money Withdraw",
				"invoice":paymentAmount,
				"payment":null
			});
		} else { //transfer & payment
			ledgerList.push({
				"date":paymentDate,
				"desc":paymentDetailsFull,
				"invoice":null,
				"payment":paymentAmount
			});
		}
		ledgerList = sortArrayByDate(ledgerList);
		table1.clear();
		for (x in ledgerList) {
			table1.row.add([reformatDate(ledgerList[x].date),ledgerList[x].desc,ledgerList[x].invoice,ledgerList[x].payment,null]);	
		}
		table1.draw();
		countTotalDue();
		countTotalReceived();
		countBalance();
		countTotalBalance();
	//standard payment
	} else {
		if (paymentDetails == "bondpay") { //payment
			bondList.push({
				"date":paymentDate,
				"desc":"Bond Money Deposit",
				"invoice":null,
				"payment":paymentAmount
			});
			bondList = sortArrayByDate(bondList);
			table.clear();
			for (x in bondList) {
				table.row.add([reformatDate(bondList[x].date),bondList[x].desc,bondList[x].invoice,bondList[x].payment,null]);	
			}
			table.draw();
			countTotalBondDue();
			countTotalBondReceived();
			countBondBalance();
			countTotalBondBalance();
		}
		ledgerList.push({
			"date":paymentDate,
			"desc":paymentDetailsFull,
			"invoice":null,
			"payment":paymentAmount
		});
		ledgerList = sortArrayByDate(ledgerList);
		table1.clear();
		for (x in ledgerList) {
			table1.row.add([reformatDate(ledgerList[x].date),ledgerList[x].desc,ledgerList[x].invoice,ledgerList[x].payment,null]);	
		}
		table1.draw();
		countTotalDue();
		countTotalReceived();
		countBalance();
		countTotalBalance();
	} */
	setTimeout(function(){
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
		//reset payment form
		$('#addPaymentForm').trigger("reset");
		$("#paymentDetailsOtherBlock").hide();
		removeOptions(document.getElementById("paymentDetails"));
		var optionElement1 = document.createElement("option");
		var optionElement2 = document.createElement("option");
		var optionElement3 = document.createElement("option");
		var optionElement4 = document.createElement("option");
		optionElement1.value = "rentpay";
		optionElement1.innerHTML = "Rental Payment";
		optionElement2.value = "finepay";
		optionElement2.innerHTML = "Fine Payment";
		optionElement3.value = "bondpay";
		optionElement3.innerHTML = "Bond Money Payment";
		optionElement4.value = "otherpay";
		optionElement4.innerHTML = "Other Payment";
		document.getElementById("paymentDetails").appendChild(optionElement1);
		document.getElementById("paymentDetails").appendChild(optionElement2);
		document.getElementById("paymentDetails").appendChild(optionElement3);
		document.getElementById("paymentDetails").appendChild(optionElement4);
		//success notification
		$.gritter.add({
			title: 'Payment Added',
			text: 'Payment was successfully added to the database.',
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		})
	}, 1000);
	
}

function extendTenant() {
	
	//collect data from form
	historyperiod++;
	var payPlan = $("#extendPayPlan").val();
	var bondPrice = $("#fbond").html();
	var rentPrice = $("#fprice").html();
	var startDate = $("#startDate").html();
	var endDate = $("#endDate").html();
	//write to page
	var theText = `
		<div style="margin:15px 0px;"></div>
		<div id="tenanthistoryperiod${historyperiod}" class="nav-tabs">
			<div class="form-group" style="margin:0px -15px;">
				<label for="period" class="control-label col-lg-3">Period</label>
				<div class="col-lg-9">
					<div class="checkbox">
						<span id="period" name="period">${startDate} - ${endDate}</span>
					</div>
				</div>
			</div>
			<div class="form-group" style="margin:0px -15px;">
				<label for="bond" class="control-label col-lg-3">Bond</label>
				<div class="col-lg-9">
					<div class="checkbox">
						<span id="bond" name="bond">${bondPrice} to be paid at the beginning of contract</span>
					</div>
				</div>
			</div>
			<div class="form-group" style="margin:0px -15px;">
				<label for="payment" class="control-label col-lg-3">Payment</label>
				<div class="col-lg-9">
					<div class="checkbox">
						<span id="payment" name="payment">${rentPrice} paid ${payPlan} Electricity include /month</span>
					</div>
				</div>
			</div>
		</div>`;
	$("#tenanthistory").append(theText);
	//update data date (dummy)
	$("#startDate").html(endDate);
	$("#endDate").html('');
	$("#extendForm").trigger("reset");
	//create due on ledger
	/*
	var bondPriceInt = parseInt($("#cfbond").val());
	var rentPriceInt = parseInt($("#cfprice").val());
	ledgerList.push({
		"date":reformatDate2(startDate),
		"desc":"Bond Money Due",
		"invoice":bondPriceInt,
		"payment":null
	});
	ledgerList.push({
		"date":reformatDate2(startDate),
		"desc":"Rental Due",
		"invoice":rentPriceInt,
		"payment":null
	});
	ledgerList = sortArrayByDate(ledgerList);
	table1.clear();
	for (x in ledgerList) {
		table1.row.add([reformatDate(ledgerList[x].date),ledgerList[x].desc,ledgerList[x].invoice,ledgerList[x].payment,null]);	
	}
	table1.draw();
	countTotalDue();
	countTotalReceived();
	countBalance();
	countTotalBalance();
	//change start date to end of contract
	$("#startDate").html($("#endDate").html());
	//reset input
	$("#extendPayPlan")
		.val("")
		.trigger("change");
	$("#extendIntend")
		.val("")
		.trigger("change");
	*/
	setTimeout(function(){
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
		//success notification
		$.gritter.add({
			title: 'Tenant Extended',
			text: 'Tenant was successfully extended.',
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		})
	}, 1000);

}


$(window).scroll(function(){
	if ($(this).scrollTop() > 350) {
		$('#btnpayin').addClass('fixed');
	} else {
		$('#btnpayin').removeClass('fixed');
	}
});
$(document).ready(function() {
	
	// invoice and payment scroll
	/* window.onscroll = function() {
		myFunction()
	};
	var elemelon = $("#btnpayin");
	var position = elemelon.position();
	var sticky = position.top;
	alert(sticky);
	function myFunction() {
		if (window.pageYOffset > 280) {
			elemelon.addClass("sticky");
		} else {
			elemelon.removeClass("sticky");
		}
	} */
	//start
	id2 = window.location.href.split('=')[1];
	id = id2.split("#")[0];
	var tenantNames = [
		{
			label: "Bea Curran",
			tenantid: "t_1d",
			refnumber: "101010100"
		},
		{
			label: "Kevin Owen",
			tenantid: "t_2d",
			refnumber: "101010200"
		},
		{
			label: "Briana Holloway",
			tenantid: "t_3d",
			refnumber: "101010300"
		},
		{
			label: "Zakary Neville",
			tenantid: "t_4d",
			refnumber: "101010400"
		},
		{
			label: "Aleksandra Hyde",
			tenantid: "t_5d",
			refnumber: "101010500"
		},
		{
			label: "Amari O'Reilly",
			tenantid: "t_6d",
			refnumber: "101020100"
		},
		{
			label: "Jan Garrison",
			tenantid: "t_7d",
			refnumber: "101020300"
		},
		{
			label: "Kevin Owen",
			tenantid: "t_8d",
			refnumber: "102010200"
		},
		{
			label: "Pamela Daugherty",
			tenantid: "t_9d",
			refnumber: "102010100"
		},
		{
			label: "Vernon Kirkland",
			tenantid: "t_10d",
			refnumber: "101010101"
		},
		{
			label: "Jacob Connolly",
			tenantid: "t_11d",
			refnumber: "102020100"
		}
	];
	
	// mengambil data yang approved atau occupy dari firebase ke dalam list
	var trRef1 = firebase.database().ref().child("tenant-room/"+id);
	trRef1.on('child_added', function(snapshot) {
		//get starting date , building address , status occupy , ref id
		var statingDate=snapshot.child("start_date").val();
		var propAddr=snapshot.child("prop_addr").val();
		var statOccupy=snapshot.child("stat_occupy").val();
		var refN=snapshot.child("ref_number").val().split(" ");
		var refNumber=refN[0]+refN[1]+refN[2];
		
		//mengambil rent price
		var rentPrice=snapshot.child("rent_price").val();
		$("#yearp").val(rentPrice);
		$("#payment").html(get_fmoney(rentPrice)+" paid monthly Electricity include /month");
		//mengambil rent price
		var sDate=snapshot.child("start_date").val();
		
		//mengambil bond price
		var bondPrice=snapshot.child("rent_bond").val();
		$("#bond").html(get_fmoney(bondPrice)+" paid monthly Electricity include /month");
		
		//mengambil ctrt_opt
		var kontrak=snapshot.child("ctrt_opt").val();
		
		// mengisi data pertama dari kontrak
		var intend = parseInt(kontrak);
		
		var startDate = sDate.split("/");
		var startMonth = startDate[0];
		var startDay = startDate[1];
		var startYear = startDate[2];
		var endMonth = parseInt(startMonth)+intend;
		var endDay = parseInt(startDay);
		var endYear = parseInt(startYear);
		if (endMonth>12) {
			var addYear = Math.trunc(endMonth/12);
			endYear += addYear;
			endMonth = endMonth%12;
		}
		var endDate = endMonth+"/"+endDay+"/"+endYear;
		$("#period").html(reformatDate(sDate)+"-"+reformatDate(endDate));
		// update next date (dummy)
		$("#startDate").html(reformatDate(endDate));
		
		// mengambil data tenant yang status nya approved atau active
		if ((statOccupy=="approved") ||(statOccupy=="active")){
			
			//untuk mengisi default payment
			//default bond
			bondList.push({
				"date":statingDate,
				"desc":"Bond Money Due",
				"invoice":bondPrice,
				"payment":null
			});
			bondWaitDue += bondPrice;
			ledgerList.push({
				"date":statingDate,
				"desc":"Rental Due",
				"invoice":bondPrice,
				"payment":null
			});
			
			//sort bond
			bondList = sortArrayByDate(bondList);
			for (x in bondList) {
				table.row.add([reformatDate(bondList[x].date),bondList[x].desc,bondList[x].invoice,bondList[x].payment,null]);	
			}
			//sort ledger
			ledgerList = sortArrayByDate(ledgerList);
			for (x in ledgerList) {
				table1.row.add([reformatDate(ledgerList[x].date),ledgerList[x].desc,ledgerList[x].invoice,ledgerList[x].payment,null]);	
			}
			table.draw();
			table1.draw();
			//menghitung total Bond
			countTotalBondDue();
			countTotalBondReceived();
			countBondBalance();
			countTotalBondBalance();
			//menghitung total Ledger
			countTotalDue();
			countTotalReceived();
			countBalance();
			countTotalBalance();
			//end default bond
			//end untuk mengisi default payment
			
			var tenantRef = firebase.database().ref().child("tenant/"+id);
			tenantRef.once('value', function(snapshot) {
				var full_name=snapshot.child("full_name").val();
				newObj = {
					"label":full_name,
					"tenantid":id,
					"refnumber":refNumber
				}
				tenantNames.push(newObj);
			});
		}
	});
	
	// nama tenant untuk validasi
	var label= null;
	
	//fill name and refnumber from database
	var tenantRef = firebase.database().ref().child("tenant/"+id);
	tenantRef.once('value', function(snapshot) {
		// get name,dll from database
		var full_name=snapshot.child("full_name").val();
		var birth_date=snapshot.child("birth_date").val();
		var cont_home=snapshot.child("cont_home").val();
		var cont_mobile=snapshot.child("cont_mobile").val();
		var email=snapshot.child("full_name").val();
		var id_number1=snapshot.child("id_number1").val();
		var id_number2=snapshot.child("id_number2").val();
		var id_photo1=snapshot.child("id_photo1").val();
		var id_photo2=snapshot.child("id_photo2").val();
		var id_type1=snapshot.child("id_type1").val();
		var id_type2=snapshot.child("id_type2").val();
		var kk_photo=snapshot.child("kk_photo").val();
		var los_prev=snapshot.child("los_prev").val();
		var occupation=snapshot.child("occupation").val();
		var perm_addr=snapshot.child("perm_addr").val();
		var prev_addr=snapshot.child("prev_addr").val();
		var rfl_prev=snapshot.child("rfl_prev").val();
		// get data ref 1
		reftenantRef1=tenantRef.child("references/reference_1");
		reftenantRef1.once('value', function(snapshot) {
			var addressR1=snapshot.child("address").val();
			var contactR1=snapshot.child("contact").val();
			var full_nameR1=snapshot.child("full_name").val();
			var relationR1=snapshot.child("relation").val();
			// get data ref 2
			reftenantRef2=tenantRef.child("references/reference_2");
			reftenantRef2.once('value', function(snapshot) {
				var addressR2=snapshot.child("address").val();
				var contactR2=snapshot.child("contact").val();
				var full_nameR2=snapshot.child("full_name").val();
				var relationR2=snapshot.child("relation").val();
				
				// check data pada list tenantname
				for (i=0;i<(tenantNames.length);++i){
					if (tenantNames[i].tenantid == id){
						label = tenantNames[i].label;
						var refnumber = tenantNames[i].refnumber;
					}
					//redirect from accounting building
					if ((tenantNames[i].tenantid)+"#ledger" == id2) {
						$("#ledger").addClass("in active")
						$("#tenant").removeClass("in active")
						$("#tabtenant").removeClass("active")
						$("#tabledger").addClass("active")
						label = tenantNames[i].label;
						var refnumber = tenantNames[i].refnumber;
					}
				}
				//check tenant exist
				if (label== null) {	
					window.alert("Tenant doesn't exist");
					window.location="tenant_main.html";
				}
				
				
				// fill data from firebase to html
				refnumber = refnumber.split("")
				$("#tenant_name").html(label);
				$("#tenant_id").html(refnumber[0]+refnumber[1]+refnumber[2]+" "+refnumber[3]+refnumber[4]+refnumber[5]+" "+refnumber[6]+refnumber[7]+refnumber[8]);
				$("#afname").html(label);
				$("#extendBuildNo").html(refnumber[1]+refnumber[2]);
				$("#extendFloorNo").html(refnumber[3]+refnumber[4]);
				$("#extendRoomNo").html(refnumber[5]+refnumber[6]);
				//jika data bukan dummy maka ini data dari firebase
				if (full_name!=null){
					$("#aphome").html(cont_home);
					$("#apmobile").html(cont_mobile);
					$("#aadstreet").html(perm_addr.split(", ")[0]);
					$("#aadcity").html(perm_addr.split(", ")[1]);
					$("#aadprov").html(perm_addr.split(", ")[2]);
					$("#aadzip").html(perm_addr.split(", ")[2].split(" ")[1]);
					$("#bdate").html(birth_date);
					$("#idtype1").html(id_type1+" #"+id_number1);
					$("#idtype2").html(id_type2+" #"+id_number2);
					$("#occupy").html(occupation);
					//reference 1
					$("#r1fname").html(full_nameR1);
					$("#r1rel").html(relationR1);
					$("#r1adstreet").html(addressR1);
					$("#r1p").html(contactR1);
					//reference 2
					$("#r2fname").html(full_nameR1);
					$("#r2rel").html(relationR1);
					$("#r2adstreet").html(addressR1);
					$("#r2p").html(contactR1);
				}
			});
		});
	});

	
	
	//start jquery prettyphoto
	$(".prettyphoto").prettyPhoto({
		overlay_gallery: false, 
		social_tools: false
	})
	//tenant id1 button listener
	$("#id1").on('click', function() {
		$("#id1img").trigger( "click" );
	})
	//tenant id2 button listener
	$("#id2").on('click', function() {
		$("#id2img").trigger( "click" );
	})
	//tenant id3 button listener
	$("#id3").on('click', function() {
		$("#id3img").trigger( "click" );
	})
	//invoice add button listener
	$("#invoiceb").on('click', function() {
		$("#addInvoiceModal").modal();
	})
	//invoice amount listener
	$("#invoiceAmount").on('keyup change', function() {
		$("#invoiceAmount").val(get_moneydot($("#invoiceAmount").val()));
	})
	//invoice modal details listener
	$("#invoiceDetails").on('change', function() {
		if ($(this).find("option:selected").attr("value") == "otherdue") {
			$("#invoiceDetailsOtherBlock").fadeIn(250, function() {
				$(this).show();
			})
		} else {
			$("#invoiceDetailsOtherBlock").fadeOut(250, function() {
				$(this).hide();
			})
		}
	})
	//invoice modal add listener
	$("#addInvoiceButton").click(function() {
		$("#addInvoiceForm").submit();
	})
	//invoice add form validation
	$("#addInvoiceForm").validate({
		submitHandler: function() {
			$('#addInvoiceModal').modal('hide');
			$("#cover-spin").fadeIn(250, function() {
				$(this).show();
			})
			addInvoice();
		}
	})
	//payment add button listener
	$("#paymentb").on('click', function() {
		$("#addPaymentModal").modal();
	})
	//payment bond checkbox listener
	$("input[type=checkbox][name=paymentBond]").on('change', function() {
		if (this.checked) {
			$("#paymentDetailsOtherBlock").fadeOut(250, function() {
				$(this).hide();
			})
			removeOptions(document.getElementById("paymentDetails"));
			var optionElement1 = document.createElement("option");
			var optionElement2 = document.createElement("option");
			var optionElement3 = document.createElement("option");
			optionElement1.value = "transfer";
			optionElement1.innerHTML = "Bond Money Transfer";
			optionElement2.value = "refund";
			optionElement2.innerHTML = "Bond Money Refund";
			optionElement3.value = "bondpay";
			optionElement3.innerHTML = "Bond Money Payment";
			document.getElementById("paymentDetails").appendChild(optionElement1);
			document.getElementById("paymentDetails").appendChild(optionElement2);
			document.getElementById("paymentDetails").appendChild(optionElement3);
		} else {
			$("#paymentDetailsOtherBlock").fadeOut(250, function() {
				$(this).hide();
			})
			removeOptions(document.getElementById("paymentDetails"));
			var optionElement1 = document.createElement("option");
			var optionElement2 = document.createElement("option");
			var optionElement3 = document.createElement("option");
			var optionElement4 = document.createElement("option");
			optionElement1.value = "rentpay";
			optionElement1.innerHTML = "Rental Payment";
			optionElement2.value = "finepay";
			optionElement2.innerHTML = "Fine Payment";
			optionElement3.value = "bondpay";
			optionElement3.innerHTML = "Bond Money Payment";
			optionElement4.value = "otherpay";
			optionElement4.innerHTML = "Other Payment";
			document.getElementById("paymentDetails").appendChild(optionElement1);
			document.getElementById("paymentDetails").appendChild(optionElement2);
			document.getElementById("paymentDetails").appendChild(optionElement3);
			document.getElementById("paymentDetails").appendChild(optionElement4);
		}
	})
	//payment amount listener
	$("#paymentAmount").on('keyup change', function() {
		$("#paymentAmount").val(get_moneydot($("#paymentAmount").val()));
	})
	//payment modal details listener
	$("#paymentDetails").on('change', function() {
		if ($(this).find("option:selected").attr("value") == "otherpay") {
			$("#paymentDetailsOtherBlock").fadeIn(250, function() {
				$(this).show();
			})
		} else {
			$("#paymentDetailsOtherBlock").fadeOut(250, function() {
				$(this).hide();
			})
		}
	})
	//payment modal add listener
	$("#addPaymentButton").click(function() {
		$("#addPaymentForm").submit();
	})
	//payment add form validation
	$("#addPaymentForm").validate({
		submitHandler: function() {
			$('#addPaymentModal').modal('hide');
			$("#cover-spin").fadeIn(250, function() {
				$(this).show();
			})
			addPayment();
		}
	})
	//extend button listener
	$("#extender").on('click', function() {
		$("#extendModal").modal();
	})
	//extend modal payment plan listener
	$("#extendPayPlan").on('change', function() {
		var yearPr = $("#yearp").val();
		var sixPr = pembulatan((((parseInt(yearPr)/2)*1.1)+25000).toFixed(2));
		var monthPr = pembulatan((((parseInt(yearPr)/12)*1.2)+25000).toFixed(2));
		var yearBo = pembulatan((parseInt(yearPr)/12).toFixed(2));
		var sixBo = pembulatan(monthPr);
		var monthBo = pembulatan((sixPr/6).toFixed(2));
		if ($(this).find("option:selected").attr("value") == "") {
			$("#roompricing").fadeOut(250, function() {
				$(this).hide();
			})
			$("#rprice,#bmoney,#fprice,#fbond").html("Rp. -");
			$("#cprice,#cbond,#cfprice,#cfbond").val("");
			$("#padj,#badj").fadeOut(200, function() {
				$(this).hide();
			})
		} else if ($(this).find("option:selected").attr("value") == "annually") {
			$("#roompricing").fadeIn(250, function() {
				$(this).show();
			})
			$("#rprice,#fprice").html(get_fmoney(yearPr));
			$("#bmoney,#fbond").html(get_fmoney(yearBo));
			$("#cprice,#cfprice").val(yearPr);
			$("#cbond,#cfbond").val(yearBo);
			$("#padj,#badj").fadeIn(200, function() {
				$(this).show();
			})
		} else if ($(this).find("option:selected").attr("value") == "semiannually") {
			$("#roompricing").fadeIn(250, function() {
				$(this).show();
			})
			$("#rprice,#fprice").html(get_fmoney(sixPr));
			$("#bmoney,#fbond").html(get_fmoney(sixBo));
			$("#cprice,#cfprice").val(sixPr);
			$("#cbond,#cfbond").val(sixBo);
			$("#padj,#badj").fadeIn(200, function() {
				$(this).show();
			})
		} else if ($(this).find("option:selected").attr("value") == "monthly") {
			$("#roompricing").fadeIn(250, function() {
				$(this).show();
			})
			$("#rprice,#fprice").html(get_fmoney(monthPr));
			$("#bmoney,#fbond").html(get_fmoney(monthBo));
			$("#cprice,#cfprice").val(monthPr);
			$("#cbond,#cfbond").val(monthBo);
			$("#padj,#badj").fadeIn(200, function() {
				$(this).show();
			})
		}
	});
	//extend modal price adjustment listener
	$("#padj").on('click', function() {
		//prompt to insert value
		var prompter = prompt("Adjustment");
		//when prompt is ok
		if (prompter != null && prompter != "") {
			var adjprice = parseInt($("#cprice").val()) + parseInt(prompter);
			$("#fprice").html(get_fmoney(pembulatan(adjprice)));
			$("#cfprice").val(pembulatan(adjprice));
			if ($("#payplan").find("option:selected").attr("value") == "annually") {
				var yearPr = $("#cfprice").val();
				var yearBo = pembulatan((parseInt(yearPr)/12).toFixed(2));
				$("#fbond").html(get_fmoney(yearBo));
				$("#cfbond").val(yearBo);
			} else if ($("#payplan").find("option:selected").attr("value") == "semiannually") {
				var sixPr = $("#cfprice").val();
				var yearPr = pembulatan((((sixPr-25000)/1.1)*2).toFixed(2));
				var monthPr = pembulatan((((parseInt(yearPr)/12)*1.2)+25000).toFixed(2));
				var sixBo = pembulatan(monthPr);
				$("#fbond").html(get_fmoney(sixBo));
				$("#cfbond").val(sixBo);
			} else if ($("#payplan").find("option:selected").attr("value") == "monthly") {
				var monthPr = $("#cfprice").val();
				var yearPr = pembulatan((((monthPr-25000)/1.2)*12).toFixed(2));
				var sixPr = pembulatan((((parseInt(yearPr)/2)*1.1)+25000).toFixed(2));
				var monthBo = pembulatan((sixPr/6).toFixed(2));
				$("#fbond").html(get_fmoney(monthBo));
				$("#cfbond").val(monthBo);
			}
		}
	});
	//extend modal bond money adjustment listener
	$("#badj").on('click', function() {
		//prompt to insert value
		var prompter = prompt("Adjustment");
		//when prompt is ok
		if (prompter != null && prompter != "") {
			var adjbond = parseInt($("#cfbond").val()) + parseInt(prompter);
			$("#fbond").html(get_fmoney(pembulatan(adjbond)));
		}
	});
	//extend modal intend listener
	$("#extendIntend").on('change', function() {
		if ($("#extendIntend").val() == "") {
			$("#endDate").html("-");
		} else {
			var intend = parseInt($("#extendIntend").val());
			var startDate = reformatDate2($("#startDate").html()).split("/");
			var startMonth = startDate[0];
			var startDay = startDate[1];
			var startYear = startDate[2];
			var endMonth = parseInt(startMonth)+intend;
			var endDay = parseInt(startDay);
			var endYear = parseInt(startYear);
			if (endMonth>12) {
				var addYear = Math.trunc(endMonth/12);
				endYear += addYear;
				endMonth = endMonth%12;
			}
			var endDate = endMonth+"/"+endDay+"/"+endYear;
			$("#endDate").html(reformatDate(endDate));
		}
	});
	//extend modal extend listener
	$("#extendButton").click(function() {
		$("#extendForm").submit();
	})
	//extend form validation
	$("#extendForm").validate({
		submitHandler: function() {
			$('#extendModal').modal('hide');
			$("#cover-spin").fadeIn(250, function() {
				$(this).show();
			});
			extendTenant();
		}
	})
	
	
	//get data from payment database
	paymentRef = firebase.database().ref().child("payment/"+id);
	paymentRef.on('child_added', function(snapshot) {
		date = snapshot.child("date").val();
		desc = snapshot.child("desc").val();
		invoice = snapshot.child("invoice").val();
		payment = snapshot.child("payment").val();
		list = snapshot.child("list").val();
		refnumber = snapshot.child("refnumber").val();
		//jika list == ledgerList
		if(list=="ledgerList"){
			ledgerList.push({
				"date":date,
				"desc":desc,
				"invoice":invoice,
				"payment":payment
			});
		} else if (list=="bondList"){
			bondList.push({
				"date":date,
				"desc":desc,
				"invoice":invoice,
				"payment":payment
			});
		}
		table.clear();
		table1.clear();
		//sort bond
		bondList = sortArrayByDate(bondList);
		for (x in bondList) {
			table.row.add([reformatDate(bondList[x].date),bondList[x].desc,bondList[x].invoice,bondList[x].payment,null]);	
		}
		//sort ledger
		ledgerList = sortArrayByDate(ledgerList);
		for (x in ledgerList) {
			table1.row.add([reformatDate(ledgerList[x].date),ledgerList[x].desc,ledgerList[x].invoice,ledgerList[x].payment,null]);	
		}
		table.draw();
		table1.draw();
		//menghitung total Bond
		countTotalBondDue();
		countTotalBondReceived();
		countBondBalance();
		countTotalBondBalance();
		//menghitung total Ledger
		countTotalDue();
		countTotalReceived();
		countBalance();
		countTotalBalance();
	});
	


	//stop loading icon
	setTimeout(function(){
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
	}, 3000);
});