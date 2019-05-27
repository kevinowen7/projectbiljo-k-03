//define table to work with jquery datatables
var table = $('#data-table1').DataTable({
	"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
	"iDisplayLength": -1,
	"sPaginationType": "full_numbers",
	"order": [[ 0, "asc" ]],
	"columnDefs": [
	{
		targets: 0,
		orderData: [0,1],
		className: 'dt-body-right',
		width: "8%"
	},
	{
		targets: 1,
		orderData: [1,0],
		width: "8%"
	},
	{
		targets: 2,
		width: "28%",
		orderable: false
	},
	{
		targets: 3,
		orderData: [3,0,1],
		class: "cptprice"
	},
	{
		targets: 4,
		orderData: [4,0,1],
	},
	{
		targets: [3,4],
		render: $.fn.dataTable.render.number( '.', ',', 0, 'Rp. ',',-' )
	},
	{
		targets: 5,
		width: "12%",
		orderable: false
	},
	{ 
		targets: -1,
		width: "12%",
		orderable: false
	}]
})

//table tab tenant
var table3 = $('#data-table3').DataTable({
	"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
	"iDisplayLength": -1,
	"order": [[ 0, "asc" ]],
	"columnDefs": [
	{
		targets: [0],
		className: 'dt-body-right'
	},
	{
		targets: [0,1],
		width: "3%"
	},
	{
		targets: [2,9,10,11],
		width: "25%"
	},
	{
		targets: [4,5,7],
		width: "4%"
	},
	{
		targets: [2,3,4,5,6,8,9,10,11],
		orderable: false
	},
	{
		targets: [2,9,10,11],
		render: $.fn.dataTable.render.number( '.', ',', 0, 'Rp. ',',-' )
	}]
})

//table tab expense
var table5 = $('#data-table5').DataTable({
	"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
	"iDisplayLength": -1,
	"order": [[ 1, "asc" ]],
	"columnDefs": [
	{
		targets: -1,
		render: $.fn.dataTable.render.number( '.', ',', 0, 'Rp. ',',-' )
	}]
})



function addRoom(buildNo) {
	
	for(j=1; j<=9; j++) {
		if (buildNo==String(j)) {
			buildNo="0"+String(j);
		}
	}
	window.location = "room_add.html?id=1"+buildNo;
}

function editRoom(roomID) {
	
	window.location = "room_edit.html?id="+roomID;
	
}

