//Booking list
var table1 = $('#booking-list').DataTable({
	"aLengthMenu": [[3, 6, -1], [3, 6, "All"]],
	"iDisplayLength": 3,
	"order": [],
	"columnDefs": [
	{
		targets: -1,
		orderable:false
	},
	{
		targets: 0,
		width: "10%",
		orderable:false
	},
	{
		targets: 1,
		className: 'dt-body-left'
	}
	]
})	

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



function addInvoice() {
	
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
		paymentRef.once('value', function(snapshot){
			var prevBalance = parseInt(snapshot.child("balance").val())
			
				paymentRef.update({
					"balance": (prevBalance - invoiceAmount).toString()
				})
			
		
		})
		paymentRef.push({
			"date":invoiceDate,
			"desc":invoiceDetailsFull,
			"invoice":invoiceAmount,
			"payment":null,
			"refnumber":refNumberHtml,
			"list":"ledgerList"
		});
		
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
var bondList = [];
var ledgerList = [];
var bondWaitDue = 0;
var historyperiod = 1;

function addPayment() {
	// get id , refnum
	var refNumberHtml = $("#paymentTenantRef").val();
	var id = $("#paymentTenantID").val();
	//init firebase
	paymentRef = firebase.database().ref().child("payment/"+id);
	//collect data from payment form
	var paymentDate = reformatDate2($("#paymentDate").val());
	var paymentAmount = parseInt($("#paymentAmountCond").val()+rem_moneydot($("#paymentAmount").val()));
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
	
	paymentRef.once('value', function(snapshot){
		if (snapshot.child("balance").val()==null){
			var trRef1 = firebase.database().ref().child("tenant-room/"+id);
			trRef1.once('child_added', function(snapshot) {
				var bondPrice=snapshot.child("rent_bond").val();
				var rent = snapshot.child("rent_price").val()
				
				paymentRef.set({
					"balance": (paymentAmount-bondPrice-rent).toString()
				})
			
			
			})
		}
		else{
		prevBalance = parseInt(snapshot.child("balance").val())
			console.log("in")
			paymentRef.update({
				"balance": (prevBalance + paymentAmount).toString()
			})
		
		}
	})
	

	//start set payment
	var trRef1 = firebase.database().ref().child("tenant-room/"+id);
	trRef1.once('child_added', function(snapshot) {
		//mengambil bond price
		var bondPrice=snapshot.child("rent_bond").val();
		
		paymentRef.once('value', function(snapshot) {
			//mengambil bondWaitDue
			var bondWaitDue=snapshot.child("bondWaitDue").val();
			//jika belum selesai pembayaran bondwaitdue
			if (bondWaitDue==null){
				bondWaitDue = bondPrice;
			} else {
				bondWaitDue = bondWaitDue;
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
						//set bond wait due
						paymentRef.update({
							"bondWaitDue" : bondWaitDue
						});
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
					//set bond wait due
					paymentRef.update({
						"bondWaitDue" : bondWaitDue
					});
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
							//set bond wait due
							paymentRef.update({
								"bondWaitDue" : bondWaitDue
							});
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
						//set bond wait due
						paymentRef.update({
							"bondWaitDue" : bondWaitDue
						});
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
							//set bond wait due
							paymentRef.update({
								"bondWaitDue" : bondWaitDue
							});
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
						//set bond wait due
						paymentRef.update({
							"bondWaitDue" : bondWaitDue
						});
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
							//set bond wait due
							paymentRef.update({
								"bondWaitDue" : bondWaitDue
							});
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
						//set bond wait due
						paymentRef.update({
							"bondWaitDue" : bondWaitDue
						});
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
			setTimeout(function(){
				window.location='tenant_details.html?id='+id+"#ledger";
			}, 1000);
		});
	});
}

//approve booking in table
function approveBooking(refNumber){
	$('#approveM').html("Are you sure to approve "+refNumber+" ?");
	$('#approveM').val(refNumber);
	$("#approveModal").modal();
}

//delete booking in table
function deleteBooking(refNumber){
	$('#approveD').html("Are you sure delete "+refNumber+" ?");
	$('#approveD').val(refNumber);
	$("#rApproveModal").modal();
}

//sort list by status approve or booking
function sortByStatOccupy(listApproveT){
	newArray=[]
	
	//jika statusnya booking
	for (i=0;i<listApproveT.length;i++) {
		if (listApproveT[i].statOccupy=="booking"){
			newObj = {
				"statOccupy":listApproveT[i].statOccupy,
				"refNum":listApproveT[i].refNum,
				"content":listApproveT[i].content,
				"tenant_id":listApproveT[i].tenant_id
			}
			newArray.push(newObj);
		}
	}
		
	//jika statusnya approved
	for (i=0;i<listApproveT.length;i++) {
		if (listApproveT[i].statOccupy=="approved"){
			newObj = {
				"statOccupy":listApproveT[i].statOccupy,
				"refNum":listApproveT[i].refNum,
				"content":listApproveT[i].content,
				"tenant_id":listApproveT[i].tenant_id
			}
			newArray.push(newObj);
		}
	}
	return newArray
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

//menjumlahkan hari dengan tanggal yang diminta
function sumDate(hari,date){
	var intend = parseInt(hari);
	//set date yang ditentukan
	var someDate = new Date(date);
	//menjumlahkan tanggal
	someDate.setDate(someDate.getDate() + intend); 
	newDate = String(someDate).split(" ")
	var endMonth = newDate[1];
	var endDay = newDate[2];
	var endYear = newDate[3];

	var endDate = endDay+"-"+endMonth+"-"+endYear;

	return endDate;
}

//send email from key collection
function mailTenantKey(tenantID,roomID){
	//start loading icon
	$("#cover-spin").fadeIn(250, function() {
		$(this).removeClass("hide");
	})
	/*
	//get tenant mail from firebase
	trRef1=firebase.database().ref().child("tenant-room/"+tenantID);
	trRef1.on('child_added', function(snapshot) {
		//get starting date , status occupy , ref id , alamat
		var propAddr=snapshot.child("prop_addr").val();
		var statingDate=snapshot.child("start_date").val();
		var statOccupy=snapshot.child("stat_occupy").val();
		// mengambil data tenant yang status nya approved atau active
		if ((statOccupy=="approved") ||(statOccupy=="active")){
			var getEmail = firebase.database().ref().child("tenant/"+tenantID);
			getEmail.once('value', function(snapshot) {
				// membaca target , subject , pesan, no kamar
				var to=snapshot.child("email").val();
				var name=snapshot.child("full_name").val();
				var noKamar = String(roomID.charAt(5))+String(roomID.charAt(6));
				var noLantai = String(roomID.charAt(3))+String(roomID.charAt(4));
				var idKamar = String(roomID.charAt(1))+String(roomID.charAt(2));
				var subject = "Remainder Pengambilan Kunci"
				var message = "Selamat datang "+name+",\n\nPesanan saudara/i pada :<br>Alamat : "+propAddr+"<br>Lantai : "+noLantai+"<br>No. Kamar : "+noKamar+"\n\ntelah kami terima, silahkan melakukan pengambilan kunci kamar pada tanggal "+reformatDate(statingDate)+". Untuk pengambilan kunci pada tanggal lain bisa langsung datang ke kantor NSP pada : <br>"+"Senin-Jumat : 08:00-17:00<br>Sabtu : 08:00-12:00\n\n\nCP: 08xxxx";

				//set to firebase
				var sendEmail = firebase.database().ref().child("sendEmail");
				sendEmail.set({
					'subject' : subject,
					'to' : to,
					'message' : message,
				});
				//membangunkan heroku
				var xhr0 = new XMLHttpRequest();
				xhr0.open('GET', "https://sendemailgokost.herokuapp.com/", true);
				xhr0.send();
				xhr0.onreadystatechange = processRequest;
				 //kondisi ketika webhook selesai di buka
				function processRequest(e) {
					if (xhr0.readyState == 4) {
						//mengirim email
						var xhr = new XMLHttpRequest();
						xhr.open('GET', "https://sendemailgokost.herokuapp.com/webhook", true);
						xhr.send();
					 
						xhr.onreadystatechange = processRequest;
						 //kondisi ketika webhook selesai di buka
						function processRequest(e) {
							if (xhr.readyState == 4) {
								//stop loading
								$("#cover-spin").fadeOut(250, function() {
									$(this).hide();
								})
								
							}
						}
					}
				}
			});
		}
	});
	*/
	//stop loading
	$("#cover-spin").fadeOut(250, function() {
		$(this).hide();
	})
	return false;
}

// send email
function sendEmail(tenantID,roomID,total,propAddr1){
	//start loading icon
	$("#cover-spin").fadeIn(250, function() {
		$(this).removeClass("hide");
	})
	/*
	//get tenant mail from firebase
	var getEmail = firebase.database().ref().child("tenant/"+tenantID);
	getEmail.once('value', function(snapshot) {
		// membaca target , subject , pesan, no kamar
		var to=snapshot.child("email").val();
		var name=snapshot.child("full_name").val();
		var noKamar = String(roomID.charAt(5))+String(roomID.charAt(6));
		var noLantai = String(roomID.charAt(3))+String(roomID.charAt(4));
		var idKamar = String(roomID.charAt(1))+String(roomID.charAt(2));
		var today = new Date();
		var subject = "Selamat, pesanan anda sudah disetujui"
		var message = "Selamat datang "+name+",\n\nPesanan saudara/i pada :<br>Alamat : "+propAddr1+"<br>Lantai : "+noLantai+"<br>No. Kamar : "+noKamar+"\n\ntelah disetujui, silahkan melakukan pembayaran bond money dan rental money sebesar "+get_fmoney(total)+" ke No. Rek dibawah ini: <br>No. Rek : 323232323<br>Atas Nama : Monica\n\nPaling lambat "+sumDate(7,today)+". Jika sudah transfer , harap menghubungi no WA 08xxxxx"

		//set to firebase
		var sendEmail = firebase.database().ref().child("sendEmail");
		sendEmail.set({
			'subject' : subject,
			'to' : to,
			'message' : message,
		});
		//membangunkan heroku
		var xhr0 = new XMLHttpRequest();
		xhr0.open('GET', "https://sendemailgokost.herokuapp.com/", true);
		xhr0.send();
		xhr0.onreadystatechange = processRequest;
		 //kondisi ketika webhook selesai di buka
		function processRequest(e) {
			if (xhr0.readyState == 4) {
				//mengirim email
				var xhr = new XMLHttpRequest();
				xhr.open('GET', "https://sendemailgokost.herokuapp.com/webhook", true);
				xhr.send();
			 
				xhr.onreadystatechange = processRequest;
				 //kondisi ketika webhook selesai di buka
				function processRequest(e) {
					if (xhr.readyState == 4) {
						//stop loading
						$("#cover-spin").fadeOut(250, function() {
							$(this).hide();
						})
						
					}
				}
			}
		}
	});
	*/
	$("#cover-spin").fadeOut(250, function() {
		$(this).hide();
	})
	return false;
}

function editKeyCollectDateModal(keyDate,tenantID,tenantRef,notes) {

	$("#editKeyDateModal").modal();
	$("#keyDate").val(keyDate);
	$("#notes").val(notes);
	$("#keyTenantID").val(tenantID);
	$("#keyTenantRef").val(tenantRef);

}

function editKeyCollectDate() {

	var keyDate = $("#keyDate").val();
	var notes = $("#notes").val();
	if(notes==""){
		notes=null;
	}
	var keyTenantID = $("#keyTenantID").val();
	var keyTenantRef = $("#keyTenantRef").val().substring(0,7);
	var keyDateRef = firebase.database().ref("tenant-room/"+keyTenantID+"/"+keyTenantRef);
	keyDateRef.update({
		"key_date":keyDate,
		"notes":notes
	}).then(function onSuccess(res) {
		//success notification
		$.gritter.add({
			title: 'Key Collection Date Edited',
			text: "Key collection date successfully edited",
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		});
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		});
	}).catch(function onError(err) {
		//error notification
		$.gritter.add({
			title: 'Error Edit Key Collection Date',
			text: err.code+" : "+err.message,
			image: './img/bell.png',
			sticky: false,
			time: 3500,
			class_name: 'gritter-custom'
		});
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		});
	});

}

