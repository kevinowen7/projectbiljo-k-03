function changePass() {

	//firebase auth listener
	firebase.auth().onAuthStateChanged(function(user) {
		//user signed in
		if (user) {
			//get current user data
			var currentUser = firebase.auth().currentUser;
			var currentPassword = sha256(document.getElementById("userpass").value);
			var newPassword = sha256(document.getElementById("confpass").value);
			//create credential of current user
			var credentials = firebase.auth.EmailAuthProvider.credential(
				currentUser.email,
				currentPassword
			);
			//re-authenticate current user
			currentUser.reauthenticateAndRetrieveDataWithCredential(credentials).then(function() {
				//user re-authenticated.
				currentUser.updatePassword(newPassword).then(function() {
					//update successful.
					alert("Password changed successfully");
					location.reload();
				}).catch(function(error) {
					window.alert("Error "+error.code+" : "+error.message);
				});
			}).catch(function(error) {
				window.alert("Error "+error.code+" : "+error.message);
			});
		}
	})
	
}

function triggerHappy() {
	
	//trigger file browser when picture is clicked
	$("#fileButton").trigger("click");
	if (document.getElementById("fileButton").value != "") {
		document.getElementById("bfinish").disabled = false;
	}
	
}

function confirmation() {
	
	//confirmation dialog box
	var conf = confirm("Apakah anda yakin ingin menggunakan gambar ini?");
	if (conf == true) {
		updateProfilePic();
	}
	
}

function updateProfilePic() {
	
	//lock and hide button
	document.getElementById("bfinish").disabled = true;
	document.getElementById("bfinish").classList.add("hidden");
	//collect required data for upload
	var photo = document.getElementById("prepiew1").src;
	var username = document.getElementById("currentUserame").value;
	var realname = document.getElementById("fileName2").value;
	var filename = username+".jpg";
	var progBar = document.getElementById('progBar1');
	var storageRef = firebase.storage().ref("images/profile/"+filename);
	var task = storageRef.putString(photo, 'data_url');
	document.getElementById("progBared1").classList.remove("hidden");
	//start uploading
	task.on('state_changed',
		//progressbar animation
		function progress(snapshot) {
			var percentage = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
			progBar.style = "width: "+percentage+"%";
		},
		function error(err) {
			window.alert("Error "+err.code+" : "+err.message);
		},
		function complete() {
			//update to database
			const dbRef = firebase.database().ref().child("admin/"+username);
			dbRef.update({
				profilepic : filename
			}).then(function onSuccess(res) {
				location.reload();
			}).catch(function onError(err) {
				window.alert("Error "+err.code+" : "+err.message);
			})
		}
	)
	
}

$(document).ready(function() {
	
	//firebase auth listener
	firebase.auth().onAuthStateChanged(function(user) {
		//user signed in
		if (user) {
			var user = firebase.auth().currentUser;
			var username = user.email.split("@")[0];
			document.getElementById("currentUserame").value = username;
			const check = firebase.database().ref().child("admin/"+username);
			//check if photo exist
			check.once('value', function(snapshot) {
				var photo = snapshot.child("profilepic").val();
				//photo exist
				if (photo != "empty") {
					//download image from storage
					var strRef = firebase.storage().ref().child('images/profile/'+photo);
					strRef.getDownloadURL().then(function(url) {
						document.getElementById("prepiew1").src = url;
						document.getElementById("fileName1").value = url;
					}).catch(function(error) {
						window.alert("Error "+error.code+" : "+error.message);
					})
				} else {
					document.getElementById("fileName1").value = "img/empty-photo.jpg";
				}
			})
		}
	})
	//picture listener
	$('#prepiew1').on('load', function () {
		if (($(this).attr('src') != "img/empty-photo.jpg")&&($(this).attr('src') != document.getElementById("fileName1").value)) {
			document.getElementById("bfinish").disabled = false;
		}
	})
	//file input listener
	$("#fileButton").change(function() {
		if (this.files && this.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#prepiew1').attr('src', e.target.result);
			}
			reader.readAsDataURL(this.files[0]);
			document.getElementById("fileName2").value = this.files[0].name;
		}
	})
	
})

//jquery form validation
$().ready(function() {
	
	$.validator.addMethod("notEqual", function(value, element, param) {
		return this.optional(element) || value != $(param).val();
	}, "This has to be different.");
	$("#changePassForm").validate({
		submitHandler: function() {
			//what to do after submit
			changePass();
		},
		rules: {
			userpass: {
				required: true,
				minlength: 8
			},
			newpass: {
				required: true,
				minlength: 8,
				notEqual: "#userpass"
			},
			confpass: {
				required: true,
				minlength: 8,
				equalTo: "#newpass"
			}
		},
		messages: {
			userpass: {
				required: "Please provide a password",
				minlength: "Your password must be at least 8 characters long"
			},
			newpass: {
				required: "Please provide a password",
				minlength: "Your password must be at least 8 characters long",
				notEqual: "Your new password must not be the same as the current password"
			},
			confpass: {
				required: "Please provide a password",
				minlength: "Your password must be at least 8 characters long",
				equalTo: "Please enter the same password as above"
			}
		}
	})

})