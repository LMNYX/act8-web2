$( document ).ready(()=>
{
	// home page logo click
	$("#act8logo").click(async (e)=>{ window.location.href = "/"; });

	$(".member").click(async (e)=> {  window.location.href = "/dev/"+e.currentTarget.getAttribute("data-id"); });
	$(".game_obj").click(async (e)=> { window.location.href = "/game/"+e.currentTarget.getAttribute("data-id"); })

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