function shortenString(yourString,maxLength){

	//trim the string to the maximum length
	var trimmedString = yourString.substr(0, maxLength);

	return trimmedString+"..."
}
$(document).ready(function() {
	//BOOKING LIST
	//get data from database
	var trRef = firebase.database().ref("tenant-room");
	var a=1;
	var listApproveT=[];
	trRef.on('child_added', function(snapshot) {
		var tenantID = snapshot.key;
		trRef.child(tenantID).on('child_added', function(snapshot) {
			//get starting date , building address , status occupy , ref id
			var statingDate=snapshot.child("start_date").val();
			var propAddr=snapshot.child("prop_addr").val();
			var statOccupy=snapshot.child("stat_occupy").val();
			var refNumFormat = snapshot.child("ref_number").val();
			var refN=refNumFormat.split(" ");
			var refNumber=refN[0]+refN[1]+refN[2];
			propAddr = shortenString(propAddr,20);
			var tenantRef = firebase.database().ref().child("tenant/"+tenantID);
			var tenantName;
			tenantRef.once('value', function(snapshot) {
				table1.clear();
				// get name from database
				tenantName=snapshot.child("full_name").val();
				// jika status = approved
				if (statOccupy=="approved"){
					// untuk sort , datanya dimasukan ke list
					newObj = {
						"statOccupy":"approved",
						"refNum":refNumber,
						"content":[refNumFormat,"<a href='tenant_approve.html?id="+refNumber+"' class='pull-left'>"+tenantName+"</a>",statingDate,propAddr,"<button id='approve_booking"+refNumber+"' class='btn btn-xs btn-success' title='Approve' onclick=approveBooking('booking"+refNumber+"') style='background-color:#c8bca6' disabled ><i class='fa fa-check'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Delete' onclick=deleteBooking('booking"+refNumber+"')><i class='fa fa-times'></i></button>"],
						"tenant_id":tenantID
					}
					listApproveT.push(newObj);
				}
				//jika status = booking
				if(statOccupy=="booking") {
					// untuk sort , datanya dimasukan ke list
					newObj = {
						"statOccupy":"booking",
						"refNum":refNumber,
						"content":[refNumFormat,"<a href='tenant_approve.html?id="+refNumber+"' class='pull-left'>"+tenantName+"</a>",statingDate,propAddr,"<button id='approve_booking"+refNumber+"' class='btn btn-xs btn-success' title='Approve' onclick=approveBooking('booking"+refNumber+"')><i class='fa fa-check'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Delete' onclick=deleteBooking('booking"+refNumber+"')><i class='fa fa-times'></i></button>"],
						"tenant_id":tenantID
					}
					listApproveT.push(newObj);
				}
				listApproveT = sortByStatOccupy(listApproveT);
				//add hasil sort ke datatables
				for (i=0;i<listApproveT.length;i++) {
					table1.row.add(listApproveT[i].content).node().id = 'booking'+listApproveT[i].refNum;
				}
				table1.draw();
				a++
			});
		});
		trRef.child(tenantID).on('child_changed', function(snapshot) {
			//get starting date , building address , status occupy, ref id
			var statingDate=snapshot.child("start_date").val();
			var propAddr=snapshot.child("prop_addr").val();
			propAddr = shortenString(propAddr,20);
			var statOccupy=snapshot.child("stat_occupy").val();
			var refNumFormat = snapshot.child("ref_number").val();
			var refN=refNumFormat.split(" ");
			var refNumber=refN[0]+refN[1]+refN[2];
			var tenantRef = firebase.database().ref().child("tenant/"+tenantID);
			var tenantName;
			tenantRef.once('value', function(snapshot) {
				table1.clear();
				// get name from database
				tenantName=snapshot.child("full_name").val();
				// remove row changed
				var row = table1.row('#booking'+refNumber);
				row.remove();
				// update occupy pada list
				
				// jika status = approved
				if (statOccupy=="approved"){
					for (i=0;i<listApproveT.length;i++){
						if(listApproveT[i].refNum==refNumber){
							newObj = {
								"statOccupy":statOccupy,
								"refNum":refNumber,
								"content":[listApproveT[i].content[0],tenantName,statingDate,propAddr,"<button id='approve_booking"+refNumber+"' class='btn btn-xs btn-success' title='Approve' onclick=approveBooking('booking"+refNumber+"') style='background-color:#c8bca6' disabled ><i class='fa fa-check'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Delete' onclick=deleteBooking('booking"+refNumber+"')><i class='fa fa-times'></i></button>"],
								"tenant_id":tenantID
							}
							listApproveT[i]=newObj;
							break
						}
					}
				}
				//jika status = booking
				if(statOccupy=="booking") {
					for (i=0;i<listApproveT.length;i++){
						if(listApproveT[i].refNum==refNumber){
							newObj = {
								"statOccupy":statOccupy,
								"refNum":refNumber,
								"content":[listApproveT[i].content[0],tenantName,statingDate,propAddr,"<button id='approve_booking"+refNumber+"' class='btn btn-xs btn-success' title='Approve' onclick=approveBooking('booking"+refNumber+"')><i class='fa fa-check'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Delete' onclick=deleteBooking('booking"+refNumber+"')><i class='fa fa-times'></i></button>"],
								"tenant_id":tenantID
							}
							listApproveT[i]=newObj;
							break
						}
					}
				}
				//sorting
				listApproveT = sortByStatOccupy(listApproveT);
				//add hasil sort ke datatables
				for (i=0;i<listApproveT.length;i++) {
					table1.row.add(listApproveT[i].content).node().id = 'booking'+listApproveT[i].refNum;
				}
				table1.draw();
				
			});
		});
		trRef.child(tenantID).on('child_removed', function(snapshot) {
			//get ref ID
			var refN=snapshot.child("ref_number").val().split(" ");
			var refNumber=refN[0]+refN[1]+refN[2];
			// remove row changed
			var row = table1.row('#booking'+refNumber);
			row.remove();
		});
	});
	
	//key list
	var table6 = $('#keyC-list').DataTable({
		"aLengthMenu": [[3, 6, -1], [3, 6, "All"]],
		"iDisplayLength": 3,
		"order": [],
		"columnDefs": [
		{
			targets: 0,
			width: "20%"
		},
		{
			targets: -1,
			width: "10%"
		},
		]
	})
	
	// mengambil data yang approved atau occupy dari firebase ke dalam list
	var trRef = firebase.database().ref().child("payment");
	trRef.on('child_added', function(snapshot) {
		var tenantID = snapshot.key;
		trRef1 = firebase.database().ref().child("tenant-room/"+tenantID);
		trRef1.on('child_added', function(snapshot) {
			//get starting date , status occupy , ref id , alamat
			var propAddr = snapshot.child("prop_addr").val();
			var statingDate = snapshot.child("start_date").val();
			var keyDate = snapshot.child("key_date").val();
			var statOccupy = snapshot.child("stat_occupy").val();
			var refN = snapshot.child("ref_number").val();
			var note = snapshot.child("notes").val();
			var noteIcon=""
			var note1=""
			if(note==null){
				note1=""
				noteIcon=""
			} else {
				note=note.replace("\n", " ");
				note1=note
				noteIcon = "<button class='btn btn-xs btn-danger tip' data-position='top-center' data-tip='"+note+"'>"+"<i class='fa fa-comments-o'></i>"+"</button>"
			}
			var refN1= refN.split(" ");
			var refNumber = refN1[0]+refN1[1]+refN1[2];
			if ((statOccupy=="approved") ||(statOccupy=="active")){
				trRef2=firebase.database().ref().child("tenant/"+tenantID);
				trRef2.once('value', function(snapshot) {
					var name = snapshot.child("full_name").val();
					table6.row.add(["<a href='tenant_details.html?id="+tenantID+"' class='pull-left'>"+name+"</a>",refN,statingDate,"<a href='#' ondblclick='editKeyCollectDateModal(\""+keyDate+"\",\""+tenantID+"\",\""+refNumber+"\",\""+note1+"\")'>"+keyDate+" "+noteIcon+"</a>","<button class='btn btn-xs btn-success' title='Mail Tenant' onclick=mailTenantKey('"+tenantID+"','"+refNumber+"')><i class='fa fa-envelope'></i></button> <button class='btn btn-xs btn-primary' title='Collected' onclick=collectedKey('"+tenantID+"','"+refNumber+"')><i class='fa fa-check'></i></button>"]).node().id = "key"+tenantID;
					table6.draw();
					$(".tip").tip();
				});
			}
		});
		trRef1.on('child_changed', function(snapshot) {
			var row = table6.row('#key'+tenantID);
			row.remove();
			var statingDate = snapshot.child("start_date").val();
			var keyDate = snapshot.child("key_date").val();
			var statOccupy = snapshot.child("stat_occupy").val();
			var refN = snapshot.child("ref_number").val();
			var note = snapshot.child("notes").val();
			var noteIcon=""
			var note1=""
			if(note==null){
				note1=""
				noteIcon=""
			} else {
				note=note.replace("\n", " ");
				note1=note
				noteIcon = "<button class='btn btn-xs btn-danger tip' data-position='top-center' data-tip='"+note+"'>"+"<i class='fa fa-comments-o'></i>"+"</button>"
			}
			var refN1= refN.split(" ");
			var refNumber = refN1[0]+refN1[1]+refN1[2];
			if ((statOccupy=="approved") ||(statOccupy=="active")){
				trRef2=firebase.database().ref().child("tenant/"+tenantID);
				trRef2.once('value', function(snapshot) {
					var name = snapshot.child("full_name").val();
					table6.row.add(["<a href='javaScript:void(0)' class='pull-left'>"+name+"</a>",refN,statingDate,"<a href='#' ondblclick='editKeyCollectDateModal(\""+keyDate+"\",\""+tenantID+"\",\""+refNumber+"\",\""+note1+"\")'>"+keyDate+" "+noteIcon+"</a>","<button class='btn btn-xs btn-success' title='Mail Tenant' onclick=mailTenantKey('"+tenantID+"','"+refNumber+"')><i class='fa fa-envelope'></i></button> <button class='btn btn-xs btn-primary' title='Collected' onclick=collectedKey('"+tenantID+"','"+refNumber+"')><i class='fa fa-check'></i></button>"]).node().id = "key"+tenantID;
					table6.draw();
					$(".tip").tip();
				});
			}
		});
	});
	
	
	
	//overdue
	var table2 = $('#overdue-list').DataTable({
		"aLengthMenu": [[3, 6, -1], [3, 6, "All"]],
		"iDisplayLength": 3,
		"order": [[ 2, "asc" ]],
		"columnDefs": [
		{
			targets: 0,
			width: "30%"
		},
		]
	})
	
	// mengambil data yang approved atau occupy dari firebase ke dalam list
	var overdueRef = firebase.database().ref().child("payment");
	overdueRef.on('child_added', function(snapshot) {
		var balance = snapshot.child("balance").val();
		
		//validasi jika balance balance !=0
		if (balance>0){
			var tenantID = snapshot.key;
			overdueRef1 = firebase.database().ref().child("tenant-room/"+tenantID);
			// child added
			overdueRef1.on('child_added', function(snapshot) {
				//ref id
				var refN = snapshot.child("ref_number").val();
				var statOccupy = snapshot.child("stat_occupy").val();
				if ((statOccupy=="approved") ||(statOccupy=="active")){
					overdueRef2=firebase.database().ref().child("tenant/"+tenantID);
					overdueRef2.once('value', function(snapshot) {
						var name = snapshot.child("full_name").val();
						table2.row.add(["<a href='tenant_details.html?id="+tenantID+"'>"+name+"</a>",refN,"12/17/2018"]).node().id = 'over'+tenantID;
						table2.draw();
					});
				}
			});
			// child changed
			overdueRef1.on('child_changed', function(snapshot) {
				var row = table2.row('#over'+tenantID);
				row.remove();
				//ref id
				var refN = snapshot.child("ref_number").val();
				var statOccupy = snapshot.child("stat_occupy").val();
				if ((statOccupy=="approved") ||(statOccupy=="active")){
					overdueRef2=firebase.database().ref().child("tenant/"+tenantID);
					overdueRef2.once('value', function(snapshot) {
						var name = snapshot.child("full_name").val();
						table2.row.add(["<a href='tenant_details.html?id="+tenantID+"'>"+name+"</a>",refN,"12/17/2018"]).node().id = 'over'+tenantID;
						table2.draw();
					});
				}
			});
		}
	});
	
	//almost expired
	var table3 = $('#aexpired-list').DataTable({
		"aLengthMenu": [[3, 6, -1], [3, 6, "All"]],
		"iDisplayLength": 3,
		"order": [[ 2, "desc" ]],
		"columnDefs": [
		{
			targets: 0,
			width: "30%"
		},
		]
	})
	
	table3.row.add(["<a href='javaScript:void(0)'>Bea Curran</a>","101 010 100","9/20/2018"]).node().id = 'almost1';
	table3.row.add(["<a href='javaScript:void(0)'>Briana Holloway</a>","101 010 200","9/28/2018"]).node().id = 'almost2';
	table3.draw();
	
	//imcomplete tenant
	var table4 = $('#incomplete-list').DataTable({
		"aLengthMenu": [[3, 6, -1], [3, 6, "All"]],
		"iDisplayLength": 3,
		"order": [[ 0, "asc" ]],
		"columnDefs": [
		{
			targets: 0,
			width: "30%"
		},
		]
	})
	
	table4.row.add(["<a href='javaScript:void(0)'>Aleksandra Hyde</a>","101 010 500","Photo ID"]).node().id = 'incomplete1';
	table4.row.add(["<a href='javaScript:void(0)'>Bea Curran</a>","101 010 100","Photo KK"]).node().id = 'incmplete2';
	table4.draw();

	//array for search bar autocomplete
	var tenantNames = [];
	
	
	// mengambil data yang approved atau occupy dari firebase ke dalam list
	var trRef = firebase.database().ref().child("tenant-room");
	trRef.on('child_added', function(snapshot) {
		var tenantID = snapshot.key;
		trRef1=trRef.child(snapshot.key);
		trRef1.on('child_added', function(snapshot) {
			//get starting date , building address , status occupy , ref id
			var statingDate=snapshot.child("start_date").val();
			var propAddr=snapshot.child("prop_addr").val();
			var statOccupy=snapshot.child("stat_occupy").val();
			var refN = snapshot.child("ref_number").val();
			var refN1= refN.split(" ");
			var refNumber=refN1[0]+refN1[1]+refN1[2];
			// mengambil data tenant yang status nya approved atau active
			if ((statOccupy=="approved") ||(statOccupy=="active")){
				var tenantRef = firebase.database().ref().child("tenant/"+tenantID);
				tenantRef.once('value', function(snapshot) {
					var full_name=snapshot.child("full_name").val();
					newObj = {
						"label":full_name +' ('+refN+')',
						"tenantid":tenantID,
						"refnumber":refNumber
					}
					tenantNames.push(newObj);
					//start invoice tenant autocomplete
					$("#invoiceTenantName").autocomplete({
						source: function(request, response) {
							var results = $.ui.autocomplete.filter(tenantNames, request.term);
							response(results.slice(0, 10));
						},
						select: function(event, ui) {
							$("#invoiceTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
							$("#invoiceTenantID").val(ui.item.tenantid);
							$("#invoiceTenantRef").val(ui.item.refnumber);
							return false;
						}
					});
					//start payment tenant autocomplete
					$("#paymentTenantName").autocomplete({
						source: function(request, response) {
							var results = $.ui.autocomplete.filter(tenantNames, request.term);
							response(results.slice(0, 10));
						},
						select: function(event, ui) {
							$("#paymentTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
							$("#paymentTenantID").val(ui.item.tenantid);
							$("#paymentTenantRef").val(ui.item.refnumber);
							return false;
						}
					});
				});
			}
		});
	});
	trRef.on('child_changed', function(snapshot) {
		var tenantID = snapshot.key;
		trRef1=trRef.child(snapshot.key);
		trRef1.on('value', function(snapshot) {
			//get starting date , building address , status occupy , ref id
			var statingDate=snapshot.child("start_date").val();
			var propAddr=snapshot.child("prop_addr").val();
			var statOccupy=snapshot.child("stat_occupy").val();
			var refN = snapshot.child("ref_number").val();
			var refN1= refN.split(" ");
			var refNumber=refN1[0]+refN[1]+refN[2];
			// mengambil data tenant yang status nya approved atau active
			if ((statOccupy=="approved") ||(statOccupy=="active")){
				var tenantRef = firebase.database().ref().child("tenant/"+tenantID);
				tenantRef.once('value', function(snapshot) {
					var full_name=snapshot.child("full_name").val();
					var i=0;
					// pengechekan apakah data yang berubah sudah ada di list
					for (;i<tenantNames.length;i++){
						if(tenantNames[i].refnumber==refNumber){
							newObj = {
								"label":full_name +' ('+refN+')',
								"tenantid":tenantID,
								"refnumber":refNumber
							}
							tenantNames[i]=newObj;
							break
						}
					}
					// jika memang data yang berubah belum ada didalam list
					if (i==tenantNames.length){
						newObj = {
							"label":full_name +' ('+refN+')',
							"tenantid":tenantID,
							"refnumber":refNumber
						}
						tenantNames.push(newObj);
						
					}
					//start invoice tenant autocomplete
					$("#invoiceTenantName").autocomplete({
						source: function(request, response) {
							var results = $.ui.autocomplete.filter(tenantNames, request.term);
							response(results.slice(0, 10));
						},
						select: function(event, ui) {
							$("#invoiceTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
							$("#invoiceTenantID").val(ui.item.tenantid);
							$("#invoiceTenantRef").val(ui.item.refnumber);
							return false;
						}
					});
					//start payment tenant autocomplete
					$("#paymentTenantName").autocomplete({
						source: function(request, response) {
							var results = $.ui.autocomplete.filter(tenantNames, request.term);
							response(results.slice(0, 10));
						},
						select: function(event, ui) {
							$("#paymentTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
							$("#paymentTenantID").val(ui.item.tenantid);
							$("#paymentTenantRef").val(ui.item.refnumber);
							return false;
						}
					});
				});
			} else {
				// jika status sudah bukan approved atau active
				for (i=0;i<tenantNames.length;i++){
					if(tenantNames[i].refnumber==refNumber){
						tenantNames.splice(i,1);
						//start invoice tenant autocomplete
						$("#invoiceTenantName").autocomplete({
							source: function(request, response) {
								var results = $.ui.autocomplete.filter(tenantNames, request.term);
								response(results.slice(0, 10));
							},
							select: function(event, ui) {
								$("#invoiceTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
								$("#invoiceTenantID").val(ui.item.tenantid);
								$("#invoiceTenantRef").val(ui.item.refnumber);
								return false;
							}
						});
						//start payment tenant autocomplete
						$("#paymentTenantName").autocomplete({
							source: function(request, response) {
								var results = $.ui.autocomplete.filter(tenantNames, request.term);
								response(results.slice(0, 10));
							},
							select: function(event, ui) {
								$("#paymentTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
								$("#paymentTenantID").val(ui.item.tenantid);
								$("#paymentTenantRef").val(ui.item.refnumber);
								return false;
							}
						});
						break
					}
				}
			}
		});
	});
	
	trRef.on('child_removed', function(snapshot) {
		var tenantID = snapshot.key;
		trRef1=trRef.child(snapshot.key);
		trRef1.once('value', function(snapshot) {
			//get starting date , building address , status occupy , ref id
			var statingDate=snapshot.child("start_date").val();
			var propAddr=snapshot.child("prop_addr").val();
			var statOccupy=snapshot.child("stat_occupy").val();
			var refN = snapshot.child("ref_number").val();
			var refN1= refN.split(" ");
			var refNumber=refN1[0]+refN[1]+refN[2];
			
			// jika status sudah bukan approved atau active
			for (i=0;i<tenantNames.length;i++){
				if(tenantNames[i].refnumber==refNumber){
					tenantNames.splice(i,1);
					//start invoice tenant autocomplete
					$("#invoiceTenantName").autocomplete({
						source: function(request, response) {
							var results = $.ui.autocomplete.filter(tenantNames, request.term);
							response(results.slice(0, 10));
						},
						select: function(event, ui) {
							$("#invoiceTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
							$("#invoiceTenantID").val(ui.item.tenantid);
							$("#invoiceTenantRef").val(ui.item.refnumber);
							return false;
						}
					});
					//start payment tenant autocomplete
					$("#paymentTenantName").autocomplete({
						source: function(request, response) {
							var results = $.ui.autocomplete.filter(tenantNames, request.term);
							response(results.slice(0, 10));
						},
						select: function(event, ui) {
							$("#paymentTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
							$("#paymentTenantID").val(ui.item.tenantid);
							$("#paymentTenantRef").val(ui.item.refnumber);
							return false;
						}
					});
					break
				}
			}
		});
	});
	
	//sort array ascending based on name
	tenantNames.sort(function(a, b){
		var nameA=a.label.toLowerCase(), nameB=b.label.toLowerCase();
		if (nameA < nameB) //sort string ascending
			return -1;
		if (nameA > nameB)
			return 1;
		return 0; //default return value (no sorting)
	});
	
	//start invoice tenant autocomplete
	$("#invoiceTenantName").autocomplete({
		source: function(request, response) {
			var results = $.ui.autocomplete.filter(tenantNames, request.term);
			response(results.slice(0, 10));
		},
		select: function(event, ui) {
			$("#invoiceTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
			$("#invoiceTenantID").val(ui.item.tenantid);
			$("#invoiceTenantRef").val(ui.item.refnumber);
			return false;
		}
	});
	//start payment tenant autocomplete
	$("#paymentTenantName").autocomplete({
		source: function(request, response) {
			var results = $.ui.autocomplete.filter(tenantNames, request.term);
			response(results.slice(0, 10));
		},
		select: function(event, ui) {
			$("#paymentTenantName").val(ui.item.label.split("(")[0].slice(0,-1));
			$("#paymentTenantID").val(ui.item.tenantid);
			$("#paymentTenantRef").val(ui.item.refnumber);
			return false;
		}
	});
	//start invoice datepicker
	$('#invoiceDatePicker').datepicker({
		format: "dd-M-yy",
		autoclose: true
	})
	//start payment datepicker
	$('#paymentDatePicker').datepicker({
		format: "dd-M-yy",
		autoclose: true
	})
	
	//approve modal add listener
	$("#confirmApprove").click(function() {
		var BrefNumber = $("#approveM").val();
		// get Ref Number
		var refNumber = BrefNumber.split("booking")[1];
		// get tenant ID
		var tenantID;
		for (i=0;i<listApproveT.length;i++){
			if(listApproveT[i].refNum==refNumber){
				tenantID = listApproveT[i].tenant_id; 
				break
			}
		}
		//get room id
		var roomID=refNumber.substring(0,refNumber.length-2);
		//update data booking to approved
		var trRef = firebase.database().ref("tenant-room/"+tenantID+"/"+roomID);
		trRef.update({
			'stat_occupy':'approved'
		});
		//mengambil apply date, rent price , prop_addr
		trRef.once('value', function(snapshot) {
			var applyDate1=snapshot.child("apply_date").val();
			var rent_price1=snapshot.child("rent_price").val();
			var rent_bond1=snapshot.child("rent_bond").val();
			var total = parseInt(rent_price1)+parseInt(rent_bond1);
			var propAddr1=snapshot.child("prop_addr").val();
			// send email
			sendEmail(tenantID,roomID,total,propAddr1);
		})
	})
	
	//remove approve modal add listener
	$("#removeApprove").click(function() {
		var refNumber = $("#approveD").val();
		var row = table1.row('#'+refNumber);
		row.remove();
		table1.draw(false);
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
	//payment modal draggable
	$("#addPaymentModal").draggable({
		handle: ".modal-header"
	});
	$("#addInvoiceModal").draggable({
		handle: ".modal-header"
	});
	$("#approveModal").draggable({
		handle: ".modal-header"
	});
	$("#editKeyDateModal").draggable({
		handle: ".modal-header"
	});
	$("#rApproveModal").draggable({
		handle: ".modal-header"
	});

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
	
	//start key datepicker
	$('#keyDatePicker').datepicker({
		autoclose: true
	})
	//key date modal edit listener
	$("#editKeyDateButton").click(function() {
		$("#editKeyDateForm").submit();
	})
	//key date edit form validation
	$("#editKeyDateForm").validate({
		submitHandler: function() {
			$('#editKeyDateModal').modal('hide');
			$("#cover-spin").fadeIn(250, function() {
				$(this).show();
			});
			editKeyCollectDate();
		}
	})
	
	//stop loading icon
	setTimeout(function(){
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
	}, 1000);
	
})