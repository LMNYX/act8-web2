$( document ).ready(()=>
{
	// home page logo click
	$("#act8logo").click(async (e)=>{ window.location.href = "/"; });

	$(".member").click(async (e)=> {  window.location.href = "/dev/"+e.currentTarget.getAttribute("data-id"); });
	$(".game").click(async (e)=> { if(e.currentTarget.getAttribute("data-id") == -1){ return; } window.location.href = "/game/"+e.currentTarget.getAttribute("data-id"); });
	$(".game_obj").click(async (e)=> { window.location.href = "/game/"+e.currentTarget.getAttribute("data-id"); });
	$(".blogbutton").click(async (e)=> { window.location.href = "/blog/post/"+e.currentTarget.getAttribute("data-id"); });
	$(".game-screenshot").click(async (e) => {
		document.getElementsByClassName("game-screenshot-full")[0].src = (e.currentTarget.src);
		$(".game-screenshot-full").css('display', 'block');
		$(".full-blackout").css("display", "block");
		$("body").css('overflow', 'hidden');
		$(".close-screenshot").css("display", "block");
	});
	$(".close-screenshot,.full-blackout").click(async (e) => {
		$(".game-screenshot-full").css('display', 'none');
		$(".full-blackout").css("display", "none");
		$("body").css('overflow', 'auto');
		$(".close-screenshot").css("display", "none");
	});
	if(document.getElementById("YearGameDevCounter") != null &&
		document.getElementById("YearGameDevCounter") != undefined)
		document.getElementById("YearGameDevCounter").innerText = we_are_in_gamemaking()+" years";
});



function we_are_in_gamemaking()
{
	return (Math.ceil((new Date() - new Date(2015, 9, 3)) / 8.64e7)/365).toFixed(1);
}

function navbarRes() {
  var x = document.getElementById("_navbar");
  if (x.className === "_navbar") {
    x.className += " responsive";
  } else {
    x.className = "_navbar";
  }
}
