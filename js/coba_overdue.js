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


// mengambil data dari firebase
var trRef = firebase.database().ref().child("payment");
trRef.on('child_added', function(snapshot) {
    var tenantID = snapshot.key;
    var refN =snapshot.child("refnumber").val()
    var trRef2 = firebase.database().ref().child("payment/"+tenantID);
    
    trRef2.on('value', function(snapshot) {
        var id=snapshot.key
        var due = snapshot.child("balance").val();
        console.log(id,due)
        
        if(due!=null && due!=0){
            var angkaDue = parseInt(due)
            a=0
            date=""
            refN=""
            trRef2.on('child_added', function(snapshot) {
                
                var desc = snapshot.child("desc").val()
                if (desc!=null){
                if (desc.includes("Payment")){
                    if (a==0){
                        
                        date+=snapshot.child("date").val()
                    }
                    else{
                        date2=snapshot.child("date").val()
                        diff = Date.parse(date2) - Date.parse(date)
                        diff2 =Math.floor(diff / 86400000)
                        if (diff2>=0){
                            date=date2
                        }
                        else{
                            date=date
                        }
                    }
                }
                ++a
                }
            })
            if (a!=0){
                console.log(id,date)
            }
        }
    })
});
