$(document).ready(function(){
	var twitterID;
$.ajax({
	url: window.location.pathname+'/pollDetail',
	type: 'GET',
	dataType: 'json'
})
.done(function(poll) {
		console.log(poll);
	$.ajax({
		url: window.location.pathname+'/pollValues',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(values) {
		console.log(poll);
		$(".question").html('<h3>'+poll.question+'</h3>');
		if(twitterID){
			if(twitterID==poll.madeby){
				$('.delete').css('display', 'inline-block');
			}
		}
		var label=[];var dat=[];
		for(var i=poll.countOptions;i>=1;i--){
			var o="option"+i;
			$(".options").prepend(poll[o]+' : '+values[o]+'<br>');
			$(".list").prepend('<option value="'+i+'">'+poll[o]+'</option');
			label.push(poll[o]);
			dat.push(values[o]);
		}
		var ctx = document.getElementById("myChart");
		var data = {
		    labels:label,
		    datasets: [
		        {
		            data: dat,
		            backgroundColor: [
		                "#36A2EB",
		                "#FFCE56",
		                "#6DD26E",
		                "#FF0A62",
		                "#B24FD9",
		                "#45F5CE",
		                "#4CEF9E",
		                "#FB8B46",
		                "#6DD26E",
		                "#FF0A62",
		            ]
		        }]
		};
		var myPieChart = new Chart(ctx, {
		    type: 'doughnut',
		    data: data
		});
		$("#tw").attr('href','https://twitter.com/intent/tweet?text='+poll.question+'&url='+window.location);
	});
});
$("#optionsid").change(function() {
	if($(this).val()=="custom")
		$(".another").css('visibility', 'visible');
	else
		$(".another").css('visibility', 'hidden');
});
$(".submit").on('click', function() {
	var dat=$("#optionsid").val();
	if(dat){
		var ne=0;
		if(dat=="custom"){
			dat=$(".another").val();
			ne=1;
		}
		if(!(ne==1&&dat=="")){
			$.ajax({		
				url: window.location.pathname+'/update',
				type: 'POST',
				data: '{"new":"'+ne+'", "opt":"'+dat+'"}',
				contentType:"application/json"
			})
			.done(function() {
				console.log("reload")
				window.location.reload();
			});
		}
		else{
			window.alert("input something");
		}
	}
	else{
		window.alert("select a option");
	}
});
$('.delete').on('click', function() {
	$.ajax({		
		url:window.location.pathname+'/delete',
		type: 'POST',
	})
	.done(function() {
		window.location='/';
	});
});
$.get('/getcookie', function(c) {
	if(c.twitterID){
		$(".notsignedin").css('display','none');
		$(".signedin").css('display', 'initial');
		$(".name").html(c.name);
		twitterID=c.twitterID;
	}
	if(c.done&&c.twitterID!=4665404898){
		$(".polled").css('display','none');
	}
});
$(".logout").on('click', function() {
	$.get('/logout', function(data) {
		$(".notsignedin").css('display','initial');
		$(".signedin").css('display', 'none');
	});
});
});