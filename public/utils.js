
$(document).ready(function () {
  $(function() {
  //$( "#selectable" ).selectable();
    $( "#tabs" ).tabs().find( ".ui-tabs-nav" ).sortable({ axis: "x" });
  });
  $("#send").click(function(){
    //var tabnum = ($tabs.tabs('option', 'selected')*1)+1;
    $('#tabs-'+currTab+' ul').append('<li>' + $('#entry').val() + '</li>');
    localStorage.setItem("tabs-"+currTab,(localStorage.getItem("tabs-"+currTab)||"")+'<li>' + $('#entry').val() + '</li>');
    //alert("tabs-"+currTab+" : "+localStorage.getItem("tabs-"+currTab));
    $('#entry').val("").focus();
  });
  $("#share").click(function(){
  	//alert("here");
  	$('body').append("<div id='hover' style='position:absolute;top:50px;left:50px;width:800px;height:600px;z-index:9999;'><iframe src='upload.html' width=800 height=400></iframe></div>");
  });
  $('#entry').click(function(){$('#entry').val("")});
  $("#selectable li").click(function(){
	addTab($(this).text());
  });
  $( "button" ).button();

var currTab = "Main";
		var tab_counter = 0;

		var $tabs = $( "#tabs").tabs({
			tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
			add: function( event, ui ) {
				$( ui.panel ).append( "<ul>"+(localStorage.getItem("tabs-"+$(ui.tab).text())||"")+"</ul>" );
			},
			select: function(e, ui) {
        		currTab=($(ui.tab).text());
    		}
		});


		function addTab(title) {
			$tabs.tabs( "add", "#tabs-" + title, title );
			tab_counter++;
		}

		$( "#tabs span.ui-icon-close" ).live( "click", function() {
			var index = $( "li", $tabs ).index( $( this ).parent() );
			$tabs.tabs( "remove", index );
			tab_counter--;
		});
                
   
  addTab("Main");

});


