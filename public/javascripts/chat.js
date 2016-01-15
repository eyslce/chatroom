$(document).ready(function(){
   var chat={
       userId:null,
       userName:null,
       socket:null,
       init:function(){
           //判断是否登录
           if(!this.userName){
               this.login();
           }
       },
       getUid:function(){
           var date = new Date();
           return Math.floor((1 + Math.random()) * 0x100000000).toString(16)+date.getTime();
       },
       onLogin:function(data){
           $("#userlist").empty();
           $("#userlist").append('<h4>在线用户('+data.onlineCount+'人)</h4><ul>');
           $.each(data.onlineUsers,function(i,n){
               if(i==chat.userId){
                   $("#userlist").append('<li id="' + i + '">' + n + '</li>');
               }else{
                   $("#userlist").append('<li id="' + i + '"><a class="user_a" href="#" userId="'+i+'">' + n + '</a></li>');
               }
           });
           $("#userlist").append('</ul>');
           $("#dialog").prepend('<div class="speech_item">' + data.user.userName +  '加入了聊天</div>');
       },
       onLogout:function(data){
           $("#userlist").empty();
           $("#userlist").append('<h4>在线用户('+data.onlineCount+'人)</h4><ul>');
           $.each(data.onlineUsers,function(i,n){
               if(i==chat.userId){
                   $("#userlist").append('<li id="' + i + '">' + n + '</li>');
               }else{
                   $("#userlist").append('<li id="' + i + '"><a class="user_a" href="#" userId="'+i+'">' + n + '</a></li>');
               }
           });
           $("#userlist").append('</ul>');
           $("#dialog").prepend('<div class="speech_item">' + data.user.username +  '退出了聊天</div>');
       },
       onMessage:function(data){
           var content = data.content;
           if(data.color){
               content = '<span style="color:'+data.color+'">'+data.content+'</span>'
           }
           switch(data.content_type){
               case 'img':
                   content = '<a href="'+data.content+'" target="_blank"><img src="'+data.content+'" style="width:50px;height:100px;" /></a>';
                   break;
               default :break;
           }
           $("#dialog").prepend('<div class="speech_item">' + data.username + ' <br> ' + data.time + '<div style="clear:both;"></div><p class="triangle-isosceles top">' + content + '</p> </div>');
       },
       onPrivateMsg:function(data){
           if(data.to.userId==chat.userId){
               tab.addTab(data.from.userId,data.from.userName);
               $("#"+data.from.userId+'_msg').prepend('<div class="speech_item">' + data.from.userName + ' <br> ' + data.time + '<div style="clear:both;"></div><p class="triangle-isosceles top">' + data.msg + '</p> </div>');
           }else{
               $("#"+data.to.userId+'_msg').prepend('<div class="speech_item">' + data.from.userName + ' <br> ' + data.time + '<div style="clear:both;"></div><p class="triangle-isosceles top">' + data.msg + '</p> </div>');
           }
       },
       login:function(){
           var name = prompt('输入你的名字：', '');
           if (!name || name == null||name=='null') {
               alert("输入名字为空，请重新输入！");
               chat.login();
               return;
           }
           this.userId=this.getUid();
           this.userName=name.replace(/"/g, '\\"');
           $("#current_user").html('当前用户：' + this.userName);
           //连接服务器
           //this.socket=io('http://localhost:8000');
           this.socket=io('http://192.168.1.231:8000');
           //告诉服务器，有用户登录
           this.socket.emit('login',{userId:this.userId,userName:this.userName},function(data){
               console.log(data);
           });
           //监听用户上线
           this.socket.on('login',function(data){
               chat.onLogin(data);
           });
           //监听用户下线
           this.socket.on('logout',function(data){
               chat.onLogout(data);
           });
           //监听消息
           this.socket.on('message',function(data){
               chat.onMessage(data);
           });
           //私聊消息
           this.socket.on('private_msg',function(data){
               chat.onPrivateMsg(data);
           });
       }
   };
    //tab
    var tab = {
        addTab:function(tabId,tabName){
            if($('#'+tabId+'_tab').length>0){
                $('#'+tabId+'_tab').tab('show');
                return;
            }
            $('li[role="presentation"]').removeClass('active');
            $('div[role="tabpanel"]').removeClass('active');
            var li_html = '<li role="presentation" class="active"><a href="#'+tabId+'_tab" aria-controls="'+tabId+'_tab" role="tab" data-toggle="tab">'+tabName+'<span class="glyphicon glyphicon-remove" aria-hidden="true">&times;</span></a></li>';
            $('ul.nav-tabs').append(li_html);
            var div_html= '<div role="tabpanel" class="tab-pane active" id="'+tabId+'_tab"><div class="thumbnail"><div id="'+tabId+'_msg" class="caption" style="width:100%;height: 300px;overflow-y: auto;"></div></div></div>';
            $('div.tab-content').append(div_html);
            $('#'+tabId).tab('show');
        }
    };

    //初始化
    chat.init();
    //发送消息
    $('#msg_form').submit(function(){
        var content = $('#textarea').val().replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        if(content == ''){
            alert('请输入需要发表的内容');
            return false;
        }
        var color = $('#color').val();
        var active_tab = $('li.active').children('a[role="tab"]').attr('aria-controls');
        active_tab=active_tab.substring(0,active_tab.length-4);
        if(active_tab != 'all'){
            chat.socket.emit('private_msg',chat.userId,active_tab,content);
        }else{
            chat.socket.emit('message',{
                userid: chat.userId,
                username: chat.userName,
                content: content,
                color:color,
                content_type:'txt'
            });
        }
        $('#textarea').val('');
        return false;
    });
    //清屏
    $("#clear").click(function () {
        var active_tab = $('li.active').children('a[role="tab"]').attr('aria-controls');
        active_tab=active_tab.substring(0,active_tab.length-4);
        if(active_tab == 'all') {
            $("#dialog").html('');
        }else{
            $("#"+active_tab+'_msg').html('');
        }
    });
    //
    $("#all").tab('show');
    $('body').delegate('a.user_a','click',function(){
        tab.addTab($(this).attr('userId'),$(this).html());
    });
    $('#img').change(function(){
        if ($(this).length != 0) {
            //获取文件并用FileReader进行读取
            var file = this.files[0],
                reader = new FileReader();
            if (!reader) {
                alert('读取文件失败');
                $('#img').val('');
                return;
            }
            reader.onload = function(e) {
                //读取成功，显示到页面并发送到服务器
                $('#img').val('');
                chat.socket.emit('message',{
                    userid: chat.userId,
                    username: chat.userName,
                    content: e.target.result,
                    content_type:'img'
                });
            };
            reader.readAsDataURL(file);
        }
    });
});
