$(document).ready(function() {
	
	//select table to work with jquery datatables
	var table = $('#data-table1').DataTable({
		"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
        "iDisplayLength": 10,
		"sPaginationType": "full_numbers",
		"order": [[ 0, "asc" ]],
		"columnDefs": [
		{
			targets: 0,
			width: "7%"
		},
		{
			targets: 2,
			width: "17%"
		},
		{
			targets: 3,
			width: "25%"
		},
		{ 
			targets: -1,
			width: "15%",
			orderable: false,
			defaultContent:"<button id='removebutt' class='btn btn-xs btn-danger' title='Remove'><i class='fa fa-trash'></i></button>"
		}
		]
	})
	
	table.row.add(["<a href='javaScript:void(0)'>01</a>","Rental Due","Rp. 2.000.000,-","Rental Due","Monthly",null]).node().id = 'booking1';
	table.row.add(["<a href='javaScript:void(0)'>02</a>","Fine Due","Rp. 100.000,-","FINE 10%","One Time Only",null]).node().id = 'booking2';
	table.row.add(["<a href='javaScript:void(0)'>03</a>","Other Due","Rp. 250.000,-","Lamp & Wall Repair Invoice","One Time Only",null]).node().id = 'booking3';
	table.draw();
	
	
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