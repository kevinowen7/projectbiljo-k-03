$(document).ready(function() {
	
	//BOOKING LIST
	//select table to work with jquery datatables
	var table1 = $('#data-table').DataTable({
		"aLengthMenu": [[5, 10, -1], [5, 10, "All"]],
		"iDisplayLength": 5,
		"paging":false,
		"order": [],
		"columnDefs": [
			{
				targets: -1,
				orderable:false,
				className: 'dt-head-center'
			},
			{
				targets: 0,
				width: "11%",
				orderable:false,
				className: 'dt-head-center'
			},
			{
				targets: 1,
				width: "11%",
				className: 'dt-head-center'
			},
			{
				targets: 2,
				width: "18%",
				className: 'dt-head-center'
			},
			{
				targets: 3,
				width: "5%",
				className: 'dt-head-center'
			},
			{
				targets: 4,
				width: "5%",
				className: 'dt-head-center'
			},
			{
				targets: 5,
				width: "5%",
				className: 'dt-head-center'
			},
			{
				targets: 6,
				width: "28%",
				className: 'dt-head-center'
			},
			{
				targets: 7,
				className: 'dt-head-center'
			}
			
		]
    })
})