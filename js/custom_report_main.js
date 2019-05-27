var table = $('#reporttable').DataTable({
	"aLengthMenu": [[10, 20, -1], [10, 20, "All"]],
	"iDisplayLength": -1,
	"paging": false,
	"ordering": false
});

$(document).ready(function() {

	setTimeout(function(){
		$("#cover-spin").fadeOut(250, function() {
			$(this).hide();
		})
	}, 2000);

});