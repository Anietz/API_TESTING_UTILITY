import { Component } from '@angular/core';
import { HttpClient,HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { map } from "rxjs/operators";
import  { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  formData:any = {};
  submitAttempt:boolean= false;
  isLoading:boolean = false;
  baseUrl;
  method:string="post";
  rootUrl = "http://getdevapi.eskor.com.ng/api/v1/auth/register";
  showResponse:boolean=false;
  response:any="";
  prettyOutput:any="";
  history:any="";
  header:string="";
  showForm:boolean= true;

  constructor(public http:HttpClient,public toastr:ToastrService) { 

    this.formData = [{id:1,name:"email",value:""},{id:2,name:"password",value:""},{id:3,name:"name",value:""}];

    if(localStorage.getItem("history")){
        this.history = JSON.parse(localStorage.getItem("history"));
        this.history = this.history.reverse();
    }

    this.baseUrl = this.rootUrl;
}

checkForm(){
  if(this.method == "get" || this.method == "delete"){
      this.showForm = false;
  }else{
    this.showForm = true;
  }
}

delete(form){
  const index = this.formData.indexOf(form);
  this.formData.splice(index, 1);
  //console.log(form)
}

addForm(){
  if(this.formData.length > 0){
    let id = this.formData[this.formData.length - 1].id + 1;
    this.formData.push({id:id,name:"",value:""});
  }else{
    this.formData.push({id:1,name:"",value:""});
  }
  
}

showToast(title,body,type){
  switch(type){
      case "error":
      this.toastr.error(title,body);
      break;
      case "success":
      this.toastr.success(title,body);
      break;
      case "info":
      this.toastr.info(title,body);
      break;
  }
}


sendRequest(){
  if(this.baseUrl){
      if(this.method){
          this.processRequest(this.method);
      }else{
        this.showToast("Error","Please select a request method","error");
      }

  }else{
    this.baseUrl = this.rootUrl;
    this.showToast("Error","Please enter a BaseURL: "+this.rootUrl,"error");
  }
}

saveLoginHistory(){
  if(localStorage.getItem("history")){
    this.history = JSON.parse(localStorage.getItem("history"));

    let id = this.history[this.history.length - 1].id + 1;
    this.history.push({"id":id,"method":this.method.toUpperCase(),statusCode:200,"url":this.baseUrl,"status":"200 OK"});
    localStorage.setItem("history",JSON.stringify(this.history));
  }else{
    this.history = [{"id":1,"method":this.method.toUpperCase(),statusCode:200,"url":this.baseUrl,"status":"200 OK"}];
    localStorage.setItem("history",JSON.stringify(this.history));
}
this.history = this.history.reverse();
}

saveErrorHistory(error){
  if(localStorage.getItem("history")){
    this.history = JSON.parse(localStorage.getItem("history"));
    let id = this.history[this.history.length - 1].id + 1;
    this.history.push({"id":id,"method":this.method.toUpperCase(),"url":this.baseUrl,"statusCode":error.status,"status":error.status+" BAD"});
    localStorage.setItem("history",JSON.stringify(this.history));
  }else{
      this.history = [{"id":1,"method":this.method.toUpperCase(),"url":this.baseUrl,"statusCode":error.status,"status":error.status+" BAD"}];
      localStorage.setItem("history",JSON.stringify(this.history));
  }
  this.history = this.history.reverse();
} 


processRequest(requestType){
  console.log(this.formData);

  let httpOptions;

    if(this.header != ""){
        httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/x-www-form-urlencoded',
          'Authorization': 'Bearer '+this.header
        })
      };
    }else{
        httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/x-www-form-urlencoded'
        })
      };
    }


     //let bodyString = "'"+"{"; //for json
     let bodyString = "";
     if(this.formData.length > 0){
       for(let x = 0;x <this.formData.length;x++){
   
          if(x == (this.formData.length-1) ){
         //   //bodyString += '"'+this.formData[x].name+'"'+':'+'"'+this.formData[x].value+'"'+"}'";
            bodyString += this.formData[x].name+"="+this.formData[x].value;
          }else{
         //   //bodyString += '"'+this.formData[x].name+'"'+':'+'"'+this.formData[x].value+'"'+",";
            bodyString += this.formData[x].name+"="+this.formData[x].value+"&";
         }
          
       }
     }

      switch(requestType.toUpperCase()){
          case "GET":
          this.http.get(`${this.baseUrl}`,httpOptions).pipe(map((res: any) => res)).subscribe((res)=>{
            this.showResponse = true;
            this.response = res;
            this.response.status = 200;
            this.prettyOutput = JSON.stringify(res, null, 2);
            //console.log(res);
            
             this.saveLoginHistory();
          },(error)=>{
            console.log(error);
            this.showResponse = true;
            this.response = error
            this.prettyOutput = JSON.stringify(error, null, 2);
            this.saveErrorHistory(error);
          });
          break;
          case "POST":
          this.http.post(`${this.baseUrl}`,bodyString,httpOptions).pipe(map((res: any) => res)).subscribe((res)=>{
            this.response = res;
            this.response.status = 200;
            this.prettyOutput = JSON.stringify(res, null, 2);
            console.log(res);
            this.saveLoginHistory();
            
            
          },(error)=>{
            console.log(error);
            this.showResponse = true;
            this.response = error
            this.prettyOutput = JSON.stringify(error, null, 2);
            this.saveErrorHistory(error);
          })

          break;
          case "PUT":
          this.http.put(`${this.baseUrl}`,bodyString,httpOptions).pipe(map((res: any) => res)).subscribe((res)=>{
            this.response = res;
            this.response.status = 200;
            this.prettyOutput = JSON.stringify(res, null, 2);
            //console.log(res);
            this.saveLoginHistory();
            
            
          },(error)=>{
            console.log(error);
            this.showResponse = true;
            this.response = error
            this.prettyOutput = JSON.stringify(error, null, 2);
            this.saveErrorHistory(error);
          })
          break;
          case "DELETE":
          this.http.delete(`${this.baseUrl}`,httpOptions).pipe(map((res: any) => res)).subscribe((res)=>{
            this.showResponse = true;
            this.response = res;
            this.response.status = 200;
            this.prettyOutput = JSON.stringify(res, null, 2);
            //console.log(res);
            
             this.saveLoginHistory();
          },(error)=>{
            console.log(error);
            this.showResponse = true;
            this.response = error
            this.prettyOutput = JSON.stringify(error, null, 2);
            this.saveErrorHistory(error);
          });
          break;
      }
}

 formatJson(json) {
  if (typeof json != 'string') {
       json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
}

submitForm(form){

  this.submitAttempt = true;

    if(form.valid){
      let  httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'x-access-token': ''
        })
      };
      this.isLoading = true;
      let body = this.formData;
      this.http.post(`${this.baseUrl}/auth/activate_account`,body,httpOptions).pipe(map((res: any) => res)).subscribe((res)=>{
        this.isLoading = false;
        //localStorage.setItem("user",JSON.stringify(res.data.user));
        
      },(e)=>{
        this.isLoading = false;
          if(e.error.message){
                       
          }
      })
    }
    
  }



}
