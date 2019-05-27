//firebase auth listener
firebase.auth().onAuthStateChanged(function(user) {
	//start loading icon
	$("#loadingTable").fadeIn(250, function() {
		$(this).removeClass("hide");
	})
	//user signed in
	if (user) {
		//get current user data
		var userEmail = firebase.auth().currentUser.email;
		var userName = userEmail.split("@")[0];
		const check = firebase.database().ref("admin/"+userName);
		//check if user has privilege
		check.on('value', function(snapshot) {
			//when user has no privilege
			if (snapshot.child("privilege").val() != 1) {
				window.location = "home.html";
			} else {
				//START PAGE JS
				//select table to work with jquery datatables
				var table = $('#data-table').DataTable({
					"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
					"iDisplayLength": -1,
					"sPaginationType": "full_numbers",
					"order": [[ 0, "asc" ]],
					"columnDefs": 
					[{ 
						targets: -1,
						orderable: false, 
						width: "10%"
					}]
				});
				$("#cover-spin").fadeOut(250, function() {
					$(this).hide();
				})
				//input data from database to table
				var dbRef = firebase.database().ref("admin");
				dbRef.on('child_added', function(snapshot) {
					var stat = snapshot.child("stat").val();
					var email = snapshot.child("email").val();
					var username = email.split("@")[0];
					var contactno = snapshot.child("contactno").val();
					var privilege = snapshot.child("privilege").val();
					if (privilege == 1) {
						var role = "Superadmin";
					} else if (privilege == 2) {
						var role = "Admin";
					}
					if (stat == 1 && privilege != 1) {
						table.row.add([email,contactno,role,"<button id='removebutt' class='btn btn-xs btn-danger'><i class='fa fa-trash-o'></i></button>"]).node().id = 'usr'+username;
						table.draw();
					} else if (stat == 1 && privilege == 1) {
						table.row.add([email,contactno,role,null]).node().id = 'usr'+username;
						table.draw();
						//stop loading icon
						$("#loadingTable").fadeOut(250, function() {
							$(this).hide();
						})
					}
				})
				//remove row when an admin is deleted
				dbRef.on('child_changed', function(snapshot) {
					//start loading icon
					$("#loadingTable").fadeIn(250, function() {
						$(this).removeClass("hide");
					})
					var stat = snapshot.child("stat").val();
					var email = snapshot.child("email").val();
					var username = email.split("@")[0];
					var contactno = snapshot.child("contactno").val();
					var privilege = snapshot.child("privilege").val();
					if (privilege == 1) {
						var role = "Superadmin";
					} else if (privilege == 2) {
						var role = "Admin";
					}
					var row = table.row('#usr'+username);
					if (stat == 0) {
						row.remove();
						table.draw(false);
					} else if (stat == 1 && privilege != 1) {
						row.remove();
						table.row.add([email,contactno,role,"<button id='removebutt' class='btn btn-xs btn-danger'><i class='fa fa-trash-o'></i></button>"]).node().id = 'usr'+username;
						table.draw(false);
					} else if (stat == 1 && privilege == 1) {
						row.remove();
						table.row.add([email,contactno,role,null]).node().id = 'usr'+username;
						table.draw(false);
						//stop loading icon
						$("#loadingTable").fadeOut(250, function() {
							$(this).hide();
						})
					}
				})
				//remove button listener
				$('#data-table tbody').on('click', '#removebutt', function () {
					var conf = confirm("Apakah anda yakin ingin menghapus user berikut?")
					if (conf) {
						//get row data
						var row = table.row($(this).parents('tr'));
						var data = row.data();
						//variables for reference
						var email = data[0];
						var userName = email.split("@")[0];
						var dbRef = firebase.database().ref().child("admin/"+userName);
						//remove profile picture
						dbRef.once('value', function(snapshot) {
							if (snapshot.child("profilepic").val() != "empty") {
								const gambar = userName+".jpg";
								const storageRef = firebase.storage().ref().child('images/profile/'+gambar);
								storageRef.delete().catch(function(error) {
									window.alert("Error "+error.code+" : "+error.message);
								})
								//change status from database
								dbRef.update({
									profilepic : "empty",
									stat : 0
								}).catch(function onError(err) {
									window.alert("Error "+err.code+" : "+err.message);
								})
							} else {
								//change status from database
								dbRef.update({
									stat : 0
								}).catch(function onError(err) {
									window.alert("Error "+err.code+" : "+err.message);
								})
							}	
						})
						//stop loading icon
						$("#loadingTable").fadeOut(250, function() {
							$(this).hide();
						})
					}
				})
			}
		})
	}
})

