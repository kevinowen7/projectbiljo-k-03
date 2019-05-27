$(document).ready(function() {
	
	//select table to work with jquery datatables
	var table = $('#data-table').DataTable({
		"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
        "iDisplayLength": 10,
		"sPaginationType": "full_numbers",
		"order": [[ 0, "asc" ]],
		"columnDefs": [
		{
			targets: 0,
			width: "11%"
		},
		{ 
			targets: -1,
			width: "12%",
			orderable: false,
			defaultContent:"<button id='editbutt' class='btn btn-xs btn-warning' title='Edit'><i class='fa fa-pencil'></i></button> <button id='extend' class='btn btn-xs btn-info' title='Extend'><i class='fa fa-user-plus'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Remove'><i class='fa fa-times'></i></button> <button id='terminatebutt' class='btn btn-xs btn-danger' title='Terminate'><i class='fa fa-sign-out'></i></button>"
		}]
	})
	
	table.row.add(["<a href='javaScript:void(0)'>01</a>","09/07/2018","Jl. Dipatiukur","02","02","04","Jeremia Raymond","081282829392",null]).node().id = 'booking1';
	table.row.add(["<a href='javaScript:void(0)'>02</a>","12/17/2018","Jl. Dipatiukur1","12","22","74","Kevin Owen","089273788282",null]).node().id = 'booking2';
	table.row.add(["<a href='javaScript:void(0)'>06</a>","10/09/2018","Jl. Dipatiukur2","03","22","24","Wendy Wendy","082219493933",null]).node().id = 'booking3';
	table.draw();
	
	var table2 = $('#data-table2').DataTable({
		"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
        "iDisplayLength": 10,
		"sPaginationType": "full_numbers",
		"order": [[ 0, "asc" ]],
		"columnDefs": [
		{ 
			targets: 0,
			width: "30%"
		},
		{ 
			targets: -1,
			width: "20%",
			orderable: false,
			defaultContent:"<button id='editbutt' class='btn btn-xs btn-warning' title='Edit'><i class='fa fa-pencil'></i></button> <button id='extend' class='btn btn-xs btn-info' title='Extend'><i class='fa fa-user-plus'></i></button> <button id='removebutt' class='btn btn-xs btn-danger' title='Remove'><i class='fa fa-times'></i></button> <button id='terminatebutt' class='btn btn-xs btn-danger' title='Terminate'><i class='fa fa-sign-out'></i></button>"
		}]
	})
	table2.row.add(["<a href='javaScript:void(0)'>Bea Curran</a>","101 010 100","9/20/2018",null]);
	table2.row.add(["<a href='javaScript:void(0)'>Briana Holloway</a>","101 010 200","9/28/2018",null]);
	table2.draw();
	setTimeout(function(){
		//stop loading icon
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
	}, 1000);
	//add tenant button listener
	$("#baddt").on('click', function() {
		window.location = "tenant_add.html";
	})
	
});