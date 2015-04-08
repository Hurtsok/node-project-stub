block('content').content()(function(){
   if(!this.data.readme){
       return {
           block: 'docs',
           content: '<h1>Описание данного блока не существует!</h1>'
       }
   }else{
       return {
           block: 'docs',
           content: this.data.readme
       }
   }
});