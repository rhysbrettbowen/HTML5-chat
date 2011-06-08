
$(document).ready(function () {
    
//Setup buttons
  $("button").button();

//Setup tabs
  	var myName="";
  	var tabList=[];
    var $tabs = $( "#tabs").tabs({
            tabTemplate: "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
            add: function(event,ui) {
                $(ui.panel).append( "<ul>"+(myTabs.getStore($(ui.tab).text())||"")+"</ul>" );
            },
            select: function(e, ui) {
                myTabs.current=($(ui.tab).text());
            },
            remove: function(event, ui){
                myTabs.tabList.splice($.inArray(myTabs.tabList,$(ui.tab).text()),1);
            }
    });
    $("#tabs span.ui-icon-close").live("click", function() {
            var index = $("li", $tabs).index( $( this ).parent() );
            $tabs.tabs( "remove", index );
    });
    var myTabs = {
        current: "Main",
        tabList: [],
        addTab: function(title){
            if($.inArray(title,this.tabList)==-1){
                this.tabList.push(title);
                $tabs.tabs("add","#tabs-"+title.toString(),title.toString());
            }
        },
        getStore: function(title){
            return (localStorage.getItem("tabs-"+title)||"");
        },
        setStore: function(title,data){
            localStorage.setItem("tabs-"+this.current,this.getStore(title)+data);
        },
        setCurrStore: function(data){
            this.setStore(this.current,data);
        },
        appendTab: function(title,data){
            this.addTab(title);
            this.setStore(title,data);
            $('#tabs-'+title+' ul').append(data);
        },
        appendCurr: function(data){
            this.appendTab(this.current,data);
        }
    };
    
    function sendServer(msg,to,type){
        return socket.send({msg:msg,type:type,to:to,from:myName});
    }
    
    function sendToAll(msg){
        return sendServer(msg,"all","broadcast");
    }
    
    function sendPrivate(msg,to){
        return sendServer(msg,to,"private");
    }
    
    
//Send Message
    $("#send").click(function(){
        if(myTabs.current==="Main"){
            sendToAll($('#entry').val());
        }
        else{
            sendPrivate($('#entry').val(),myTabs.current);
            myTabs.appendCurr('['+myName+']:'+$('#entry').val());
        }
        $('#entry').val("").focus();
    });

//Upload a file
    $("#share").click(function(){
        $('body').append("<div id='hover' style='position:absolute;top:100px;left:100px;width:800px;height:600px;z-index:9999;'><button id='close'>Close</button><scr"+"ipt>$('#close').click(function(){$('#hover').remove()});</scr"+"ipt><iframe src='upload.html?to="+myTabs.current+"&from="+myName+"' width=400 height=600></iframe></div>");
    });
    
    var users = {
        list: [],
        add: function(name){
            if(!this.check(name)){
                this.list.push(name);
                $("#selectable").append("<li class='ui-widget-content'>"+name+"</li>");
                $("#selectable li").unbind("click");
                $("#selectable li").click(function(){
                    if($(this).text()!==myName){
                        myTabs.addTab($(this).text());
                    }
                });
            }
        },
        check: function(name){
            return $.inArray(name,this.list)!=-1;
        },
        remove: function(name){
            $("#selectable li").each(function(){
                if($(this).text()==name){
                    $(this).remove();
                }
            });
        }
    };
  
    var reqParser = function(req){
        tab="Main";
        data="";
        show=false;
        if(req.scope&&req.scope=="private")
            tab=req.from;
        templateMessage = function(data,from){
            return "<li>["+from+"]: "+data+"</li>";
        };
        templateImage = function(data,from){
            return "<li>["+from+"]: <img src="+data+" /></li>"  
        };
        templateVideo = function(data,from){
            return '<li>['+from+']: <video preload="auto" src="'+data+'" autobuffer="autobuffer" controls="controls"></li>';
        };
        templateFile = function(data,from){
            return "<li>["+from+"]: <a href="+data+">"+data+"</a></li>";
        };
        var type = req.type;
        if(type==="message"){
            data = templateMessage(req.msg,req.from);
            show=true;
        }
        else if(type.indexOf("image")==0){
            data = templateImage(req.msg,req.from);
            show=true;
        }
        else if(type.indexOf("ogg")!=-1){
            data = templateVideo(req.msg,req.from);
            show=true;
        }
        else if(type==="addUser"){
            console.log(req.from);
            users.add(req.from);
        }
        else if(type==="delUser"){
            users.remove(req.from);
        }
        else if(type==="confirmNick"){
            myName = req.msg;
        }else if(type==="nickTaken"){
            sendServer(prompt(req.msg+" is taken, enter a different nickname"),"server","nickReq");
        }else{
            data = templateFile(req.msg,req.from);
            show = true;
        }
        return {show:show,tab:tab,data:data.toString()};
    }
  
  var socket = new io.Socket(null,{socket:3000,connectTimeout:30000});
  socket.connect();
  sendServer(prompt("enter a nickname"),"server","nickReq");
  
  
  socket.on('message', function(msg){
    console.log(msg);  
    myReq = reqParser(msg);
    if(myReq.show){
        myTabs.appendTab(myReq.tab,myReq.data);
    }
  });

    myTabs.addTab("Main");
    $('#entry').click(function(){$('#entry').val("")});
});


