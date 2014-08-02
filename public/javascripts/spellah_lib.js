

function getWords() {
    return ['Lorem ipsum'];
}

function highlightWords(arr){

    $('textarea').highlightTextarea({
    words: arr
  });

}

function getNGrams(){

    var ngrams = 4;

    var str = jQuery("textarea#demo").val();

    if(!str){
        alert('Value is empty');
        return;
    }
    //alert(thought);

    var arr = str.split(/[ ,]+/).filter(Boolean);

    if(arr.length <= ngrams){
        return {0:str};
    }

    //alert(arr.toString());
    var data = [];
    var id = 0;
    
    for (var i = 0; i < arr.length; i++) {

        if(i + ngrams > arr.length){
            break;
        }

        var str = "";
        for(var j = 0; j < ngrams; j++){
            str = str + " ";
            str = str.concat(arr[i + j]);
        }

        id++;
        //data.push({ label: id, value: str });
        data.push(str);
        str = "";
    }

    //alert(arr.toString());

    return data;


    //очищаем поле ответа
    /*document.getElementById("response").innerHTML = "";

    for (var key in data) {
      if (key === 'length' || !data.hasOwnProperty(key)) continue;
      var value = data[key];


      httpGet("/check?q=" + value.value, value.value);

      //alert(value.value);
    }*/

    //alert(data.toString());
}

function init(){
    
    $('#myform').submit(function() {
      return false;
    });


    var myEl = document.getElementById('getit');

    myEl.addEventListener('click', function() {
    
    var arr = getNGrams();

    document.getElementById("response").innerHTML = "";

    for (var key in arr) {

      //alert(arr[key]);

      httpGet("/check?q=" + arr[key], arr[key]);

      //alert(value.value);
    }

        //alert(arr.toString());
    }, false);

    highlightWords(getWords());
}

function httpGet(theUrl, ngramBlock){
    //document.write(theUrl);
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.onreadystatechange = function(){handleReadyStateChange(ngramBlock)};
    xmlHttp.send(null);

    function handleReadyStateChange(block) {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          document.getElementById("response").innerHTML += block + " " + xmlHttp.responseText + "</br >";
        }
      }
    }
}