function lockForm() {
	
	//lock form
	document.getElementById("email").readOnly = true;
	document.getElementById("password").readOnly = true;
	document.getElementById("confpassword").readOnly = true;
	document.getElementById("contactno").readOnly = true;
	document.getElementById("bfinish").disabled = true;
	document.getElementById("breset").disabled = true;
	
}

function unlockForm() {
	
	//unlock form
	document.getElementById("email").readOnly = false;
	document.getElementById("password").readOnly = false;
	document.getElementById("confpassword").readOnly = false;
	document.getElementById("contactno").readOnly = false;
	document.getElementById("bfinish").disabled = false;
	document.getElementById("breset").disabled = false;

}


function addAdmin() {

	lockForm();
	//start loading icon
	$("#loadingButton").fadeIn(250, function() {
		$(this).removeClass("hide");
	})
	//retrieve data in form
	var email = $("#email").val();
	var password = sha256($("#confpassword").val());
	var contactNo = $("#contactno").val();
	var userName = email.split("@")[0];
	const dbRefAdmin = firebase.database().ref("admin/"+userName);
	//check if user is registered on database
	dbRefAdmin.once('value', function(snapshot) {
		//when user exist
		if (snapshot.child("email").val() == email) {
			//stop loading icon
			$("#loadingButton").fadeOut(250, function() {
				$(this).hide();
			})
			alert("This email is already registered");
			unlockForm();
		//when user does not exist
		} else {
			//create a user in database
			dbRefAdmin.set({
				contactno : contactNo,
				email : email,
				privilege : 2,
				profilepic : "empty",
				stat : 1
			}).then(function onSuccess(res) {
				//create account in auth
				firebase.auth().createUserWithEmailAndPassword(email, password).then(function(firebaseUser) {
					//stop loading icon
					$("#loadingButton").fadeOut(250, function() {
						$(this).hide();
					})
					alert("New admin created successfully.")
					firebase.auth().signOut();
				}).catch(function(error) {
					//stop loading icon
					$("#loadingButton").fadeOut(250, function() {
						$(this).hide();
					})
					unlockForm();
					window.alert("Error "+error.code+" : "+error.message);
				})
			}).catch(function onError(err) {
				//stop loading icon
				$("#loadingButton").fadeOut(250, function() {
					$(this).hide();
				})
				unlockForm();
				window.alert("Error "+err.code+" : "+err.message);
			})
		}
	})
	
}

//jquery form validation
$().ready(function() {
	
	$("#addAdminForm").validate({
		submitHandler: function() {
			//what to do after submit
			addAdmin();
		},
		rules: {
			email: {
				required: true
			},
			password: {
				required: true,
				minlength: 8
			},
			confpassword: {
				required: true,
				minlength: 8,
				equalTo: "#password"
			},
			contactno: {
				required: true
			}
		},
		messages: {
			email: {
				required: "Please provide an email"
			},
			password: {
				required: "Please provide a password",
				minlength: "Your password must be at least 8 characters long"
			},
			confpassword: {
				required: "Please provide a password",
				minlength: "Your password must be at least 8 characters long",
				equalTo: "Please enter the same password as above"
			},
			contactno: {
				required: "Please provide a contact number"
			}
		}
	})

})