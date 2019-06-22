//start loading icon
$("#loadingUserHead,#loadingSearchBlock").fadeIn(250, function() {
	$(this).removeClass("hide");
})
//firebase auth listener
firebase.auth().onAuthStateChanged(function(user) {
	//user signed in
	if (user) {
		var user = firebase.auth().currentUser;
		var email_id = user.email;
		email_id1 = email_id.split("@")[0];
		const check = firebase.database().ref("admin/"+email_id1);
		//check if user is valid
		check.on('value', function(snapshot) {
			var userstat = snapshot.child("stat").val()
			var userpriv = snapshot.child("privilege").val()
			//user deleted
			if (userstat == 0) {
				window.alert("error login : please relogin")
				var cuser = firebase.auth().currentUser;
				//delete user
				cuser.delete().then(function() {
					//remove from database
					check.remove();
					window.location = "index.html";
				}).catch(function(err) {
					console.log(err.code);
					console.log(err.message);
					window.location = "index.html";
				});
			//user active
			} else if (userstat == 1) {
				document.getElementById("nama").innerText = email_id;
				
				if (userpriv == 1) {
					$("#admManage").removeClass("hidden");
				}	
				//check if profile photo exist
				check.once('value', function(snapshot) {
					var photo = snapshot.child("profilepic").val();
					//photo exist
					if (photo != "empty") {
						//download image from storage
						var strRef = firebase.storage().ref().child('images/profile/'+photo);
						strRef.getDownloadURL().then(function(url) {
							document.getElementById("imgcircle").src = url;
						}).catch(function(err) {
							window.alert("Error "+err.code+" : "+err.message);
						})
					}
					//stop loading icon
					$("#loadingUserHead").fadeOut(250, function() {
						$(this).hide();
						//show user head
						$("#userHead").fadeIn(250, function() {
							$(this).removeClass("hide");
						})
					})
				})
				//array for search bar autocomplete
				var tenantNames = [
					{
						label: "Bea Curran (101 010 100)",
						tenantid: "t_1d",
						refnumber: "101010100"
					},
					{
						label: "Kevin Owen (101 010 300)",
						tenantid: "t_2d",
						refnumber: "101010300"
					},
					{
						label: "Briana Holloway (101 010 200)",
						tenantid: "t_3d",
						refnumber: "101010200"
					},
					{
						label: "Zakary Neville (101 010 400)",
						tenantid: "t_4d",
						refnumber: "101010400"
					},
					{
						label: "Aleksandra Hyde (101 010 500)",
						tenantid: "t_5d",
						refnumber: "101010500"
					},
					{
						label: "Amari O'Reilly (101 020 100)",
						tenantid: "t_6d",
						refnumber: "101020100"
					},
					{
						label: "Jan Garrison (101 020 300)",
						tenantid: "t_7d",
						refnumber: "101020300"
					},
					{
						label: "Kevin Owen (102 010 200)",
						tenantid: "t_8d",
						refnumber: "102010200"
					},
					{
						label: "Pamela Daugherty (102 010 100)",
						tenantid: "t_9d",
						refnumber: "102010100"
					},
					{
						label: "Vernon Kirkland (101 010 101)",
						tenantid: "t_10d",
						refnumber: "101010101"
					},
					{
						label: "Jacob Connolly (102 020 100)",
						tenantid: "t_11d",
						refnumber: "102020100"
					}
				];
				
				// mengambil data yang approved atau occupy dari firebase ke dalam list
				var trRef = firebase.database().ref().child("tenant-room");
				trRef.on('child_added', function(snapshot) {
					var tenantID = snapshot.key;
					trRef1=trRef.child(snapshot.key);
					trRef1.once('child_added', function(snapshot) {
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
								newObj = {
									"label":full_name +' ('+refN+')',
									"tenantid":tenantID,
									"refnumber":refNumber
								}
								tenantNames.push(newObj);
								//start search bar autocomplete
								$("#searchbar").autocomplete({
									source: function(request, response) {
										var results = $.ui.autocomplete.filter(tenantNames, request.term);
										response(results.slice(0, 10));
									},
									select: function(event, ui) {
										window.location = "tenant_details.html?id="+ui.item.tenantid;
										return false;
									}
								});
								$("#bsearch").on("click", function() {
									$("#searchbar").autocomplete("search");
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
								//start search bar autocomplete
								$("#searchbar").autocomplete({
									source: function(request, response) {
										var results = $.ui.autocomplete.filter(tenantNames, request.term);
										response(results.slice(0, 10));
									},
									select: function(event, ui) {
										window.location = "tenant_details.html?id="+ui.item.tenantid;
										return false;
									}
								});
								$("#bsearch").on("click", function() {
									$("#searchbar").autocomplete("search");
								});
							});
						} else {
							// jika status sudah bukan approved atau active
							for (i=0;i<tenantNames.length;i++){
								if(tenantNames[i].refnumber==refNumber){
									tenantNames.splice(i,1);
									//start search bar autocomplete
									$("#searchbar").autocomplete({
										source: function(request, response) {
											var results = $.ui.autocomplete.filter(tenantNames, request.term);
											response(results.slice(0, 10));
										},
										select: function(event, ui) {
											window.location = "tenant_details.html?id="+ui.item.tenantid;
											return false;
										}
									});
									$("#bsearch").on("click", function() {
										$("#searchbar").autocomplete("search");
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
								//start search bar autocomplete
								$("#searchbar").autocomplete({
									source: function(request, response) {
										var results = $.ui.autocomplete.filter(tenantNames, request.term);
										response(results.slice(0, 10));
									},
									select: function(event, ui) {
										window.location = "tenant_details.html?id="+ui.item.tenantid;
										return false;
									}
								});
								$("#bsearch").on("click", function() {
									$("#searchbar").autocomplete("search");
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
				//start search bar autocomplete
				$("#searchbar").autocomplete({
					source: function(request, response) {
						var results = $.ui.autocomplete.filter(tenantNames, request.term);
						response(results.slice(0, 10));
					},
					select: function(event, ui) {
						window.location = "tenant_details.html?id="+ui.item.tenantid;
						return false;
					}
				});
				$("#bsearch").on("click", function() {
					$("#searchbar").autocomplete("search");
				});
				setTimeout(function(){
					//stop loading icon
					$("#loadingSearchBlock").fadeOut(250, function() {
						$(this).hide();
						//show search bar
						$("#searchBlock").fadeIn(250, function() {
							$(this).removeClass("hide");
						})
					})
				}, 1000);
			}
		})
	//no user signed in
	} else {
		window.location = "index.html";
	}
})

function logout(){
	
	firebase.auth().signOut();
	
}