function roomHist(roomID) {
	
	window.location = "room_history.html?id="+roomID;
	
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

function removeRoom(roomID) {
	
	//trigger modal popup
	$("#modalConfirm").modal();
	//modal confirmation listener
	$("#confirmYes").on('click', function () {
		//stop modal confirmation listener
		$("#confirmYes").off();
		//success notification
		$.gritter.add({
			title: 'Room Removed',
			text: 'Room was successfully removed from the database.',
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		})
	})
	
}


function countTotalDue() {
	
	var totalDue = 0;
	for (i=0;i<table3.rows().count();i++) {
		var ledgerDue = table3.row(i).data()[9];
		if (ledgerDue != null) {
			totalDue = totalDue+ledgerDue;
		}
	}
	$("#DueTot").html(get_fmoney(totalDue));
	
}

function countTotalReceived() {
	
	var totalReceived = 0;
	for (i=0;i<table3.rows().count();i++) {
		var ledgerReceived = table3.row(i).data()[10];
		if (ledgerReceived != null) {
			totalReceived = totalReceived+ledgerReceived;
		}
	}
	$("#ReceivedTot").html(get_fmoney(totalReceived));
	
}

function countTotalBalance() {
	
	var totalDue = rem_fmoney($("#DueTot").html());
	var totalReceived = rem_fmoney($("#ReceivedTot").html());
	var totalBalance = totalReceived - totalDue;
	if (totalBalance < 0) {
		$("#BalanceTot").html("("+get_fmoney(Math.abs(totalBalance))+")");
	} else {
		$("#BalanceTot").html(get_fmoney(totalBalance));
	}
	
}

function expenseTotalAmount() {
	
	var totalReceived = 0;
	for (i=0;i<table5.rows().count();i++) {
		var ledgerReceived = table5.row(i).data()[3];
		if (ledgerReceived != null) {
			totalReceived = totalReceived+ledgerReceived;
		}
	}
	$("#AmountTot").html(get_fmoney(totalReceived));
	
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
				"detail":oldArray[i].detail,
				"amount":oldArray[i].amount,
				"id":oldArray[i].id,
			}
			newArray[0] = newObj;
		}
		else {
			for (j=newArray.length-1;j>=0;j--) {
				if (date_diff_indays(newArray[j].date,oldArray[i].date)>=0) {
					for (k=newArray.length-1;k>=j;k--) {
						newObj = {
						"date":newArray[k].date,
						"detail":newArray[k].detail,
						"amount":newArray[k].amount,
						"id":newArray[k].id
						}
						newArray[k+1] = newObj;
					}
					newObj2 = {
					  "date":oldArray[i].date,
					  "detail":oldArray[i].detail,
					  "amount":oldArray[i].amount,
					  "id":oldArray[i].id
					}
					newArray[j+1] = newObj2;
					break
				}
				else {
					if (j==0) {
						for (k=newArray.length-1;k>=j;k--) {
							newObj = {
							  "date":newArray[k].date,
							  "detail":newArray[k].detail,
							  "amount":newArray[k].amount,
							  "id":newArray[k].id
							}
							newArray[k+1] = newObj;
						}
						newObj2 = {
							"date":oldArray[i].date,
							"detail":oldArray[i].detail,
							"amount":oldArray[i].amount,
							"id":oldArray[i].id
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

var bondList=[];
var idExpense=1;
function addExpense(){
	//collect data from amount form
	var expenseDate = reformatDate2($("#edateex").val());
	var expenseAmount = rem_moneydot($("#amountex").val());
	var expenseDetails = $("#detailsex").val();
	var expenseDetailsOther = $("#otherex").val();
	if (expenseDetails == "rtrw fee") {
		var expenseDetailsFull = "RT/RW fee";
	} else if (expenseDetails == "tvcable") {
		var expenseDetailsFull = "TV Cable";
	} else if (expenseDetails == "internet") {
		var expenseDetailsFull = "Internet";
	} else if (expenseDetails == "electricity") {
		var expenseDetailsFull = "Electricity";
	} else if (expenseDetails == "laundry") {
		var expenseDetailsFull = "Laundry";
	} else {
		var expenseDetailsFull = "Other Expense - "+expenseDetailsOther;
	}
	bondList.push({
		"date":expenseDate,
		"detail":expenseDetailsFull,
		"amount":expenseAmount,
		"id":idExpense
	});
	//reset standard expense
	bondList = sortArrayByDate(bondList);
	table5.clear();
	for (x in bondList) {
		table5.row.add([bondList[x].id,reformatDate(bondList[x].date),bondList[x].detail,bondList[x].amount]);	
		idExpense=idExpense+1;
	}
	table5.draw();
	
	//total
	expenseTotalAmount();
	
	//reset expense form
	setTimeout(function(){
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
		//reset expense form
		$('#expenseForm').trigger("reset");
		$("#optex").hide();
		//redirect to tab expense
		$("#tenanti").removeClass("in active")
		$("#roomi").removeClass("in active")
		$("#expensei").addClass("in active")
		$("#tabroomi").removeClass("active")
		$("#tabexpensei").addClass("active")
		$("#tabtenanti").removeClass("active")
		//success notification
		$.gritter.add({
			title: 'Expense Added',
			text: 'Expense was successfully added to the database.',
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		})
	}, 1000);
	
}
	
$(document).ready(function() {
	//expense add button listener
	$("#expenseButton").on('click', function() {
		$("#modalExpense").modal();
	})
	//expense amount listener
	$("#amountex").on('keyup change', function() {
		$("#amountex").val(get_moneydot($("#amountex").val()));
	})
	//expense modal add listener
	$("#confirmExpense").click(function() {
		$("#expenseForm").submit();
	})
	//expense add form validation
	$("#expenseForm").validate({
		submitHandler: function() {
			$('#modalExpense').modal('hide');
			$("#cover-spin").fadeIn(250, function() {
				$(this).show();
			})
			addExpense();
		}
	})


	
	//check other expense
	$("#detailsex").on('change', function() {
		if ($(this).find("option:selected").attr("value") == "other") {
			$("#optex").fadeIn(250, function() {
				$(this).show();
			})
		} else {
			$("#optex").fadeOut(250, function() {
				$(this).hide();
			});
		}
	})
	
	
	// autocomplete
	$("#propaddr_s").show();
	$("#propshow").hide();
	$("#refblock").hide();
	$("#payplan").prop("disabled",true);
	

	//array for search bar autocomplete
	var buildList = [];
	
	//building number listener
	$('#buildNo').on('keyup', function (e) {
		//enter trigger
		if(e.which === 13){
			var buildno = $(this).val();
			for(j=1; j<=9; j++) {
				if (buildno==String(j)) {
					buildno="0"+String(j);
				}
			}
			
			
			//tab tenant 
			table3
				.clear()
				.draw();
			var Ref = parseInt($("#buildNo").val());
			//define table to work with jquery datatables
			if (Ref == 1){
				// change address and total room
				$("#totalR").html("9")
				$("#totalR1").html("9")
				$("#propaddr_s").html("Jl. Skipper No. 15 RT 12 RW 23, Nigga, What");
				$("#buildNo").html($("#buildNo").val())
				//input data from database to table
				table3.row.add(["01","<a id='1010101' href='javaScript:void(0);' onclick='editRoom(1010101)'>01</a>",3000000,"","","","","","",0,0,0]);
				table3.row.add(["01","<a id='1010102' href='javaScript:void(0);' onclick='editRoom(1010102)'>02</a>",3000000,"","","","","","",0,0,0]);
				table3.row.add(["01","<a id='1010103' href='javaScript:void(0);' onclick='editRoom(1010103)'>03</a>",3000000,"<a id='t_5 ' href='tenant_details.html?id=t_5#ledger'>Aleksandra Hyde</a>","1-May-08","31-Oct-08","101 010 500","monthly","0813-94715874",275000,0,"(Rp. 275.000,-)"]);
				table3.row.add(["02","<a id='1010201' href='javaScript:void(0);' onclick='editRoom(1010201)'>01</a>",3000000,"<a id='t_6 ' href='tenant_details.html?id=t_6#ledger'>Amari O'Reilly</a>","1-Apr-08","30-Sep-08","101 020 100","monthly","022 - 9199 3781",225000,0,"(Rp. 225.000,-)"]);
				table3.row.add(["02","<a id='1010202' href='javaScript:void(0);' onclick='editRoom(1010202)'>02</a>",3000000,"<a id='t_7 ' href='tenant_details.html?id=t_7#ledger'>Jan Garrison</a>","1-May-08","30-Oct-08","101 020 200","monthly","0856-2032552",215000,215000,0]);
				table3.row.add(["02","<a id='1010203' href='javaScript:void(0);' onclick='editRoom(1010203)'>03</a>",2700000,"<a id='t_3 ' href='tenant_details.html?id=t_3#ledger'>Briana Holloway</a>","1-May-08","<p>30-Oct-08</p><p>Bond</p>","101 020 300","monthly","0813-20093906",150000,275000,125000]);
				table3.row.add(["03","<a id='1010301' href='javaScript:void(0);' onclick='editRoom(1010301)'>01</a>",2700000,"<a id='t_4 ' href='tenant_details.html?id=t_4#ledger'>Zakary Neville</a>","27-May-08","<p>26-Oct-08</p><p>Bond</p>","101 030 100","monthly","0857-59936957",225000,275000,50000]);
				table3.row.add(["03","<a id='1010302' href='javaScript:void(0);' onclick='editRoom(1010302)'>02</a>",2700000,"<a id='t_2 ' href='tenant_details.html?id=t_2#ledger'>Kevin Owen</a>","8-May-08","<p>7-Nov-08</p><p>Bond</p>","101 030 200","6 month","0857-22102914",225000,225000,0]);
				table3.row.add(["03","<a id='1010303' href='javaScript:void(0);' onclick='editRoom(1010303)'>03</a>",3000000,"<a id='t_8 ' href='tenant_details.html?id=t_8#ledger'>Pamela Daugherty</a>","1-May-08","<p>31-Oct-08</p>","101 030 300","6 month","0819-10225333",215000,300000,85000]);
				table3.draw(false);
			}
			if (Ref == 3){
				// change address and total room
				$("#totalR").html("14")
				$("#totalR1").html("14")
				$("#propaddr_s").html("GG. H. SIROD NO 16, CIHAMPELAS")
				$("#buildNo").html($("#buildNo").val())
				//input data from database to table
				table3.row.add(["01","<a id='1030101' href='javaScript:void(0);' onclick='editRoom(1030101)'>01</a>",3000000,"","","","","","",0,0,0]);
				table3.row.add(["01","<a id='1030102' href='javaScript:void(0);' onclick='editRoom(1030102)'>02</a>",3000000,"","","","","","",0,0,0]);
				table3.row.add(["01","<a id='1030103' href='javaScript:void(0);' onclick='editRoom(1030103)'>03</a>",3000000,"<a id='t_5' href='javaScript:void(0);'>M.Gaha Wendy</a>","1-May-08","31-Oct-08","101 010 300","monthly","0813-94715874",275000,0,"Rp (275.000,-)"]);
				table3.row.add(["01","<a id='1030104' href='javaScript:void(0);' onclick='editRoom(1030104)'>04</a>",3000000,"<a id='t_6' href='javaScript:void(0);'>Christian FT</a>","1-Apr-08","30-Sep-08","101 010 400","monthly","022 - 9199 3781",225000,0,"Rp (225.000,-)"]);
				table3.row.add(["01","<a id='1030105' href='javaScript:void(0);' onclick='editRoom(1030105)'>05</a>",3000000,"","","","","","",0,0,0]);
				table3.row.add(["01","<a id='1030106' href='javaScript:void(0);' onclick='editRoom(1030106)'>06</a>",3000000,"","","","","","",0,0,0]);
				table3.row.add(["01","<a id='1030107' href='javaScript:void(0);' onclick='editRoom(1030107)'>07</a>",3000000,"<a id='t_7' href='javaScript:void(0);'>Inu Wisnu</a>","1-May-08","30-Oct-08","101 010 700","monthly","0856-2032552",215000,215000,0]);
				table3.row.add(["02","<a id='1030201' href='javaScript:void(0);' onclick='editRoom(1030201)'>01</a>",2700000,"","","","","","",0,0,0]);
				table3.row.add(["02","<a id='1030202' href='javaScript:void(0);' onclick='editRoom(1030202)'>02</a>",2700000,"<a id='t_3' href='javaScript:void(0);'>Lidha Lismanawati</a>","1-May-08","<p>30-Oct-08</p><p>Bond</p>","101 020 200","monthly","0813-20093906",150000,125000,"Rp (25.000,-)"]);
				table3.row.add(["02","<a id='1030203' href='javaScript:void(0);' onclick='editRoom(1030203)'>03</a>",2700000,"<a id='t_4' href='javaScript:void(0);'>Ai Tuti Sulastri</a>","27-May-08","<p>26-Oct-08</p><p>Bond</p>","101 020 300","monthly","0857-59936957",225000,275000,50000]);
				table3.row.add(["02","<a id='1030204' href='javaScript:void(0);' onclick='editRoom(1030204)'>04</a>",2700000,"<a id='t_2' href='javaScript:void(0);'>Rahmawati Shaumah</a>","8-May-08","<p>7-Nov-08</p><p>Bond</p>","101 020 400","6 month","0857-22102914",225000,225000,0]);
				table3.row.add(["02","<a id='1030205' href='javaScript:void(0);' onclick='editRoom(1030205)'>05</a>",3000000,"<a id='t_8' href='javaScript:void(0);'>Fanny Astriani</a>","1-May-08","<p>31-Oct-08</p>","101 020 500","6 month","0819-10225333",215000,300000,85000]);
				table3.row.add(["02","<a id='1030206' href='javaScript:void(0);' onclick='editRoom(1030206)'>06</a>",2700000,"<a id='t_9' href='javaScript:void(0);'>Nina Tanuatmadja</a>","1-May-08","<p>31-Oct-08</p>","101 020 600","6 month","0857-20517210",200000,200000,0]);
				table3.row.add(["02","<a id='1030207' href='javaScript:void(0);' onclick='editRoom(1030207)'>07</a>",3500000,"<a id='t_10' href='javaScript:void(0);'>Yulmedianti K</a>","1-May-08","<p>31-Oct-08</p><p>Bond</p>","101 020 700","6 month","0852-22305695",350000,350000,0]);
				table3.draw(false);
			}
			if (Ref == 7){
				// change address and total room
				$("#totalR").html("0")
				$("#totalR1").html("0")
				$("#propaddr_s").html("Jl. Private No. 2 RT 3 RW 4, Yes, No")
				$("#buildNo").html($("#buildNo").val())
			}
			// else
			if (Ref != 1 && Ref != 3 && Ref != 7){
				$("#totalR").html("0")
				$("#totalR1").html("0")
				$("#propaddr_s").html("NOT FOUND")
				$("#buildNo").html($("#buildNo").val())
			}
			
			countTotalDue();
			countTotalReceived();
			countTotalBalance();
			
			// end tab tenant
			
			$('#f2').css("background-color","#D6F6FF");
			
			table
				.clear()
				.draw();
			
			var dbRef0 = firebase.database().ref().child("property/residential/building_no:"+buildno);
			dbRef0.once('value', function(snapshot) {
				if (snapshot.child("address_street").val() == null) {
					$("#propaddr_s").val(null);
					//stop loading icon
					$("#cover-spin").fadeOut(250, function() {
						$(this).hide();
					})
				} else {
					//cek
					if (buildList[0].buildid == String(buildno)){
						$("#propaddr_s").val(buildList[0].address1);
					}
					if (buildList[1].buildid == String(buildno)){
						$("#propaddr_s").val(buildList[1].address1);
					}
					if (buildList[2].buildid == String(buildno)){
						$("#propaddr_s").val(buildList[2].address1);
					}
					//firebase
					dbRef0.on('child_added', function(snapshot) {
						if (snapshot.key.split(":")[0] == "floor") {
							//input data from database to table
							var dbRef1 = firebase.database().ref().child("property/residential/building_no:"+buildno+"/"+snapshot.key);
							dbRef1.on('child_added', function(snapshot) {
								var roomid = snapshot.key.split(":")[1];
								var broke = roomid.split("");
								var floornumb = broke[3]+broke[4];
								var roomnumb = broke[5]+broke[6];
								var price = snapshot.child("yearprice").val();
								var availdate = snapshot.child("availdate").val();
								var bondmoney = (Math.round(((parseInt(price) / 12).toFixed(2))/100))*100;
								var bed = snapshot.child("facilities/bed").val();
								var wardrb = snapshot.child("facilities/wardrb").val();
								var tble = snapshot.child("facilities/table").val();
								var bthins = snapshot.child("facilities/bthins").val();
								var wifi = snapshot.child("facilities/wifi").val();
								var ctv = snapshot.child("facilities/ctv").val();
								var hwater = snapshot.child("facilities/hwater").val();
								var pwrtkn = snapshot.child("facilities/pwrtkn").val();
								var laundy = snapshot.child("facilities/laundy").val();
								var ac = snapshot.child("facilities/ac").val();
								var parker = snapshot.child("facilities/parker").val();
								var bedcvr = snapshot.child("facilities/bedcvr").val();
								var secury = snapshot.child("facilities/secury").val();
								var kitchn = snapshot.child("facilities/kitchn").val();
								if (bed == true) {
									bed = "<img src='img/icons/bed.svg' width='16px' title='Tempat Tidur'>";
								} else {
									bed = "";
								}
								if (wardrb == true) {
									wardrb = "<img src='img/icons/wardrobe.svg' width='16px' title='Lemari'>";
								} else {
									wardrb = "";
								}
								if (tble == true) {
									tble = "<img src='img/icons/table.svg' width='16px' title='Meja'>";
								} else {
									tble = "";
								}
								if (bthins == true) {
									bthins = "<img src='img/icons/bathtub.svg' width='16px' title='Kamar Mandi Dalam'>";
								} else {
									bthins = "";
								}
								if (wifi == true) {
									wifi = "<img src='img/icons/wifi.svg' width='16px' title='Wi-Fi'>";
								} else {
									wifi = "";
								}
								if (ctv == true) {
									ctv = "<img src='img/icons/tv.svg' width='16px' title='TV Kabel'>";
								} else {
									ctv = "";
								}
								if (hwater == true) {
									hwater = "<img src='img/icons/hotwater.svg' width='16px' title='Air Panas'>";
								} else {
									hwater = "";
								}
								if (parker == true) {
									parker = "<img src='img/icons/parking.svg' width='16px' title='Parkir'>";
								} else {
									parker = "";
								}
								if (laundy == true) {
									laundy = "<img src='img/icons/laundry.svg' width='16px' title='Laundry'>";
								} else {
									laundy = "";
								}
								if (pwrtkn == true) {
									pwrtkn = "<img src='img/icons/power.svg' width='16px' title='Listrik Token'>";
								} else {
									pwrtkn = "";
								}
								if (ac == true) {
									ac = "<img src='img/icons/ac.svg' width='16px' title='AC'>";
								} else {
									ac = "";
								}
								if (bedcvr == true) {
									bedcvr = "<img src='img/icons/bedcover.svg' width='16px' title='Bed Cover + Sprei'>";
								} else {
									bedcvr = "";
								}
								if (secury == true) {
									secury = "<img src='img/icons/security.svg' width='16px' title='24-Hour Security'>";
								} else {
									secury = "";
								}
								if (kitchn == true) {
									kitchn = "<img src='img/icons/kitchen.svg' width='16px' title='Dapur Bersama'>";
								} else {
									kitchn = "";
								}
								facilities = bed+" "+wardrb+" "+tble+" "+bthins+" "+wifi+" "+ctv+" "+hwater+" "+parker+" "+laundy+" "+pwrtkn+" "+ac+" "+bedcvr+" "+secury+" "+kitchn;
								table.row.add([floornumb,"<a id='"+roomid+"' href='javaScript:void(0);' onclick='editRoom("+roomid+")'>"+roomnumb+"</a>",facilities,price,bondmoney,availdate,"<button id='addbutt' class='btn btn-xs btn-info' title='Add Tenant'><i class='fa fa-user-plus'></i></button> <button id='roomhstry' class='btn btn-xs btn-black' title='Room History' onclick='roomHist("+roomid+")'><i class='fa fa-file-text-o'></i></button> <button id='editbutt' class='btn btn-xs btn-warning' title='Edit Room' onclick='editRoom("+roomid+")'><i class='fa fa-pencil'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Remove Room' onclick='removeRoom("+roomid+")'><i class='fa fa-times'></i></button>"]).node().id = 'f'+floornumb+'r'+roomnumb;
								table.draw(false);
								if (parseInt(floornumb)%2 == 1) {
									$('#f'+floornumb+'r'+roomnumb).css("background-color","#D6F6FF");
								} else {
									$('#f'+floornumb+'r'+roomnumb).css("background-color","#FCFCFC");
								}
								//stop loading icon
								$("#cover-spin").fadeOut(250, function() {
									$(this).hide();
								})
							})
							//replace data when a change is detected
							dbRef1.on('child_changed', function(snapshot) {
								var roomid = snapshot.key.split(":")[1];
								var broke = roomid.split("");
								var floornumb = broke[3]+broke[4];
								var roomnumb = broke[5]+broke[6];
								var row = table.row('#f'+floornumb+'r'+roomnumb);
								row.remove();
								var price = snapshot.child("yearprice").val();
								var availdate = snapshot.child("availdate").val();
								var bondmoney = (Math.round(((parseInt(price) / 12).toFixed(2))/100))*100;
								var bed = snapshot.child("facilities/bed").val();
								var wardrb = snapshot.child("facilities/wardrb").val();
								var tble = snapshot.child("facilities/table").val();
								var bthins = snapshot.child("facilities/bthins").val();
								var wifi = snapshot.child("facilities/wifi").val();
								var ctv = snapshot.child("facilities/ctv").val();
								var hwater = snapshot.child("facilities/hwater").val();
								var pwrtkn = snapshot.child("facilities/pwrtkn").val();
								var laundy = snapshot.child("facilities/laundy").val();
								var ac = snapshot.child("facilities/ac").val();
								var parker = snapshot.child("facilities/parker").val();
								var bedcvr = snapshot.child("facilities/bedcvr").val();
								var secury = snapshot.child("facilities/secury").val();
								var kitchn = snapshot.child("facilities/kitchn").val();
								if (bed == true) {
									bed = "<img src='img/icons/bed.svg' width='16px' title='Tempat Tidur'>";
								} else {
									bed = "";
								}
								if (wardrb == true) {
									wardrb = "<img src='img/icons/wardrobe.svg' width='16px' title='Lemari'>";
								} else {
									wardrb = "";
								}
								if (tble == true) {
									tble = "<img src='img/icons/table.svg' width='16px' title='Meja'>";
								} else {
									tble = "";
								}
								if (bthins == true) {
									bthins = "<img src='img/icons/bathtub.svg' width='16px' title='Kamar Mandi Dalam'>";
								} else {
									bthins = "";
								}
								if (wifi == true) {
									wifi = "<img src='img/icons/wifi.svg' width='16px' title='Wi-Fi'>";
								} else {
									wifi = "";
								}
								if (ctv == true) {
									ctv = "<img src='img/icons/tv.svg' width='16px' title='TV Kabel'>";
								} else {
									ctv = "";
								}
								if (hwater == true) {
									hwater = "<img src='img/icons/hotwater.svg' width='16px' title='Air Panas'>";
								} else {
									hwater = "";
								}
								if (parker == true) {
									parker = "<img src='img/icons/parking.svg' width='16px' title='Parkir'>";
								} else {
									parker = "";
								}
								if (laundy == true) {
									laundy = "<img src='img/icons/laundry.svg' width='16px' title='Laundry'>";
								} else {
									laundy = "";
								}
								if (pwrtkn == true) {
									pwrtkn = "<img src='img/icons/power.svg' width='16px' title='Listrik Token'>";
								} else {
									pwrtkn = "";
								}
								if (ac == true) {
									ac = "<img src='img/icons/ac.svg' width='16px' title='AC'>";
								} else {
									ac = "";
								}
								if (bedcvr == true) {
									bedcvr = "<img src='img/icons/bedcover.svg' width='16px' title='Bed Cover + Sprei'>";
								} else {
									bedcvr = "";
								}
								if (secury == true) {
									secury = "<img src='img/icons/security.svg' width='16px' title='24-Hour Security'>";
								} else {
									secury = "";
								}
								if (kitchn == true) {
									kitchn = "<img src='img/icons/kitchen.svg' width='16px' title='Dapur Bersama'>";
								} else {
									kitchn = "";
								}
								facilities = bed+" "+wardrb+" "+tble+" "+bthins+" "+wifi+" "+ctv+" "+hwater+" "+parker+" "+laundy+" "+pwrtkn+" "+ac+" "+bedcvr+" "+secury+" "+kitchn;
								table.row.add([floornumb,"<a id='"+roomid+"' href='javaScript:void(0);' onclick='editRoom("+roomid+")'>"+roomnumb+"</a>",facilities,price,bondmoney,availdate,"<button id='addbutt' class='btn btn-xs btn-info' title='Add Tenant'><i class='fa fa-user-plus'></i></button> <button id='roomhstry' class='btn btn-xs btn-black' title='Room History'><i class='fa fa-file-text-o'></i></button> <button id='editbutt' class='btn btn-xs btn-warning' title='Edit Room' onclick='editRoom("+roomid+")'><i class='fa fa-pencil'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Remove Room' onclick='removeRoom("+roomid+")'><i class='fa fa-times'></i></button>"]).node().id = 'f'+floornumb+'r'+roomnumb;
								table.draw(false);
								if (parseInt(floornumb)%2 == 1) {
									$('#f'+floornumb+'r'+roomnumb).css("background-color","#D6F6FF");
								} else {
									$('#f'+floornumb+'r'+roomnumb).css("background-color","#FCFCFC");
								}
							})
							//remove row when deleted
							dbRef1.on('child_removed', function(snapshot) {
								var roomid = snapshot.key.split(":")[1];
								var broke = roomid.split("");
								var floornumb = broke[3]+broke[4];
								var roomnumb = broke[5]+broke[6];
								var row = table.row('#f'+floornumb+'r'+roomnumb);
								row.remove();
								table.draw(false);
							})
							
						}
					})
				}
			})
			//tab expense
			table5.clear();
			table5.draw();
		}
	})
	//fill array with data from database
	const dbRefBuild = firebase.database().ref("property/residential");
	dbRefBuild.on('child_added', function(snapshot) {
		var build_numb = snapshot.key.split(":")[1];
		var ad_st = snapshot.child("address_street").val();
		var ad_ct = snapshot.child("address_city").val();
		var ad_pv = snapshot.child("address_province").val();
		var ad_zp = snapshot.child("address_zipcode").val();
		var arraydata = {
			label: ad_st+", "+ad_ct+", "+ad_pv+" "+ad_zp,
			buildid: build_numb,
			address1: ad_st,
			address2: ad_ct,
			address3: ad_pv,
			address4: ad_zp
		};
		buildList.push(arraydata);
		//sort array ascending based on address
		buildList.sort(function(a, b){
			var nameA=a.label.toLowerCase(), nameB=b.label.toLowerCase();
			if (nameA < nameB) //sort string ascending
				return -1;
			if (nameA > nameB)
				return 1;
			return 0; //default return value (no sorting)
		});
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			//collect id from link
			var refBuild = window.location.href.split('=');
			if (refBuild[1] == undefined) {
				//no building number defined
				document.getElementById('buildNo').value = "1";
				$("#buildNo").trigger(jQuery.Event('keyup', {which: 13}));
			} else if (refBuild[1] != "undefined") {
				//building number defined
				document.getElementById('buildNo').value = parseInt(refBuild[1]);
				$("#buildNo").trigger(jQuery.Event('keyup', {which: 13}));
			}
			$(this).hide();
		})
	});
	//start property address autocomplete
	$("#propaddr_s").autocomplete({
		source: function(request, response) {
			var results = $.ui.autocomplete.filter(buildList, request.term);
			response(results.slice(0, 8));
		},
		select: function(event, ui) {
			$("#buildnumber").val(ui.item.buildid);
			$("#propnumb").html("(Building "+ui.item.buildid+")");
			$("#propaddr_st").html(ui.item.address1);
			$("#propaddr_ct").html(ui.item.address2+",");
			$("#propaddr_pv").html(ui.item.address3+",");
			$("#propaddr_zp").html(ui.item.address4);
			$("#buildNo").val(ui.item.buildid);
			$("#buildNo").trigger(jQuery.Event('keyup', {which: 13}));
		}
	})
	
	
	//price listener
	$('#data-table1 tbody').on('dblclick', '.cptprice', function () {
		//get row data
		var row = table.row($(this).parents('tr'));
        var data = row.data();
		//prompt to insert value
		var prompter = prompt("Change value (Rp.)", data[3]);
		//when prompt is ok
		if (prompter != null) {
			//variables for reference
			var buildno = $("#buildNo").val();
			for(j=1; j<=9; j++) {
				if (buildno==String(j)) {
					buildno="0"+String(j);
				}
			}
			var floorno = data[0];
			var roomno = data[1];
			var id = "1"+buildno+floorno+roomno;
			var roundPrice = (Math.round((parseInt(prompter)/100)))*100;
			var dbRef = firebase.database().ref().child("property/residential/building_no:"+buildno+"/floor:"+floorno+"/ID:"+id);
			//update price to database
			dbRef.update({
				yearprice : roundPrice
			}).catch(function onError(err) {
				window.alert("Error "+err.code+" : "+err.message);
			})
		}
	})
	//add tenant listener
	$('#data-table1 tbody').on('click', '#addbutt', function () {
		var row = table.row($(this).parents('tr'));
        var data = row.data();

		var roomID = data[1].split("id='")[1].split("'")[0];
		var availDate = data[5];
		if (availDate != "empty") {
			window.location = "tenant_add.html?id="+roomID;
		} else {
			alert("Please provide a valid available date for the room.");
		}
	})
	
	// redirect from buildList
	var link_ = window.location.href.split('#')[1];
	if (link_=="tenanti"){
		$("#tenanti").addClass("in active")
		$("#roomi").removeClass("in active")
		$("#expensei").removeClass("in active")
		$("#tabroomi").removeClass("active")
		$("#tabexpensei").removeClass("active")
		$("#tabtenanti").addClass("active")
	}
	
	//collect id from link
	var refBuild = window.location.href.split('=');
	if (refBuild[1] == undefined) {
		//no building number defined
		document.getElementById('buildNo').value = "1";
		$("#buildNo").trigger(jQuery.Event('keyup', {which: 13}));
	} else if (refBuild[1] != "undefined") {
		//building number defined
		document.getElementById('buildNo').value = parseInt(refBuild[1]);
		$("#buildNo").trigger(jQuery.Event('keyup', {which: 13}));
	}
	
})