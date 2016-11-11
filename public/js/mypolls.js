$(document).ready(function(){
	$.ajax({
		url: document.location.origin+'/getmypolls',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(data) {
		console.log(data);
		var str="";
		for(var i in data){
			str+='<a class=" text-center list-group-item list-group-item-info" href="/'+data[i].id+'">'+data[i].question+'</a>';
		}
		$(".poll").html(str);
	});

	$.ajax({
		url: '/getcookie',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(c) {
		if(c.twitterID){
			$(".notsignedin").css('display','none');
			$(".signedin").css('display', 'initial');
			$(".name").html(c.name);
		}
	});
	$(".logout").on('click', function() {
		$.ajax({
			url: '/logout',
			type: 'GET',
		})
		.done(function() {
			$(".notsignedin").css('display','initial');
			$(".signedin").css('display', 'none');
		})
	});
});
