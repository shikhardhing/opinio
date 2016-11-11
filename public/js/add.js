$(document).ready(function(){
	var opts=2;
	$(".add").on('click', function() {
		var i=opts+1;
		if(opts<10){
			$(".options").append('<input type="field" id="'+i+'" placeholder="Option'+i+'"></input>');
			opts++;
		}
	});
	$(".submit").on('click', function() {
		var str='{"countOptions":"'+opts;
		str+='", "question":"' +$("#question").val();
		for (var i = 1; i <= opts; i++) {
			str+='", "option'+i+'":"'+$("#"+i).val();
		}
		str+='"}';
		console.log(str);
		$.ajax({
			url: '/addquestion',
			type: 'POST',
			data:str,
			contentType:"application/json"
		})
		.done(function(data) {
			console.log(data);
			window.location=data;
		});
	});
	$.get('/getcookie', function(c) {
		if(c.twitterID){
			$(".notsignedin").css('display','none');
			$(".signedin").css('display', 'initial');
			$(".name").html(c.name);
		}
	});
	$(".logout").on('click', function() {
		$.get('/logout', function(data) {
			$(".notsignedin").css('display','initial');
			$(".signedin").css('display', 'none');
		});
	});
});