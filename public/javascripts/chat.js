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
               $("#userlist").append('<li id="' + i + '">' + n + '</li>');

           });
           $("#userlist").append('</ul>');
           $("#dialog").prepend('<div class="speech_item">' + data.user.userName +  '加入了聊天</div>');
       },
       onLogout:function(data){
           $("#userlist").empty();
           $("#userlist").append('<h4>在线用户('+data.onlineCount+'人)</h4><ul>');
           $.each(data.onlineUsers,function(i,n){
               $("#userlist").append('<li id="' + i + '">' + n + '</li>');
           });
           $("#userlist").append('</ul>');
           $("#dialog").prepend('<div class="speech_item">' + data.user.username +  '退出了聊天</div>');
       },
       onMessage:function(data){
           $("#dialog").prepend('<div class="speech_item">' + data.username + ' <br> ' + data.time + '<div style="clear:both;"></div><p class="triangle-isosceles top">' + data.content + '</p> </div>');
       },
       login:function(){
           name = prompt('输入你的名字：', '');
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
           })
       }
   }

    //初始化
    chat.init();
    //发送消息
    $('#msg_form').submit(function(){
        var content = $('#textarea').val().replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        if(content == ''){
            alert('请输入需要发表的内容');
            return false;
        }
        chat.socket.emit('message',{
            userid: chat.userId,
            username: chat.userName,
            content: content
        });
        $('#textarea').val('');
        return false;
    });
    //清屏
    $("#clear").click(function () {
        $("#dialog").html('');
    });
});
